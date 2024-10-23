import { UmaPod } from "@datavillage-me/pod-client";
import { usePod } from "../hooks/usePod";

const requestAccess = async (pod: UmaPod) => {
  console.log("In request access");

  await pod.grantAccess("https://epc.datavillage.me/webid", [
    "https://storage.sandbox-nl-pod.datanutsbedrijf.be/b6738617-737c-4a03-8178-b21543efe44b/sndk/userProfile.ttl",
  ]);
};

export default function RequestAccess() {
  const pod = usePod() as UmaPod;

  if (!pod) {
    return <>Not logged in</>;
  }

  const startRequest = async () => {
    await requestAccess(pod);
  };
  console.log("pod in requestaccess", pod);
  return (
    <>
      <p>Logged in as {pod.userWebId}</p>
      <button onClick={startRequest}>Request access</button>
    </>
  );
}
