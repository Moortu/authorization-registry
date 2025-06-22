use crate::error::{AppError, ExpectedError};
use crate::token_cache::TokenCache;
use anyhow::Context;
use axum::async_trait;
use ishare::ishare::ISHARE;
use ishare::pdp::PolicySetInsertResponse;
use ishare::pdp::PDP;
use reqwest::StatusCode;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone)]
pub enum ResourceAction {
    Create,
    Delete,
    Read,
    Edit,
}

impl ResourceAction {
    pub fn as_str(&self) -> &str {
        match self {
            Self::Create => "Create",
            Self::Delete => "Delete",
            Self::Read => "Read",
            Self::Edit => "Edit",
        }
    }
}

#[derive(PartialEq, Clone, Debug)]
pub enum PolicyResourceType {
    OfferPolicy,
    ClearingEvidence,
    DataAccess,
    DataAccessRequest,
    Clearing,
    DataHub,
    AuditLog,
}

impl PolicyResourceType {
    pub fn as_str(&self) -> &str {
        match self {
            Self::Clearing => "Clearing",
            Self::ClearingEvidence => "ClearingEvidence",
            Self::DataAccess => "DMI.DataAccess",
            Self::DataAccessRequest => "DMI.DataAccessRequest",
            Self::OfferPolicy => "OfferPolicy",
            Self::DataHub => "DataHub",
            Self::AuditLog => "AuditLog",
        }
    }
}

#[derive(PartialEq, Clone, Debug)]
pub enum DataHubAttributes {
    Member,
}

impl DataHubAttributes {
    pub fn as_str(&self) -> &str {
        match self {
            Self::Member => "Member",
        }
    }
}

#[async_trait]
pub trait AuthorizationProvider: Send + Sync {
    async fn authorize(
        &self,
        access_subject: &str,
        policy_issuer: &str,
        action: ResourceAction,
        resource_type: PolicyResourceType,
        identifiers: Option<Vec<String>>,
        attributes: Option<Vec<String>>,
    ) -> Result<(), AppError>;

    async fn append_delegation_evidence(
        &self,
        policy_issuer: &str,
        access_subject: &str,
        service_provider: &str,
        resource_type: PolicyResourceType,
        actions: Vec<ResourceAction>,
        identifiers: Option<Vec<String>>,
    ) -> Result<PolicySetInsertResponse, AppError>;
}

#[derive(Clone)]
pub struct PDPProvider {
    eori: String,
    base_url: String,
    ishare: Arc<ISHARE>,
    token_cache: Arc<RwLock<TokenCache>>,
}

impl PDPProvider {
    pub fn new(base_url: &str, eori: &str, ishare: Arc<ISHARE>) -> PDPProvider {
        let token_cache = TokenCache::new();
        return PDPProvider {
            eori: eori.to_string(),
            base_url: base_url.to_string(),
            ishare: ishare.clone(),
            token_cache: token_cache.clone(),
        };
    }
}

#[async_trait]
impl<'a> AuthorizationProvider for PDPProvider {
    async fn authorize(
        &self,
        access_subject: &str,
        policy_issuer: &str,
        action: ResourceAction,
        resource_type: PolicyResourceType,
        identifiers: Option<Vec<String>>,
        attributes: Option<Vec<String>>,
    ) -> Result<(), AppError> {
        let pdp = PDP::new(
            self.ishare.as_ref(),
            self.eori.to_string(),
            self.base_url.to_string(),
        );

        let now = chrono::Utc::now().timestamp();

        let mut write_lock = self.token_cache.write().await;

        let token = if write_lock.is_invalid(now) {
            tracing::debug!("pdp access token has expired. fetching new one");

            let token_response = pdp.connect().await.context("Error connecting to pdp")?;
            write_lock.update(
                token_response.access_token.clone(),
                token_response.expires_in + now,
            );

            token_response.access_token
        } else {
            tracing::debug!("retrieving pdp access token from cache");
            write_lock.access_token.clone()
        };

        let authorized = pdp
            .authorize(
                &token,
                action.as_str(),
                access_subject,
                policy_issuer,
                resource_type.as_str(),
                identifiers,
                attributes,
            )
            .await;

        match authorized {
            Err(e) => {
                Err(AppError::Expected(ExpectedError {
                    status_code: StatusCode::UNAUTHORIZED,
                    message: "unauthorized".to_owned(),
                    reason: format!("Error calling authorize on PDP. access_subject: {}, policy_issuer: {}. Error: {}", 
                    &access_subject,
                    &policy_issuer,
                    e.message,
                ),
                errors: None,
                error_type: crate::error::ErrorType::PDPUnauthorized,
                }))
            }
            Ok(success) => match success {
                true => {
                    tracing::debug!(
                        "access granted for access_subject: {}, policy_issuer: {}",
                        &access_subject,
                        &policy_issuer,
                    );
                    Ok(())
                }
                false => {

                    Err(AppError::Expected(ExpectedError {
                        status_code: StatusCode::UNAUTHORIZED,
                        message: "unauthorized".to_owned(),
                        reason: format!(
                            "no access for access_subject: {}, policy_issuer: {} for resource type: {:?} and action: {:?}",
                            &access_subject,
                            &policy_issuer,
                            &resource_type,
                            &action,
                        ),
                    errors: None,
                    error_type: crate::error::ErrorType::PDPUnauthorized,
                    }))
                }
            },
        }
    }

    async fn append_delegation_evidence(
        &self,
        policy_issuer: &str,
        access_subject: &str,
        service_provider: &str,
        resource_type: PolicyResourceType,
        actions: Vec<ResourceAction>,
        identifiers: Option<Vec<String>>,
    ) -> Result<PolicySetInsertResponse, AppError> {
        let pdp = PDP::new(
            self.ishare.as_ref(),
            self.eori.to_string(),
            self.base_url.to_string(),
        );

        let actions_as_strings = actions.iter().map(|a| a.as_str().to_owned()).collect();
        let token_response = pdp.connect().await.context("Error connecting to pdp")?;

        let response = pdp
            .put_policy_set(
                &token_response.access_token,
                policy_issuer,
                access_subject,
                service_provider,
                resource_type.as_str().to_owned(),
                actions_as_strings,
                identifiers,
            )
            .await
            .context("Error updating Delegation Evidence on PDP")?;

        Ok(response)
    }
}
