use anyhow::Context;
use axum::{
    extract::{Host, State},
    http::HeaderMap,
    routing::get,
    Json, Router,
};
use reqwest::StatusCode;
use serde::Serialize;

use crate::{
    error::{AppError, ExpectedError},
    AppState,
};
use utoipa::ToSchema;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Version {
    complies_with_framework_versions: Vec<String>,
    complies_with_dataspace_versions: Vec<String>,
    capabilities_version: String,
}

#[derive(Serialize)]
struct Service {
    identifier: String,
    title: String,
    description: String,
    #[serde(rename = "descriptionURL")]
    description_url: String,
    #[serde(rename = "endpointURL")]
    endpoint_url: String,
    #[serde(rename = "tokenEndpoint")]
    #[serde(skip_serializing_if = "Option::is_none")]
    token_endpoint: Option<String>,
    status: String,
    #[serde(rename = "serviceType")]
    service_type: String,
    version: Version,
    methods: Vec<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct CapabilitiesInfo {
    public_services: Vec<Service>,
    #[serde(skip_serializing_if = "Option::is_none")]
    restriced_services: Option<Vec<Service>>,
}

#[derive(Serialize)]
pub struct Capabilities {
    capabilities_info: CapabilitiesInfo,
}

pub fn get_capabilities_routes() -> Router<AppState> {
    return Router::new().route("/", get(get_capabilities));
}

pub fn create_capabilities(api_url: &str, show_private: bool) -> Capabilities {
    let capabilities = Capabilities {
        capabilities_info: CapabilitiesInfo {
            restriced_services: if show_private {
                Some(vec![Service {
                    identifier: "aaf5162b-82f2-4bf2-9eaa-e01b380e7ec3".to_owned(),
                    title: "iSHARE delegation request".to_owned(),
                    description:
                        "issue iSHARE delegation evidence based on your delegation request"
                            .to_owned(),
                    endpoint_url: format!("{}{}", api_url, "/delegation"),
                    description_url: "".to_owned(),
                    status: "active".to_owned(),
                    token_endpoint: Some(format!("{}{}", api_url, "/connect/machine/token")),
                    service_type: "framework-defined".to_owned(),
                    version: Version {
                        complies_with_framework_versions: vec!["2.1".to_owned()],
                        complies_with_dataspace_versions: vec!["1.0".to_owned()],
                        capabilities_version: "0.1.0".to_owned(),
                    },
                    methods: vec!["POST".to_owned()],
                }])
            } else {
                None
            },
            public_services: vec![
                Service {
                    identifier: "ebb696ab-bda7-44a9-8cec-382183d58d9d".to_owned(),
                    title: "machine access token".to_owned(),
                    endpoint_url: format!("{}{}", api_url, "/connect/machine/token"),
                    description: "retrieve machine access token for M2M authentication".to_owned(),
                    description_url: "".to_owned(),
                    token_endpoint: None,
                    status: "active".to_owned(),
                    methods: vec!["POST".to_owned()],
                    version: Version {
                        complies_with_framework_versions: vec!["2.1".to_owned()],
                        complies_with_dataspace_versions: vec!["1.0".to_owned()],
                        capabilities_version: "0.1.0".to_owned(),
                    },
                    service_type: "framework-defined".to_owned(),
                },
                Service {
                    identifier: "ebb696ab-bda7-44a9-8cec-382183d58d9d".to_owned(),
                    title: "human access token".to_owned(),
                    description: "retrieve human access token for H2M authentication".to_owned(),
                    description_url: "".to_owned(),
                    token_endpoint: None,
                    status: "active".to_owned(),
                    endpoint_url: format!("{}{}", api_url, "/connect/machine/token"),
                    service_type: "framework-defined".to_owned(),
                    version: Version {
                        complies_with_framework_versions: vec!["2.1".to_owned()],
                        complies_with_dataspace_versions: vec!["1.0".to_owned()],
                        capabilities_version: "0.1.0".to_owned(),
                    },
                    methods: vec!["POST".to_owned()],
                },
                Service {
                    identifier: "/capabilities".to_owned(),
                    title: "iSHARE capabilities".to_owned(),
                    description: "retrieve capabilities".to_owned(),
                    endpoint_url: format!("{}/capabilities", api_url),
                    description_url: "".to_owned(),
                    token_endpoint: Some(format!("{}/connect/machine/token", api_url)),
                    status: "active".to_owned(),
                    service_type: "framework-defined".to_owned(),
                    version: Version {
                        complies_with_framework_versions: vec!["2.1".to_owned()],
                        complies_with_dataspace_versions: vec!["1.0".to_owned()],
                        capabilities_version: "0.1.0".to_owned(),
                    },
                    methods: vec!["GET".to_owned()],
                },
            ],
        },
    };

    return capabilities;
}

#[derive(Serialize, ToSchema)]
struct CapabilitiesResponse {
    capabilities_token: String,
}

pub fn extract_bearer_token(header_map: &HeaderMap) -> Result<Option<String>, AppError> {
    let auth_header = match header_map.get("Authorization") {
        Some(header) => header,
        None => return Ok(None),
    };

    match auth_header
        .to_str()
        .context("Removing bearer prefix from auth header")?
        .strip_prefix("Bearer ")
    {
        Some(token) => {
            return Ok(Some(token.to_owned()));
        }
        None => {
            return Err(AppError::Expected(ExpectedError {
                status_code: StatusCode::BAD_REQUEST,
                message: "Missing bearer prefix in Authorization header".to_owned(),
                reason: "Missing bearer prefix in Authorization header".to_owned(),
                metadata: None,
            }));
        }
    };
}

/// Retrieve iSHARE capabilities
#[utoipa::path(
    get,
    path = "/capabilities",
    tag = "Capabilities",
    responses(
        (
            status = 200,
            description = "Authorization Registry capabilities",
            content_type = "application/json",
            body = CapabilitiesResponse
        ),
    )
 )]
