#[cfg(test)]
pub mod helpers {
    use ar_migration::{Migrator, MigratorTrait};
    use axum::body::Body;
    use axum::{async_trait, Router};
    use ishare::delegation_evidence::DelegationEvidenceContainer;
    use ishare::ishare::{Adherence, Capabilities, PartyInfo, ValidatePartyError};
    use sea_orm::{Database, DatabaseConnection};
    use serde_json::Value;
    use sqlx::{postgres::PgConnectOptions, ConnectOptions};
    use std::sync::Arc;
    use std::sync::Once;
    use tracing_subscriber::EnvFilter;

    static INIT: Once = Once::new();

    use crate::config::{
        AddressConfig, ContactConfig, FooterConfig, FrontendConfig, GeneralConfig,
        NavigationConfig, SocialsConfig,
    };
    use crate::error::AppError;
    use crate::get_app;
    use crate::services::ishare_provider::{OAuthRequestForm, SatelliteProvider};
    use crate::services::server_token::{server_token_test_helper, UserOption};
    use crate::AppState;
    use crate::TimeProvider;

    pub struct FakeTimeProvider;

    impl FakeTimeProvider {
        pub fn new() -> Self {
            Self {}
        }
    }

    impl TimeProvider for FakeTimeProvider {
        fn now(&self) -> chrono::DateTime<chrono::Utc> {
            return chrono::DateTime::from_timestamp(1715247205, 0).unwrap();
        }
    }

    pub async fn init_test_db(conn_option: &PgConnectOptions) -> DatabaseConnection {
        let opts = conn_option
            .to_owned()
            .ssl_mode(sqlx::postgres::PgSslMode::Allow);
        let url = opts.to_url_lossy();
        let database = Database::connect(url).await.unwrap();

        Migrator::up(&database, None).await.unwrap();
        crate::fixtures::fixtures::apply(&database).await;

        return database;
    }

    pub fn create_request_body(json: &Value) -> Body {
        let body = serde_json::to_string(json).unwrap();
        let mut bytes: Vec<u8> = Vec::new();
        serde_json::to_writer(&mut bytes, &body).unwrap();
        return Body::new(body);
    }

    pub fn get_test_app(db: DatabaseConnection) -> Router {
        INIT.call_once(|| {
            let env_filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| {
                EnvFilter::new("tower_http=debug,authorization_registry=debug,ishare=debug")
            });

            tracing_subscriber::fmt()
                .with_env_filter(env_filter)
                .with_test_writer()
                .init();
        });

        let sat_provider = TestSatelliteProvider {};
        let server_token = server_token_test_helper::get_test_service();

        let app_state = AppState {
            server_token: Arc::new(server_token),
            satellite_provider: Arc::new(sat_provider.clone()),
            time_provider: Arc::new(FakeTimeProvider::new()),
            de_expiry_seconds: 3600,
            config: Arc::new(crate::AppConfig {
                service_name: "AR".to_owned(),
                deploy_route: "".to_owned(),
                allowed_company_id: "NL.CONSUME_TOO_MUCH".to_owned(),
                client_eori: "NL.CONSUME_TOO_MUCH".to_owned(),
                validate_m2m_certificate: true,
                delegation_allows_service_providers: false,
                frontend: FrontendConfig {
                    footer: FooterConfig {
                        navigation: NavigationConfig {
                            passport: "".to_owned(),
                            catalogue: "".to_owned(),
                            clearing: "".to_owned(),
                            datastation: "".to_owned(),
                        },
                        contact: ContactConfig {
                            address: AddressConfig {
                                name: "".to_owned(),
                                address_content: vec![],
                            },
                            email: "".to_owned(),
                            tax_number: "".to_owned(),
                            phone_number: "".to_owned(),
                        },
                        general: GeneralConfig {
                            become_member: "".to_owned(),
                            faq: "".to_owned(),
                            about: "".to_owned(),
                            support: "".to_owned(),
                        },
                        socials: SocialsConfig {
                            linkedin: "".to_owned(),
                            x: "".to_owned(),
                        },
                    },
                },
            }),
        };
        let app = get_app(db, app_state, true);

        return app;
    }

    #[derive(Clone)]
    pub struct TestSatelliteProvider {}

    #[async_trait]
    impl SatelliteProvider for TestSatelliteProvider {
        async fn get_satellite_token(&self) -> anyhow::Result<String> {
            return Ok("token".to_string());
        }

        fn handle_previous_step_client_assertion(
            &self,
            _now: chrono::DateTime<chrono::Utc>,
            _requestor_company_id: &str,
            _client_assertion: &str,
            _policy_issuer: &str,
            _access_subject: &str,
        ) -> bool {
            true
        }

        fn create_delegation_token(
            &self,
            _audience: &str,
            _de_container: &DelegationEvidenceContainer,
        ) -> anyhow::Result<String> {
            Ok("delegation token".to_owned())
        }

        fn create_capabilities_token(
            &self,
            _aud: &str,
            _cap: &Capabilities,
        ) -> anyhow::Result<String> {
            Ok("capabilities token".to_owned())
        }

        async fn validate_party(
            &self,
            _now: chrono::DateTime<chrono::Utc>,
            eori: &str,
        ) -> Result<PartyInfo, ValidatePartyError> {
            return Ok(PartyInfo {
                capability_url: "capabilities".to_owned(),
                adherence: Adherence {
                    status: "Active".to_string(),
                    end_date: "2026-03-25T00:00:00.000Z".to_string(),
                },
                party_id: eori.to_string(),
                party_name: "cool party".to_string(),
                certificates_or_spor: ishare::ishare::CertificatesOrSpor::Certificates(vec![]),
                agreements: vec![],
            });
        }

        fn handle_h2m_redirect_url_request(
            &self,
            _server_url: &str,
            _redirect_url: &str,
        ) -> anyhow::Result<String> {
            let url = "a_url".to_string();
            Ok(url)
        }

        fn get_h2m_redirect_base_url(&self) -> String {
            let url = "a_url".to_string();
            url
        }

        async fn get_h2m_redirect_form(
            &self,
            _server_url: &str,
            _redirect_url: &str,
        ) -> anyhow::Result<OAuthRequestForm> {
            return Ok(OAuthRequestForm {
                response_type: "code".to_owned(),
                scope: "ishare openid".to_owned(),
                request: "client_assertion".to_owned(),
                client_id: "client_id".to_owned(),
                state: "state".to_owned(),
            });
        }

        async fn handle_h2m_auth_callback(
            &self,
            _server_url: &str,
            _code: &str,
        ) -> Result<(String, UserOption), AppError> {
            let company_id = "A_company".to_string();
            let user_id = uuid::Uuid::new_v4().to_string();
            let realm_access_roles = vec!["role1".to_string(), "role2".to_string()];

            return Ok((
                company_id,
                UserOption {
                    user_id,
                    realm_access_roles,
                },
            ));
        }

        async fn handle_m2m_authentication(
            &self,
            _now: chrono::DateTime<chrono::Utc>,
            _client_id: &str,
            _grant_type: &str,
            _client_assertion: &str,
            _client_assertion_type: &str,
            _scope: &str,
            _validate_certificate: bool,
        ) -> Result<String, AppError> {
            return Ok("A_company".to_string());
        }
    }
}
