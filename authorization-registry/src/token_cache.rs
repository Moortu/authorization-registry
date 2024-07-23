use std::sync::{Arc, RwLock};

#[derive(Clone)]
pub struct TokenCache {
    expires_at: i64,
    pub access_token: String,
}

impl TokenCache {
    pub fn new() -> Arc<RwLock<Self>> {
        let token_cache = Arc::new(RwLock::new(TokenCache {
            expires_at: -1,
            access_token: "".to_string(),
        }));

        return token_cache;
    }

    pub fn is_invalid(&self, now: i64) -> bool {
        self.expires_at == -1 || self.expires_at - now < 30
    }

    pub fn update(&mut self, access_token: String, expires_at: i64) {
        self.access_token = access_token;
        self.expires_at = expires_at;
    }
}
