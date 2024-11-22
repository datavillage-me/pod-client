import { UmaPod } from "@datavillage-me/pod-client";
import { usePod } from "../hooks/usePod";
import { useState } from "react";

const requestAccess = async (
  pod: UmaPod,
  forWebId: string,
  forFile: string
) => {
  const fileUrl = new URL(forFile, pod.podUrl).toString();
  await pod.grantAccess(forWebId, [fileUrl]);
};

const getAccessGrants = async (
  pod: UmaPod,
  forWebId: string
): Promise<object> => {
  return await pod.getAccessGrantsForWebId(forWebId);
};

export default function RequestAccess() {
  const pod = usePod() as UmaPod;
  const [forWebId, setForWebId] = useState<string>();
  const [forFile, setForFile] = useState<string>();

  if (!pod) {
    return <>Not logged in</>;
  }

  const startRequest = async () => {
    if (forWebId && forFile) {
      await requestAccess(pod, forWebId, forFile);
    }
  };

  const getGrants = async () => {
    if (forWebId && forWebId.length) {
      const grants = await getAccessGrants(pod, forWebId);
      console.log("Got grants", grants);
    }
  };

  const updateForWebId = (value: string) => {
    setForWebId(value);
  };

  const updateForFile = (value: string) => {
    setForFile(value);
  };

  return (
    <>
      <p>Logged in as {pod.userWebId}</p>
      <p>Pod located at {pod.podUrl}</p>
      For webId
      <br />
      <input onChange={(e) => updateForWebId(e.target.value)}></input>
      <br />
      For file
      <br />
      <input onChange={(e) => updateForFile(e.target.value)} />
      <br />
      <button onClick={startRequest}>Request access</button>
      <button onClick={getGrants}>Get all access requests for webid</button>
    </>
  );
}
