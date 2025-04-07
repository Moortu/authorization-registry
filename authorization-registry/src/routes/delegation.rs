use anyhow::Context;
use axum::extract::State;
use axum::http::HeaderMap;
use axum::middleware::from_fn_with_state;
use axum::response::{IntoResponse, Response};
use axum::{extract::Extension, routing::post, Json, Router};
use reqwest::header::ACCEPT;
use sea_orm::DatabaseConnection;
use serde::{Deserialize, Serialize};

use crate::error::{AppError, ErrorResponse};
use crate::middleware::extract_role_middleware;
use crate::services::delegation as delegation_service;
use crate::services::server_token::{Role, ServerToken};
use crate::AppState;
use ishare::delegation_request::DelegationRequestContainer;

pub fn get_delegation_routes(server_token: std::sync::Arc<ServerToken>) -> Router<AppState> {
    Router::new()
        .route("/", post(post_delegation))
        .layer(from_fn_with_state(server_token, extract_role_middleware))
}

#[derive(Deserialize, Serialize, utoipa::ToSchema)]
struct DelegationResponse {
    delegation_token: String,
}

/// Obtain Delegation Evidence
#[utoipa::path(
    post,
    path = "/delegation",
    tag = "Delegation",
    request_body(
        description="Delegation Request",
        content((DelegationRequestContainer))
    ),
    security(
        ("bearer" = [])
    ),
    responses(
        (
            status = 200,
            description = "OK. JSON with delegation evidence", 
            content_type = "application/json",
            body = DelegationResponse,
        ),
        (
            status = 400,
            description = "Malformed request", 
            content_type = "application/text/plain; charset=utf-8",
            body = String,
        ),
        (
            status = 401,
            description = "Unauthorized", 
            content_type = "application/json",
            example = json!(ErrorResponse::new("Unauthorized")),
        ),
    )
)]
#[axum_macros::debug_handler]
async fn post_delegation(
    headers: HeaderMap,
    Extension(db): Extension<DatabaseConnection>,
    Extension(role): Extension<Role>,
    app_state: State<AppState>,
    body: Json<DelegationRequestContainer>,
) -> Result<Response, AppError> {
    let delegation_evidence_container = delegation_service::create_delegation_evidence(
        &body.delegation_request,
        app_state.time_provider.clone(),
        app_state.de_expiry_seconds,
        &db,
    )
    .await?;

    let token = app_state
        .satellite_provider
        .create_delegation_token(&role.get_company_id(), &delegation_evidence_container)
        .context("Error creating delegation token")?;

    let response = match headers.get(ACCEPT).map(|x| x.as_bytes()) {
        Some(b"application/json") => Json(delegation_evidence_container).into_response(),
        _ => Json(DelegationResponse {
            delegation_token: token,
        })
        .into_response(),
    };

    return Ok(response);
}

#[cfg(test)]
mod test {
    use ishare::delegation_evidence::DelegationEvidenceContainer;

    use crate::fixtures::fixtures::insert_policy_set_fixture;
    use crate::services::server_token;
    use axum::{
        body::Body,
        http::{Request, StatusCode},
    };
    use http_body_util::BodyExt;
    use reqwest::header::AUTHORIZATION;
    use serde_json;
    use serde_json::json;
    use sqlx::postgres::{PgConnectOptions, PgPoolOptions};
    use tower::ServiceExt;

    use super::super::super::test_helpers::helpers::*;

