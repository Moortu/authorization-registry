use anyhow::Context;
use axum::http::HeaderMap;
use reqwest::StatusCode;

use crate::error::{AppError, ExpectedError};

pub fn extract_bearer_token(header_map: &HeaderMap) -> Result<String, AppError> {
    let auth_header = match header_map.get("Authorization") {
        Some(header) => header,
        None => {
            return Err(AppError::Expected(ExpectedError {
                status_code: StatusCode::UNAUTHORIZED,
                message: "Authorization header not found".to_owned(),
                reason: "Authorization header not found".to_owned(),
                metadata: None,
            }));
        }
    };

    match auth_header
        .to_str()
        .context("Removing bearer prefix from auth header")?
        .strip_prefix("Bearer ")
    {
        Some(token) => {
            return Ok(token.to_owned());
        }
        None => {
            return Err(AppError::Expected(ExpectedError {
                status_code: StatusCode::UNAUTHORIZED,
                message: "Missing bearer prefix in Authorization header".to_owned(),
                reason: "Missing bearer prefix in Authorization header".to_owned(),
                metadata: None,
            }));
        }
    };
}

#[cfg(test)]
mod test {
    use axum::http::{HeaderMap, HeaderValue};
    use reqwest::header::AUTHORIZATION;

    use crate::{error::AppError, utils::extract_bearer_token};

    #[test]
    fn test_extract_bearer_no_authorization() {
        let header_map = HeaderMap::new();

        match extract_bearer_token(&header_map) {
            Err(AppError::Expected(error)) => {
                assert_eq!(format!("{}", error), "Authorization header not found");
            }
            _ => {
                panic!()
            }
        };
    }

    #[test]
    fn test_extract_bearer_no_bearer_prefix() {
        let mut header_map = HeaderMap::new();
        header_map.append(AUTHORIZATION, HeaderValue::from_str("asfasfgasg").unwrap());

        match extract_bearer_token(&header_map) {
            Err(AppError::Expected(error)) => {
                assert_eq!(
                    format!("{}", error),
                    "Missing bearer prefix in Authorization header"
                );
            }
            _ => {
                panic!()
            }
        };
    }

    #[test]
    fn test_extract_bearer() {
        let mut header_map = HeaderMap::new();
        header_map.append(
            AUTHORIZATION,
            HeaderValue::from_str("Bearer asfasfgasg").unwrap(),
        );

        match extract_bearer_token(&header_map) {
            Err(e) => {
                panic!("{:?}", e);
            }
            Ok(token) => {
                assert_eq!(token, "asfasfgasg");
            }
        };
    }
}
