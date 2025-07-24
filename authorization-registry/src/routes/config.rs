use axum::{extract::State, routing::get, Json, Router};

use crate::{config::FrontendConfig, AppState};

pub fn get_config_routes() -> Router<AppState> {
    let router = Router::new().route("/", get(get_config));

    router
}

async fn get_config(State(app_state): State<AppState>) -> Json<FrontendConfig> {
    return Json(app_state.config.frontend.clone());
}
