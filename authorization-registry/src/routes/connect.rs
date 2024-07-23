use crate::error::{AppError, ExpectedError};
use crate::{services::server_token::ServerToken, AppState};
use anyhow::Context;
use axum::extract::Query;
use axum::response::Redirect;
use axum::Json;
use axum::{
    extract::Host,
    extract::State,
    http::HeaderMap,
    routing::{get, post},
    Form, Router,
};
use reqwest::StatusCode;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

pub fn get_connect_routes() -> Router<AppState> {
    let router = Router::new()
        .route("/machine/token", post(get_machine_token))
        .route("/human/auth", get(get_auth))
        .route("/human/auth/code", get(get_auth_callback));

    return router;
}

#[derive(Serialize)]
struct AuthClaims {
    client_id: String,
    scope: String,
    redirect_uri: String,
    response_type: String,
    state: String,
}

#[derive(Deserialize)]
struct AuthQuery {
    redirect_uri: String,
}

#[derive(Deserialize)]
struct AuthCallbackQuery {
    code: String,
    state: String,
}

fn get_server_base_url(headers: HeaderMap, host: String) -> anyhow::Result<String> {
    let scheme = match headers.get("X-Forwarded-Proto") {
        None => "http://".to_string(),
        Some(s) => {
            s.to_str()
                .context("Error transforming header to string")?
                .to_string()
                + "://"
        }
    };

    let server_base_url = [scheme, host].join("");

    return Ok(server_base_url);
}

#[derive(Serialize, Debug)]
struct TokenResponse {
    access_token: String,
    token_type: String,
    expires_in: u64,
}

#[derive(Deserialize, Debug)]
struct TokenRequest {
    grant_type: String,
    client_assertion_type: String,
    client_id: String,
    client_assertion: String,
    scope: String,
}

async fn get_machine_token(
    State(state): State<AppState>,
    Form(body): Form<TokenRequest>,
) -> Result<Json<TokenResponse>, AppError> {
    match ishare::ishare::validate_request_arguments(
        &body.grant_type,
        &body.client_assertion_type,
        &body.scope,
    ) {
        Err(message) => {
            return Err(AppError::Expected(ExpectedError {
                status_code: StatusCode::BAD_REQUEST,
                message,
                reason: "Ishare request arguments are invalid".to_owned(),
                metadata: None,
            }));
        }
        _ => {}
    }

    let company_id = state
        .satellite_provider
        .handle_m2m_authentication(
            &body.client_id,
            &body.grant_type,
            &body.client_assertion,
            &body.client_assertion_type,
            &body.scope,
        )
        .await?;

    let service_access_token = state.server_token.create_token(company_id, None)?;

    Ok(Json(TokenResponse {
        access_token: service_access_token,
        expires_in: state.server_token.jwt_expiry_seconds,
        token_type: "Bearer".to_owned(),
    }))
}

async fn get_auth(
    State(state): State<AppState>,
    Host(host): Host,
    headers: HeaderMap,
    query: Query<AuthQuery>,
) -> Result<Redirect, AppError> {
    let server_base_url = get_server_base_url(headers, host)?;

    let redirect_url = state
        .satellite_provider
        .handle_h2m_redirect_url_request(&server_base_url, &query.redirect_uri)?;

    return Ok(Redirect::to(&redirect_url));
}

async fn get_auth_callback(
    State(state): State<AppState>,
    State(server_token): State<Arc<ServerToken>>,
    Host(host): Host,
    headers: HeaderMap,
    query: Query<AuthCallbackQuery>,
) -> Result<Redirect, AppError> {
    let server_base_url = get_server_base_url(headers, host)?;

    let (company_id, user_option) = state
        .satellite_provider
        .handle_h2m_auth_callback(&server_base_url, &query.code)
        .await?;

    let action_token = server_token.create_token(company_id, Some(user_option))?;

    return Ok(Redirect::to(&format!(
        "{}?token={}",
        query.state, action_token
    )));
}
