import { SOLID, startLogin } from "@datavillage-me/pod-client";

// import { startLogin } from "@datavillage-me/pod-client";

function Login() {
  startLogin()
  return SOLID;
  // return <Button onClick={startLogin}>Log in</Button>;
}

export default Login;
