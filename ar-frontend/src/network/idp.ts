import { baseAPIUrl } from "./fetch";

export const IDP_URL = new URL(
  "protocol/openid-connect",
  import.meta.env.VITE_IDP_URL,
);

/*export function initLogin() {
  const redirectUrl = encodeURIComponent(window.location.href);
  const loginUrl = `${baseAPIUrl}/connect/human/auth?redirect_uri=${redirectUrl}`;
  window.location.href = loginUrl;
}*/

let called = false;
export function initLogin() {
  console.log("called", called);
  if (called) {
    return;
  }
  called = true;
  async function run () {
    try {
      console.log("INIT LOGIN")

      const redirectUrl = encodeURIComponent(window.location.href);
      const getParamsUrl = `${baseAPIUrl}/connect/human/auth_params?redirect_uri=${redirectUrl}`;
      const params = await (await fetch(getParamsUrl)).json()

      const loginUrl = `${baseAPIUrl}/connect/human/auth`;

      const form = document.createElement('form');
      form.setAttribute('method', 'POST');
      form.setAttribute('action', loginUrl);

      console.log(params)

      for (const [key, value] of Object.entries(params)) {
          const hiddenField = document.createElement('input');
          hiddenField.setAttribute('type', 'hidden');
          hiddenField.setAttribute('name', key);
          hiddenField.setAttribute('value', value as string);

          form.appendChild(hiddenField);
      }

      document.body.appendChild(form);

      form.submit();
    } catch (e) {
      console.error(`error in run: ${e}`)
    }
  }
  return new Promise(run);
}

export function initLogout() {
  const redirectUrl = encodeURIComponent(window.location.href);
  const logoutUrl = `${IDP_URL}/logout?post_logout_redirect_url=${redirectUrl}`;
  window.location.href = logoutUrl;
}
