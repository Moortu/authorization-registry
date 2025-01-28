use axum::{middleware::from_fn_with_state, routing::get, Extension, Json, Router};
use sea_orm::DatabaseConnection;

use crate::{
    error::{AppError, ErrorResponse},
    middleware::extract_role_middleware,
    services::server_token::ServerToken,
    AppState,
};

pub fn get_policy_set_template_routes(
    server_token: std::sync::Arc<ServerToken>,
) -> Router<AppState> {
    return Router::new()
        .route("/", get(get_policy_set_templates))
        .layer(from_fn_with_state(server_token, extract_role_middleware));
}

#[utoipa::path(
    get,
    path = "/policy-set-template",
    tag = "Policy Set Templates",
    security(
        ("bearer" = [])
    ),
    responses(
        (
            status = 200,
            description = "List of all policy set templates to be used to prefill creating a new policy set.",
            content_type = "application/json",
            body = Vec<Vec<ar_entity::policy_set_template::Model>>
        ),
        (
            status = 401,
            description = "Authentication failed",
            content_type = "application/json", 
            example = json!(ErrorResponse::new("Unauthorized")),
        )
    )
 )]
async fn get_policy_set_templates(
    Extension(db): Extension<DatabaseConnection>,
) -> Result<Json<Vec<ar_entity::policy_set_template::Model>>, AppError> {
    let ps_templates = crate::db::policy_set_template::get_all_policy_set_templates(&db).await?;

    Ok(Json(ps_templates))
}
