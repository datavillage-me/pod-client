import { SOLID, startLogin } from "@datavillage-me/pod-client";

function Login() {
  const issuer = "https://idp.dev.jouw.id";
  const callbackUrl = "http://localhost:5173/access";
  const clientName = "DV Test Client";
  startLogin({
    oidcIssuer: issuer,
    redirectUrl: callbackUrl,
    clientName: clientName,
  });
  return SOLID;
}

export default Login;
