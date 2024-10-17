use crate::{
    error::{AppError, ExpectedError},
    services::server_token::{Human, Role},
    utils::extract_bearer_token,
    ServerToken,
};

use axum::{
    body::Body,
    extract::{Request, State},
    http::HeaderMap,
    middleware::Next,
    response::IntoResponse,
    Extension,
};
use reqwest::StatusCode;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct RealmAccess {
    roles: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    iss: String,
    exp: usize,
    realm_access: RealmAccess,
}

pub async fn extract_role_middleware(
    State(server_token): State<std::sync::Arc<ServerToken>>,
    header: HeaderMap,
    mut req: Request,
    next: Next,
) -> Result<impl IntoResponse, AppError> {
    let token_string = extract_bearer_token(header)?;
    let token = server_token.decode_token(&token_string)?;

    req.extensions_mut().insert(token.claims.role.clone());
    req.extensions_mut().insert(token);

    let res = next.run(req).await;
    let status = res.status().clone();
    let headers = res.headers().clone();
    let body = res.into_body();

    return Ok((status, headers, body));
}

pub async fn extract_human_middleware(
    Extension(role): Extension<Role>,
    mut req: Request,
    next: Next,
) -> Result<(StatusCode, HeaderMap, Body), AppError> {
    let human = match role {
        Role::Human(human) => human,
        _ => {
            return Err(AppError::Expected(ExpectedError {
                status_code: StatusCode::UNAUTHORIZED,
                message: "You need a h2m access token to access".to_owned(),
                reason: "Request attempted with a machine token but human token is required"
                    .to_owned(),
                metadata: None,
            }));
        }
    };

    req.extensions_mut().insert(human.clone());

    let res = next.run(req).await;
    let status = res.status().clone();
    let headers = res.headers().clone();
    let body = res.into_body();

    return Ok((status, headers, body));
}

pub async fn auth_role_middleware(
    State(roles): State<Vec<String>>,
    Extension(human): Extension<Human>,
    req: Request,
    next: Next,
) -> Result<(StatusCode, HeaderMap, Body), AppError> {
    if !&human.realm_access_roles.iter().any(|r| roles.contains(&r)) {
        return Err(AppError::Expected(ExpectedError {
            status_code: StatusCode::UNAUTHORIZED,
            message:  "You don't have the correct access role".to_owned(),
            reason: format!("User '{}' with access roles '{:?}', does not have any required access roles '{:?}'", &human.user_id, &human.realm_access_roles, &roles),
            metadata: None,
        }));
    }

    let res = next.run(req).await;
    let status = res.status().clone();
    let headers = res.headers().clone();
    let body = res.into_body();

    return Ok((status, headers, body));
}

#[cfg(test)]
mod tests {
    use super::*;
    use tower::ServiceExt;
    use axum::{
        body::Body, extract::Extension, http::Request, middleware::from_fn_with_state,
        routing::get, Router,
    };
    use reqwest::{header::AUTHORIZATION, StatusCode};

    use crate::services::server_token::{
        self,
        server_token_test_helper::{self, get_test_service},
        Human, Role,
    };

    #[tokio::test]
    async fn test_extract_role_no_token() {
        async fn get_hello(Extension(_role): Extension<Role>) -> String {
            return "Hello world".to_owned();
        }

        let router = Router::new()
            .route("/", get(get_hello))
            .layer(from_fn_with_state(
                std::sync::Arc::new(get_test_service()),
                extract_role_middleware,
            ));

        let response = router
            .oneshot(Request::builder().uri("/").body(Body::empty()).unwrap())
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::UNAUTHORIZED)
    }

    #[tokio::test]
    async fn test_extract_role() {
        async fn get_hello(Extension(_role): Extension<Role>) -> String {
            return "Hello world".to_owned();
        }

        let router = Router::new()
            .route("/", get(get_hello))
            .layer(from_fn_with_state(
                std::sync::Arc::new(get_test_service()),
                extract_role_middleware,
            ));

        let response = router
            .oneshot(
                Request::builder()
                    .uri("/")
                    .header(
                        AUTHORIZATION,
                        server_token_test_helper::get_human_token_header(None, None),
                    )
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK)
    }

    #[tokio::test]
    async fn test_extract_human_from_machine_token() {
        async fn get_hello(Extension(_role): Extension<Human>) -> String {
            return "Hello world".to_owned();
        }

        let server_token = std::sync::Arc::new(get_test_service());
        let router = Router::new()
            .route("/", get(get_hello))
            .layer(from_fn_with_state(
                server_token.clone(),
                extract_human_middleware,
            ))
            .layer(from_fn_with_state(
                server_token.clone(),
                extract_role_middleware,
            ));

        let response = router
            .oneshot(
                Request::builder()
                    .uri("/")
                    .header(
                        AUTHORIZATION,
                        server_token::server_token_test_helper::get_machine_token_header(None),
                    )
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::UNAUTHORIZED)
    }

    #[tokio::test]
    async fn test_extract_human() {
        async fn get_hello(Extension(_role): Extension<Human>) -> String {
            return "Hello world".to_owned();
        }

        let server_token = std::sync::Arc::new(get_test_service());
        let router = Router::new()
            .route("/", get(get_hello))
            .layer(from_fn_with_state(
                server_token.clone(),
                extract_human_middleware,
            ))
            .layer(from_fn_with_state(
                server_token.clone(),
                extract_role_middleware,
            ));

        let response = router
            .oneshot(
                Request::builder()
                    .uri("/")
                    .header(
                        AUTHORIZATION,
                        server_token::server_token_test_helper::get_human_token_header(None, None),
                    )
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK)
    }
}
