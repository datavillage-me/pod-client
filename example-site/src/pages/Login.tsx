import { SOLID, startLogin } from "@datavillage-me/pod-client";

function Login() {
  const issuer = import.meta.env.VITE_SOLID_IDP;
  const callbackUrl = import.meta.env.VITE_LOGIN_CALLBACK;
  const clientName = import.meta.env.VITE_CLIENT_NAME;
  startLogin({
    oidcIssuer: issuer,
    redirectUrl: callbackUrl,
    clientName: clientName,
  });
  return SOLID;
}

export default Login;