    #[sqlx::test]
    async fn test_delegation_evidence(
        _pool_options: PgPoolOptions,
        conn_option: PgConnectOptions,
    ) -> sqlx::Result<()> {
        let db = init_test_db(&conn_option).await;
        insert_policy_set_fixture("./fixtures/policy_set1.json", &db).await;

        let app = get_test_app(db);
        let request_body = create_request_body(&json!({
            "delegationRequest": {
                "policyIssuer": "NL.24244",
                "target": {
                    "accessSubject": "NL.44444"
                },
                "policySets": [
                    {
                        "policies": [
                            {
                                "target": {
                                    "resource": {
                                        "type": "TestResource",
                                        "identifiers": ["test4"],
                                        "attributes": ["zingers"]
                                    },
                                    "actions": ["Read", "Delete"],
                                    "environment": {
                                        "serviceProviders": ["good-company"]
                                    }
                                },
                                "rules": [
                                    {
                                        "effect": "Permit"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }));
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/delegation")
                    .method("POST")
                    .header(
                        AUTHORIZATION,
                        server_token::server_token_test_helper::get_human_token_header(None, None),
                    )
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .body(Body::new(request_body))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);

        let body: DelegationEvidenceContainer = serde_json::from_str(
            std::str::from_utf8(&response.into_body().collect().await.unwrap().to_bytes()).unwrap(),
        )
        .unwrap();

        assert_eq!(body.delegation_evidence.policy_sets.len() > 0, true);

        for ps in body.delegation_evidence.policy_sets.iter() {
            for p in ps.policies.iter() {
                assert_eq!(p.rules.get(0).unwrap().effect, "Permit")
            }
        }

        Ok(())
    }

    #[sqlx::test]
    async fn test_delegation_evidence_retrieve_jwt(
        _pool_options: PgPoolOptions,
        conn_option: PgConnectOptions,
    ) -> sqlx::Result<()> {
        let db = init_test_db(&conn_option).await;
        insert_policy_set_fixture("./fixtures/policy_set1.json", &db).await;

        let app = get_test_app(db);
        let request_body = create_request_body(&json!({
            "delegationRequest": {
                "policyIssuer": "NL.24244",
                "target": {
                    "accessSubject": "NL.44444"
                },
                "policySets": [
                    {
                        "policies": [
                            {
                                "target": {
                                    "resource": {
                                        "type": "test-iden",
                                        "identifiers": ["test4"],
                                        "attributes": ["zingers"]
                                    },
                                    "actions": ["Read", "Delete"],
                                    "environment": {
                                        "serviceProviders": ["good-company"]
                                    }
                                },
                                "rules": [
                                    {
                                        "effect": "Permit"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }));
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/delegation")
                    .method("POST")
                    .header(
                        AUTHORIZATION,
                        server_token::server_token_test_helper::get_human_token_header(None, None),
                    )
                    .header("Content-Type", "application/json")
                    .body(Body::new(request_body))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);

        Ok(())
    }

    #[sqlx::test]
    async fn test_delegation_evidence_wildcard(
        _pool_options: PgPoolOptions,
        conn_option: PgConnectOptions,
    ) -> sqlx::Result<()> {
        let db = init_test_db(&conn_option).await;
        insert_policy_set_fixture("./fixtures/policy_set3.json", &db).await;

        let app = get_test_app(db);
        let request_body = create_request_body(&json!({
            "delegationRequest": {
                "policyIssuer": "NL.24244",
                "target": {
                    "accessSubject": "NL.44444"
                },
                "policySets": [
                    {
                        "policies": [
                            {
                                "target": {
                                    "resource": {
                                        "type": "test-iden",
                                        "identifiers": ["test4"],
                                        "attributes": ["zingers"]
                                    },
                                    "actions": ["Read", "Delete"],
                                    "environment": {
                                        "serviceProviders": ["good-company"]
                                    }
                                },
                                "rules": [
                                    {
                                        "effect": "Permit"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }));
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/delegation")
                    .method("POST")
                    .header(
                        AUTHORIZATION,
                        server_token::server_token_test_helper::get_human_token_header(None, None),
                    )
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .body(Body::new(request_body))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);

        let body: DelegationEvidenceContainer = serde_json::from_str(
            std::str::from_utf8(&response.into_body().collect().await.unwrap().to_bytes()).unwrap(),
        )
        .unwrap();

        assert_eq!(body.delegation_evidence.policy_sets.len() > 0, true);

        for ps in body.delegation_evidence.policy_sets.iter() {
            for p in ps.policies.iter() {
                assert_eq!(p.rules.get(0).unwrap().effect, "Permit")
            }
        }

        Ok(())
    }

    #[sqlx::test]
    async fn test_delegation_evidence_unallowed_action(
        _pool_options: PgPoolOptions,
        conn_option: PgConnectOptions,
    ) -> sqlx::Result<()> {
        let db = init_test_db(&conn_option).await;
        insert_policy_set_fixture("./fixtures/policy_set1.json", &db).await;

        let app = get_test_app(db);
        let request_body = create_request_body(&json!({
            "delegationRequest": {
                "policyIssuer": "NL.24244",
                "target": {
                    "accessSubject": "NL.44444"
                },
                "policySets": [
                    {
                        "policies": [
                            {
                                "target": {
                                    "resource": {
                                        "type": "test-iden",
                                        "identifiers": ["test4"],
                                        "attributes": ["zingers"]
                                    },
                                    "actions": ["Read", "Delete", "Fish"],
                                    "environment": {
                                        "serviceProviders": ["good-company"]
                                    }
                                },
                                "rules": [
                                    {
                                        "effect": "Permit"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }));
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/delegation")
                    .method("POST")
                    .header(
                        AUTHORIZATION,
                        server_token::server_token_test_helper::get_human_token_header(None, None),
                    )
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .body(Body::new(request_body))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);

        let body: DelegationEvidenceContainer = serde_json::from_str(
            std::str::from_utf8(&response.into_body().collect().await.unwrap().to_bytes()).unwrap(),
        )
        .unwrap();

        assert_eq!(body.delegation_evidence.policy_sets.len() == 0, true);

        Ok(())
    }

    #[sqlx::test]
    async fn test_delegation_evidence_specfic_identifier_match(
        _pool_options: PgPoolOptions,
        conn_option: PgConnectOptions,
    ) -> sqlx::Result<()> {
        let db = init_test_db(&conn_option).await;
        insert_policy_set_fixture("./fixtures/policy_set2.json", &db).await;

        let app = get_test_app(db);
        let request_body = create_request_body(&json!({
            "delegationRequest": {
                "policyIssuer": "NL.24244",
                "target": {
                    "accessSubject": "NL.44444"
                },
                "policySets": [
                    {
                        "policies": [
                            {
                                "target": {
                                    "resource": {
                                        "type": "test-iden",
                                        "identifiers": ["specific"],
                                        "attributes": ["zingers"]
                                    },
                                    "actions": ["Read", "Delete"],
                                    "environment": {
                                        "serviceProviders": ["good-company"]
                                    }
                                },
                                "rules": [
                                    {
                                        "effect": "Permit"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }));
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/delegation")
                    .method("POST")
                    .header(
                        AUTHORIZATION,
                        server_token::server_token_test_helper::get_human_token_header(None, None),
                    )
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .body(Body::new(request_body))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);

        let body: DelegationEvidenceContainer = serde_json::from_str(
            std::str::from_utf8(&response.into_body().collect().await.unwrap().to_bytes()).unwrap(),
        )
        .unwrap();

        assert_eq!(body.delegation_evidence.policy_sets.len() > 0, true);

        for ps in body.delegation_evidence.policy_sets.iter() {
            for p in ps.policies.iter() {
                assert_eq!(p.rules.get(0).unwrap().effect, "Deny")
            }
        }

        Ok(())
    }

    #[sqlx::test]
    async fn test_delegation_evidence_resource_type_start(
        _pool_options: PgPoolOptions,
        conn_option: PgConnectOptions,
    ) -> sqlx::Result<()> {
        let db = init_test_db(&conn_option).await;
        insert_policy_set_fixture("./fixtures/policy_set2.json", &db).await;

        let app = get_test_app(db);
        let request_body = create_request_body(&json!({
            "delegationRequest": {
                "policyIssuer": "NL.24244",
                "target": {
                    "accessSubject": "NL.44444"
                },
                "policySets": [
                    {
                        "policies": [
                            {
                                "target": {
                                    "resource": {
                                        "type": "*",
                                        "identifiers": ["specific"],
                                        "attributes": ["zingers"]
                                    },
                                    "actions": ["Read", "Delete"],
                                    "environment": {
                                        "serviceProviders": ["good-company"]
                                    }
                                },
                                "rules": [
                                    {
                                        "effect": "Permit"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }));
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/delegation")
                    .method("POST")
                    .header(
                        AUTHORIZATION,
                        server_token::server_token_test_helper::get_human_token_header(None, None),
                    )
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .body(Body::new(request_body))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::BAD_REQUEST);

        Ok(())
    }

    #[sqlx::test]
    async fn test_delegation_evidence_no_identifier(
        _pool_options: PgPoolOptions,
        conn_option: PgConnectOptions,
    ) -> sqlx::Result<()> {
        let db = init_test_db(&conn_option).await;
        insert_policy_set_fixture("./fixtures/policy_set2.json", &db).await;

        let app = get_test_app(db);
        let request_body = create_request_body(&json!({
            "delegationRequest": {
                "policyIssuer": "NL.24244",
                "target": {
                    "accessSubject": "NL.44444"
                },
                "policySets": [
                    {
                        "policies": [
                            {
                                "target": {
                                    "resource": {
                                        "type": "something",
                                        "identifiers": [],
                                        "attributes": ["zingers"]
                                    },
                                    "actions": ["Read", "Delete"],
                                    "environment": {
                                        "serviceProviders": ["good-company"]
                                    }
                                },
                                "rules": [
                                    {
                                        "effect": "Permit"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }));
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/delegation")
                    .method("POST")
                    .header(
                        AUTHORIZATION,
                        server_token::server_token_test_helper::get_human_token_header(None, None),
                    )
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .body(Body::new(request_body))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::BAD_REQUEST);

        Ok(())
    }

    #[sqlx::test]
    async fn test_delegation_evidence_no_attributes(
        _pool_options: PgPoolOptions,
        conn_option: PgConnectOptions,
    ) -> sqlx::Result<()> {
        let db = init_test_db(&conn_option).await;
        insert_policy_set_fixture("./fixtures/policy_set2.json", &db).await;

        let app = get_test_app(db);
        let request_body = create_request_body(&json!({
            "delegationRequest": {
                "policyIssuer": "NL.24244",
                "target": {
                    "accessSubject": "NL.44444"
                },
                "policySets": [
                    {
                        "policies": [
                            {
                                "target": {
                                    "resource": {
                                        "type": "something",
                                        "identifiers": ["zainger"],
                                        "attributes": []
                                    },
                                    "actions": ["Read", "Delete"],
                                    "environment": {
                                        "serviceProviders": ["good-company"]
                                    }
                                },
                                "rules": [
                                    {
                                        "effect": "Permit"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }));
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/delegation")
                    .method("POST")
                    .header(
                        AUTHORIZATION,
                        server_token::server_token_test_helper::get_human_token_header(None, None),
                    )
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .body(Body::new(request_body))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::BAD_REQUEST);

        Ok(())
    }

    #[sqlx::test]
    async fn test_delegation_evidence_specfic_identifier_no_match(
        _pool_options: PgPoolOptions,
        conn_option: PgConnectOptions,
    ) -> sqlx::Result<()> {
        let db = init_test_db(&conn_option).await;
        insert_policy_set_fixture("./fixtures/policy_set2.json", &db).await;

        let app = get_test_app(db);
        let request_body = create_request_body(&json!({
            "delegationRequest": {
                "policyIssuer": "NL.24244",
                "target": {
                    "accessSubject": "NL.44444"
                },
                "policySets": [
                    {
                        "policies": [
                            {
                                "target": {
                                    "resource": {
                                        "type": "test-iden",
                                        "identifiers": ["something else"],
                                        "attributes": ["zingers"]
                                    },
                                    "actions": ["Read", "Delete"],
                                    "environment": {
                                        "serviceProviders": ["good-company"]
                                    }
                                },
                                "rules": [
                                    {
                                        "effect": "Permit"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }));
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/delegation")
                    .method("POST")
                    .header(
                        AUTHORIZATION,
                        server_token::server_token_test_helper::get_human_token_header(None, None),
                    )
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .body(Body::new(request_body))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);

        let body: DelegationEvidenceContainer = serde_json::from_str(
            std::str::from_utf8(&response.into_body().collect().await.unwrap().to_bytes()).unwrap(),
        )
        .unwrap();

        assert_eq!(body.delegation_evidence.policy_sets.len() > 0, true);

        for ps in body.delegation_evidence.policy_sets.iter() {
            for p in ps.policies.iter() {
                assert_eq!(p.rules.get(0).unwrap().effect, "Permit")
            }
        }

        Ok(())
    }
}
