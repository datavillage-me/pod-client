import { finishLogin, UmaPod } from "@datavillage-me/pod-client";
import { useCallback, useState } from "react";
// import { redirect } from "react-router-dom";

export default function LoginCallback() {
  const issuer = "https://idp.dev.jouw.id";
  const amaRoot = "https://dashboard.dev.jouw.id/register";
  const redirectAfterAma = "http://localhost:5173/callback?from=ama";
  // const issuer = "https://openid.sandbox-pod.datanutsbedrijf.be/";

  const [pod, setPod] = useState<UmaPod>();
  const [counter, setCounter] = useState<number>(0);
  // const [askedAccess] = useState<boolean>(false);

  const queryParams = new URLSearchParams(window.location.search);
  const callbackFromAma =
    queryParams.has("from") && queryParams.get("from") == "ama";

  console.log("callback from ama", callbackFromAma);

  const addCounter = useCallback(async () => {
    if (counter < 3) {
      setCounter(counter + 1);
    }
  }, [counter]);

  addCounter();

  const getPod = useCallback(async () => {
    if (pod == undefined) {
      const p = await finishLogin();
      console.log("finish login result", p);
      if (p) {
        console.log("setting pod", p);
        setPod(p);
      }
    }
  }, [pod, setPod]);

  const askAccess = useCallback(
    async (resources: string[]) => {
      if (!pod) {
        return;
      }
      const amaRedirect = await pod.getAmaRedirectUrl(
        resources,
        amaRoot,
        redirectAfterAma
      );
      // setAskedAccess(true);
      const loc = document.location;
      console.log("redirecting to ama");
      loc.assign(amaRedirect);
      console.log("redirected to ama");
    },
    [pod, amaRoot]
  );

  if (!pod) {
    getPod();
    return <>Not logged in</>;
  }

  if (!callbackFromAma) {
    askAccess([
      "https://storage.sandbox-nl-pod.datanutsbedrijf.be/b6738617-737c-4a03-8178-b21543efe44b/sndk",
    ]);
    return <>Asking access...</>;
  } else if (pod && callbackFromAma) {
    return <>Logged in as {pod.webId} with ama consent</>;
  }

  return <>Logged in as {pod.webId}</>;
}
