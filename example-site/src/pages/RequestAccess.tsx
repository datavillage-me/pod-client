import { UmaPod } from "@datavillage-me/pod-client";
import { usePod } from "../hooks/usePod";
import { Button } from "antd";

const requestAccess = async (pod: UmaPod) => {
  console.log("In request access");

  // TODO: log access grant
  await pod.grantAccess(
    "https://epc.datavillage.me/webid", // TODO: change with cage webId
    [
      "https://storage.sandbox-nl-pod.datanutsbedrijf.be/b6738617-737c-4a03-8178-b21543efe44b/sndk/userProfile.ttl",
    ]
  );
};

export default function RequestAccess() {
  const pod = usePod() as UmaPod;
  const isCallback =
    new URLSearchParams(window.location.search).get("callback") == "true";

  if (!pod) {
    return <>Not logged in</>;
  }

  const startRequest = async () => {
    await requestAccess(pod);
  };
  console.log("pod in requestaccess", pod);
  return (
    <>
      <p>
        Logged in as {pod.userWebId}
        {isCallback ? "(callback)" : "(no callback)"}
      </p>
      <Button onClick={startRequest}>Request access</Button>
    </>
  );
}
