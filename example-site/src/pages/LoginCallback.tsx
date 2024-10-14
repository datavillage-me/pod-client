import { finishLogin } from "@datavillage-me/pod-client";
import { useEffect } from "react";

const callbackFunction = async () => {
  const pod = await finishLogin();
  if (!pod) {
    console.log("Could not finish login");
    throw Error("Could not finish login process");
  }
  const loc = document.location;
  loc.assign("http://localhost:5173/access");
};

export default function LoginCallback() {
  useEffect(() => {
    callbackFunction();
  }, []);

  return <>Finishing login process...</>;
}
