import { UmaPod } from "@datavillage-me/pod-client";
import { usePod } from "../hooks/usePod";

const requestAccess = async (pod: UmaPod) => {
  const amaRoot = "https://dashboard.dev.jouw.id/register";
  const redirectAfterAma = "http://localhost:5173/access?callback=true";

  const amaRedirect = await pod.getAmaRedirectUrl(
    [
      "https://storage.sandbox-nl-pod.datanutsbedrijf.be/b6738617-737c-4a03-8178-b21543efe44b/sndk/",
    ],
    amaRoot,
    redirectAfterAma
  );

  const loc = document.location;
  loc.assign(amaRedirect);
};

export default function RequestAccess() {
  const pod = usePod() as UmaPod;
  const isCallback =
    new URLSearchParams(window.location.search).get("callback") == "true";

  if (!pod) {
    return <>Not logged in</>;
  }

  console.log("request access", requestAccess);

  return (
    <>
      Logged in as {pod.webId} {isCallback ? "(callback)" : "(no callback)"}
    </>
  );
}
