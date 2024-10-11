import { finishLogin, SolidPod } from "@datavillage-me/pod-client";
import { useCallback, useState } from "react";

export default function Callback() {
  const issuer = "https://idp.dev.jouw.id";
  const [pod, setPod] = useState<SolidPod>();
  const [counter, setCounter] = useState<number>(0);

  const addCounter = useCallback(async () => {
    if (counter < 3) {
      setCounter(counter + 1);
    }
  }, [counter]);

  addCounter();

  const getPod = useCallback(async () => {
    if (pod == undefined) {
      const p = await finishLogin(issuer);
      console.log("finish login result", p);
      if (p) {
        console.log("setting pod", p);
        setPod(p);
      }
    }
  }, [pod, setPod]);

  if (!pod) {
    getPod();
    return <>Not logged in</>;
  }
  pod.askAccess([
    "https://storage.sandbox-nl-pod.datanutsbedrijf.be/b6738617-737c-4a03-8178-b21543efe44b/sndk",
  ]);

  return <>Logged in as {pod.webId}</>;
}
