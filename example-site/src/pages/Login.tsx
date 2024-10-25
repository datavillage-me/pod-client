import { startLogin } from "@datavillage-me/pod-client";
import { useState } from "react";

export default function Login() {
  const callbackUrl = import.meta.env.VITE_LOGIN_CALLBACK;
  const clientName = import.meta.env.VITE_CLIENT_NAME;
  const [issuer, setIssuer] = useState<string>();

  const login = async () => {
    if (issuer) {
      await startLogin({
        oidcIssuer: issuer,
        redirectUrl: callbackUrl,
        clientName: clientName,
      });
    }
  };

  return (
    <>
      <p>IDP</p>
      <input onChange={(e) => setIssuer(e.target.value)} />
      <button onClick={login}>Log In</button>
    </>
  );
}
