use axum::{middleware::from_fn_with_state, routing::get, Extension, Json, Router};
use sea_orm::DatabaseConnection;

use crate::{
    error::AppError, middleware::extract_role_middleware, services::server_token::ServerToken,
    AppState,
};

pub fn get_policy_set_template_routes(
    server_token: std::sync::Arc<ServerToken>,
) -> Router<AppState> {
    return Router::new()
        .route("/", get(get_policy_set_templates))
        .layer(from_fn_with_state(server_token, extract_role_middleware));
}

async fn get_policy_set_templates(
    Extension(db): Extension<DatabaseConnection>,
) -> Result<Json<Vec<ar_entity::policy_set_template::Model>>, AppError> {
    let ps_templates = crate::db::policy_set_template::get_all_policy_set_templates(&db).await?;

    Ok(Json(ps_templates))
}
