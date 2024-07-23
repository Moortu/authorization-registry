use crate::error::AppError;
use anyhow::Context;
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, TokenData, Validation};
use serde::{Deserialize, Serialize};

pub struct ServerToken {
    encoding_key: EncodingKey,
    decoding_key: DecodingKey,
    pub jwt_expiry_seconds: u64,
}

#[derive(Serialize, Debug, Deserialize, Clone)]
pub struct Machine {
    pub company_id: String,
}

#[derive(Serialize, Debug, Deserialize, Clone)]
pub struct Human {
    pub company_id: String,
    pub user_id: String,
    pub realm_access_roles: Vec<String>,
}

#[derive(Serialize, Debug, Deserialize, Clone)]
#[serde(rename_all = "snake_case", tag = "role")]
pub enum Role {
    Machine(Machine),
    Human(Human),
}

impl Role {
    pub fn get_company_id(&self) -> String {
        match self {
            Self::Human(Human { company_id, .. }) => company_id.to_owned(),
            Self::Machine(Machine { company_id }) => company_id.to_owned(),
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ServiceAccessTokenClaims {
    exp: u64,
    iat: u64,

    #[serde(flatten)]
    pub role: Role,
}

#[cfg(test)]
pub mod server_token_test_helper {
    use uuid::Uuid;

    use super::ServerToken;
    use super::*;

    const TEST_SECRET: &str = "TEST-SECRET";

    pub fn get_test_service() -> ServerToken {
        return ServerToken::new(TEST_SECRET.to_owned(), 3600);
    }

    pub fn get_machine_token_header(company_id_option: Option<String>) -> String {
        let company_id = match company_id_option {
            Some(company_id) => company_id,
            None => Uuid::new_v4().to_string(),
        };

        let server_token = get_test_service();

        let token = server_token.create_token(company_id, None).unwrap();

        return format!("Bearer {}", token);
    }

    pub fn get_human_token_header(
        company_id_option: Option<String>,
        user_id_option: Option<String>,
    ) -> String {
        let company_id = match company_id_option {
            Some(company_id) => company_id,
            None => Uuid::new_v4().to_string(),
        };

        let user_id = match user_id_option {
            Some(uid) => uid,
            None => Uuid::new_v4().to_string(),
        };

        let server_token = get_test_service();

        let token = server_token
            .create_token(
                company_id,
                Some(UserOption {
                    user_id,
                    realm_access_roles: vec!["dexspace_admin".to_owned()],
                }),
            )
            .unwrap();

        return format!("Bearer {}", token);
    }
}

pub struct UserOption {
    pub user_id: String,
    pub realm_access_roles: Vec<String>,
}

impl ServerToken {
    pub fn new(private_key: String, jwt_expiry_seconds: u64) -> Self {
        return Self {
            decoding_key: DecodingKey::from_secret(private_key.as_bytes()),
            encoding_key: EncodingKey::from_secret(private_key.as_bytes()),
            jwt_expiry_seconds,
        };
    }

    pub fn create_token(
        &self,
        company_id: String,
        user: Option<UserOption>,
    ) -> Result<String, AppError> {
        let iat = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .context("Error getting the current time")?
            .as_secs();

        let role = match user {
            Some(UserOption {
                user_id,
                realm_access_roles,
            }) => Role::Human(Human {
                company_id,
                user_id,
                realm_access_roles,
            }),
            None => Role::Machine(Machine { company_id }),
        };

        let service_access_claims = ServiceAccessTokenClaims {
            exp: iat + self.jwt_expiry_seconds,
            iat,
            role,
        };
        let header = Header {
            typ: Some("JWT".to_owned()),
            alg: jsonwebtoken::Algorithm::HS256,
            ..Default::default()
        };

        return Ok(encode(&header, &service_access_claims, &self.encoding_key)
            .context("Error encoding service access token")?);
    }

    pub fn decode_token(
        &self,
        raw_roken: &String,
    ) -> Result<TokenData<ServiceAccessTokenClaims>, AppError> {
        let validation = Validation::new(jsonwebtoken::Algorithm::HS256);
        return Ok(decode(&raw_roken, &self.decoding_key, &validation)
            .context("Error decoding server access token")?);
    }
}
