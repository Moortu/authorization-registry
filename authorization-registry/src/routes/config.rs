use axum::{extract::State, middleware::from_fn_with_state, routing::get, Json, Router};

use crate::{
    config::FrontendConfig, middleware::extract_role_middleware,
    services::server_token::ServerToken, AppState,
};

pub fn get_config_routes(server_token: std::sync::Arc<ServerToken>) -> Router<AppState> {
    let router = Router::new()
        .route("/", get(get_config))
        .layer(from_fn_with_state(
            server_token.clone(),
            extract_role_middleware,
        ));

    router
}

async fn get_config(State(app_state): State<AppState>) -> Json<FrontendConfig> {
    return Json(app_state.config.frontend.clone());
}
