import { finishLogin } from "@datavillage-me/pod-client";
import { useCallback, useState } from "react";

export default function Callback() {
  const [webId, setWebId] = useState<string>();

  const getWebId = useCallback(async () => {
    const id = await finishLogin();
    setWebId(id);
  }, []);

  getWebId();

  if (!webId) {
    return <>Not logged in</>;
  }

  return <>Logged in as {webId}</>;
}
