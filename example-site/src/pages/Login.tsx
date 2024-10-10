import { Button } from "antd";

import { startLogin } from "../../../solid";

function Login() {
  return <Button onClick={startLogin}>Log in</Button>;
}

export default Login;
