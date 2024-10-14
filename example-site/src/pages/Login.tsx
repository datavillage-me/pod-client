import { SOLID, startLogin } from "@datavillage-me/pod-client";

function Login() {
  const issuer = "https://idp.dev.jouw.id";
  // const issuer = "https://openid.sandbox-pod.datanutsbedrijf.be/";
  startLogin(issuer);
  return SOLID;
}

export default Login;
