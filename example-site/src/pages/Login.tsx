import { SOLID, startLogin } from "@datavillage-me/pod-client";

function Login() {
  const issuer = "https://idp.dev.jouw.id";
  const callbackUrl = "http://localhost:5173/login/callback";
  // const issuer = "https://openid.sandbox-pod.datanutsbedrijf.be/";
  startLogin(issuer, callbackUrl);
  return SOLID;
}

export default Login;
