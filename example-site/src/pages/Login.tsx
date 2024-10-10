import { Button } from "antd";

import { startLogin } from "@datavillage-me/pod-client";

function Login() {
  return <Button onClick={startLogin}>Log in</Button>;
}

export default Login;
