import { startLogin } from "@datavillage-me/pod-client";
import { useState } from "react";

const getCallbackUrl = () => {
  if (process.env.NODE_ENV !== "production") {
    return (
      import.meta.env.VITE_LOGIN_CALLBACK || "http://localhost:5173/access"
    );
  }
  return "__VITE_LOGIN_CALLBACK__";
};

const getClientName = () => {
  if (process.env.NODE_ENV !== "production") {
    return import.meta.env.VITE_CLIENT_NAME || "Datavillage Solid Login";
  }
  return "__VITE_CLIENT_NAME__";
};

export default function Login() {
  const callbackUrl = getCallbackUrl();
  const clientName = getClientName();
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
