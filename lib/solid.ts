import {
  login,
  getDefaultSession,
  handleIncomingRedirect,
} from "@inrupt/solid-client-authn-browser";
import { Pod } from "./dist";
import { issueAccessRequest } from "@inrupt/solid-client-access-grants";

export const SOLID = "solid";

type FetchFn = typeof fetch;

export class SolidPod implements Pod {
  webId: string;
  issuer: string;
  fetch: FetchFn;

  constructor(webId: string, issuer: string, fetch: FetchFn) {
    this.webId = webId;
    this.issuer = issuer;
    this.fetch = fetch;
  }

  async askAccess(resourceUris: string[]): Promise<void> {
    const expiration = new Date(Date.now() + 5 * 60000);

    const requestVc = await issueAccessRequest(
      {
        access: { read: true, write: true },
        resourceOwner: this.webId,
        expirationDate: expiration,
        resources: resourceUris,
      },
      { returnLegacyJsonld: false }
    );

    console.log("requestVc", requestVc);
  }
}

export async function startLogin(issuer: string): Promise<void> {
  // Start the Login Process if not already logged in.
  if (!getDefaultSession().info.isLoggedIn) {
    await login({
      oidcIssuer: issuer,
      redirectUrl: new URL("/callback", window.location.href).toString(),
      clientName: "My application",
    });
  }
}

export async function finishLogin(issuer: string): Promise<SolidPod> {
  const sessionInfo = await handleIncomingRedirect();
  const session = await getDefaultSession();
  console.log("Got session");

  if (!sessionInfo.webId) {
    Promise.reject("Could not get webId from session");
  }

  return new SolidPod(sessionInfo.webId, issuer, session.fetch);
}
