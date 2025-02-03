use axum::{extract::Path, middleware::from_fn_with_state, routing::get, Extension, Json, Router};
use axum_extra::extract::WithRejection;
use reqwest::StatusCode;
use sea_orm::DatabaseConnection;
use uuid::Uuid;

use crate::{
    error::{AppError, ErrorResponse, ExpectedError},
    middleware::extract_role_middleware,
    services::server_token::ServerToken,
    AppState,
};

pub fn get_policy_set_template_routes(
    server_token: std::sync::Arc<ServerToken>,
) -> Router<AppState> {
    return Router::new()
        .route("/", get(get_policy_set_templates))
        .route("/:id", get(get_policy_set_template))
        .layer(from_fn_with_state(server_token, extract_role_middleware));
}

#[utoipa::path(
    get,
    path = "/policy-set-template/{id}",
    tag = "Policy Set Templates",
    security(
        ("bearer" = [])
    ),
    params(
        ("id" = Uuid, Path, description = "Identifier of the policy set template")
    ),
    responses(
        (
            status = 200,
            description = "Policy set template that has id provided in the request.",
            content_type = "application/json",
            body = Vec<Vec<ar_entity::policy_set_template::Model>>
        ),
        (
            status = 401,
            description = "Authentication failed",
            content_type = "application/json", 
            example = json!(ErrorResponse::new("Unauthorized")),
        ),
        (
            status = 404,
            description = "Not found",
            content_type = "application/json", 
            example = json!(ErrorResponse::new("Can't find policy template")),
        )
    )
 )]
async fn get_policy_set_template(
    Extension(db): Extension<DatabaseConnection>,
    WithRejection(Path(id), _): WithRejection<Path<Uuid>, AppError>,
) -> Result<Json<ar_entity::policy_set_template::Model>, AppError> {
    let ps_template =
        match crate::db::policy_set_template::get_policy_set_template_by_id(&id, &db).await? {
            Some(ps_template) => ps_template,
            None => {
                return Err(AppError::Expected(ExpectedError {
                    status_code: StatusCode::NOT_FOUND,
                    message: "Can't find policy template".to_owned(),
                    reason: format!("Can't find policy template with id: {}", id),
                    metadata: None,
                }));
            }
        };

    return Ok(Json(ps_template));
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
