use anyhow::Context;
use serde::{Deserialize, Serialize};
use textnonce::TextNonce;

#[derive(Clone)]
pub struct IdpConnector {
    pub idp_url: String,
    pub client_id: String,
    pub idp_eori: String,
}

#[derive(Serialize)]
pub struct AuthRequestClaims {
    client_id: String,
    scope: String,
    redirect_uri: String,
    response_type: String,
    state: String,
    nonce: String,
    acr_values: String,
    language: Option<String>
}

#[derive(Deserialize)]
pub struct TokenResponse {
    pub id_token: String,
}

impl IdpConnector {
    pub fn new(url: String, client_id: String, idp_eori: String) -> Self {
        Self {
            idp_url: url,
            client_id,
            idp_eori,
        }
    }

    pub fn get_realm_url(&self) -> String {
        let idp_url = self.idp_url.clone();
        return format!("{idp_url}/protocol/openid-connect/auth");
    }

    pub fn generate_auth_url(&self, client_assertion: &str, state: &str) -> String {
        let idp_url = self.idp_url.clone();
        let client_id = self.client_id.clone();
        let encoded_state = urlencoding::encode(state);
        let url = format!("{idp_url}/protocol/openid-connect/auth?response_type=code&scope=openid+ishare&client_id={client_id}&request={client_assertion}&state={encoded_state}");

        return url;
    }

    pub fn get_auth_request_claims(
        &self,
        server_base_url: &str,
        callback_url: &str,
    ) -> AuthRequestClaims {
        let redirect_uri = self.get_redirect_uri(server_base_url);

        let textnonce = TextNonce::sized_urlsafe(32).unwrap();

        // to-do: generate random nonce
        //let nonce = textnonce.to_string();
        let nonce = textnonce.to_string();
        // once of: urn:http://eidas.europa.eu/LoA/NotNotified/low, urn:http://eidas.europa.eu/LoA/NotNotified/substantial or urn:http://eidas.europa.eu/LoA/NotNotified/high,
        //let acr_values = "";
        //let acr_values = "urn:http://eidas.europa.eu/LoA/NotNotified/substantial";
        let acr_values = "urn:http://eidas.europa.eu/LoA/NotNotified/low";
        let language = "nl";

        return AuthRequestClaims {
            client_id: self.client_id.clone(),
            scope: "openid ishare".to_owned(),
            redirect_uri: redirect_uri.to_owned(),
            response_type: "code".to_owned(),
            state: callback_url.to_owned(),
            nonce: nonce.to_owned(),
            acr_values: acr_values.to_owned(),
            language: Some(language.to_owned()),
        };
    }

    fn get_redirect_uri(&self, server_base_url: &str) -> String {
        let uri = format!("{server_base_url}/connect/human/auth/code");
        return uri.to_string();
    }

    pub async fn fetch_token(
        &self,
        server_base_url: &str,
        code: &str,
        client_assertion: &str,
    ) -> anyhow::Result<TokenResponse> {
        let idp_url = self.idp_url.clone();

        let redirect_uri = self.get_redirect_uri(server_base_url);

        let form_data = vec![
            ("grant_type", "authorization_code"),
            ("redirect_uri", redirect_uri.as_str()),
            ("client_id", &self.client_id),
            ("code", code),
            ("client_assertion", client_assertion),
            (
                "client_assertion_type",
                "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
            ),
        ];

        let response = reqwest::Client::new()
            .post(format!("{idp_url}/protocol/openid-connect/token"))
            .form(&form_data)
            .header("Content-Type", "application/x-www-form-urlencoded")
            .send()
            .await
            .context("error fetching token")?;

        if !response.status().is_success() {
            anyhow::bail!("error response from idp: {:?}", response);
        }

        let token_response = response
            .json::<TokenResponse>()
            .await
            .context("Error decoding token response")?;

        return Ok(token_response);
    }
}