#[axum_macros::debug_handler]
async fn get_capabilities(
    header_map: HeaderMap,
    Host(host): Host,
    State(app_state): State<AppState>,
) -> Result<Json<CapabilitiesResponse>, AppError> {
    let (show_private, audience) = match extract_bearer_token(&header_map) {
        Err(e) => return Err(e),
        Ok(Some(raw_token)) => {
            let token = app_state.server_token.decode_token(&raw_token)?;

            (true, token.claims.role.get_company_id())
        }
        Ok(None) => (false, "public".to_owned()),
    };

    let scheme = match header_map.get("X-Forwarded-Proto") {
        None => "http://".to_string(),
        Some(s) => {
            s.to_str()
                .context("error converting to string")?
                .to_string()
                + "://"
        }
    };

    let api_url = [scheme, host, app_state.config.deploy_route.clone()].join("");
    let capabilities = create_capabilities(&api_url, show_private);

    let capabilities_token = app_state
        .satellite_provider
        .create_capabilities_token(&audience, &capabilities)?;

    let response = CapabilitiesResponse { capabilities_token };

    return Ok(Json(response));
}

#[cfg(test)]
mod test {
    use axum::{
        body::Body,
        http::{Request, StatusCode},
    };

    use sqlx::postgres::{PgConnectOptions, PgPoolOptions};
    use tower::ServiceExt;

    use super::super::super::test_helpers::helpers::*;

    #[sqlx::test]
    async fn auth_header_not_bearer_plus_value(
        _pool_options: PgPoolOptions,
        conn_option: PgConnectOptions,
    ) -> sqlx::Result<()> {
        let db = init_test_db(&conn_option).await;
        let app = get_test_app(db);

        let response = app
            .oneshot(
                Request::builder()
                    .uri("/capabilities")
                    .header("Host", "Example.com")
                    .header("Authorization", "Chicken token")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::BAD_REQUEST);

        Ok(())
    }

    #[sqlx::test]
    async fn test_get_public_capabilities(
        _pool_options: PgPoolOptions,
        conn_option: PgConnectOptions,
    ) -> sqlx::Result<()> {
        let db = init_test_db(&conn_option).await;
        let app = get_test_app(db);

        let response = app
            .oneshot(
                Request::builder()
                    .uri("/capabilities")
                    .header("Host", "Example.com")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);

        Ok(())
    }
}
