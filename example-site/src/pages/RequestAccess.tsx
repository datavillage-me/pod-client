import { UmaPod } from "@datavillage-me/pod-client";
import { usePod } from "../hooks/usePod";
import { useState } from "react";

const requestAccess = async (
  pod: UmaPod,
  forWebId: string,
  forFile: string
) => {
  const fileUrl = new URL(forFile, pod.podUrl).toString();
  await pod.grantAccess(forWebId, [fileUrl], 10);
};

const getAccessGrants = async (
  pod: UmaPod,
  forWebId: string
): Promise<object[]> => {
  return (await pod.getAccessGrantsForWebId(forWebId)).verifiableCredential;
};

export default function RequestAccess() {
  const pod = usePod() as UmaPod;
  const [forWebId, setForWebId] = useState<string>();
  const [forFile, setForFile] = useState<string>();
  const [selectedAccessGrant, setSelectedAccessGrant] = useState<string>();

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

  const revokeSelectedAccessGrant = async () => {
    if (selectedAccessGrant && selectedAccessGrant.length) {
      await pod.revokeAccessGrant(selectedAccessGrant);
    }
  };

  return (
    <>
      <p>Logged in as {pod.userWebId}</p>
      <p>Pod located at {pod.podUrl}</p>
      For webId
      <br />
      <input onChange={(e) => setForWebId(e.target.value)}></input>
      <br />
      For file
      <br />
      <input onChange={(e) => setForFile(e.target.value)} />
      <br />
      <button onClick={startRequest}>Request access</button>
      <button onClick={getGrants}>Get all access requests for webid</button>
      <br />
      Access Grant URI
      <input onChange={(e) => setSelectedAccessGrant(e.target.value)} />
      <button onClick={revokeSelectedAccessGrant}>Revoke access grant</button>
    </>
  );
}
