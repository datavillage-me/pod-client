import { SOLID, startLogin } from "@datavillage-me/pod-client";

function Login() {
  const issuer = "https://idp.dev.jouw.id";
  startLogin(issuer);
  return SOLID;
}

export default Login;
