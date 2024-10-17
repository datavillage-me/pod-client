import {
  login,
  getDefaultSession,
  handleIncomingRedirect,
  EVENTS,
} from "@inrupt/solid-client-authn-browser";
import { Pod } from "./interfaces";
import { JsonLd } from "@inrupt/solid-client-vc";
import { UmaConfiguration } from "@inrupt/solid-client-access-grants/dist/type/UmaConfiguration";

export const SOLID = "solid";
const sessionKey = "dv-solid-session";

// TODO: DO NOT COMMIT A VALUE, FETCH TOKEN FROM IDP!!
const appIdToken = "";

type FetchFn = typeof fetch;
export type UmaPodConfig = {
  userWebId: string;
  applicationIdToken: string;
};

export class UmaPod implements Pod {
  userWebId: string;
  fetch: FetchFn;

  constructor(userWebId: string, fetch: FetchFn) {
    console.log("Creating solid pod for", userWebId);
    this.userWebId = userWebId;
    this.fetch = fetch;
  }

  async grantAccess(webId: string, resources: string[]) {
    if (!resources.length) return;
    // assume same vc
    const response = await this.fetch(resources[0]);
    console.log("hopefully response is OK", response);

    const { umaUri } = await getVcUrifromResource(resources[0]);
    const { verifiable_credential_issuer } = await getUmaConfiguration(umaUri);

    // create and issue request
    const accessRequest = constructAccessRequest(webId, resources, 10);
    const vcIssueEndpoint = `${verifiable_credential_issuer}/issue`; // TODO: don't hardcode issue endpoint

    const accessGrant = await this.fetch(vcIssueEndpoint, {
      method: "POST",
      body: JSON.stringify({ credential: accessRequest }),
      mode: "cors",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  }
}

export async function startLogin(
  issuer: string,
  callback: string
): Promise<void> {
  // Start the Login Process if not already logged in.
  if (!getDefaultSession().info.isLoggedIn) {
    console.log("logging in with client id");
    await login({
      oidcIssuer: issuer,
      redirectUrl: callback,
      clientName: "My application",
      clientId: "https://epc.datavillage.me/appid",
      clientSecret: appIdToken,
    });
  }
}

function getDefaultContexts(): { "@context": string[] } {
  return {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://solid.data.vlaanderen.be/ns/access/2023-03-15/access.jsonld",
      "https://schema.inrupt.com/credentials/v1.jsonld",
    ],
  };
}

// TODO: don't use deprecated type
export function constructAccessRequest(
  webId: string,
  resources: string[],
  duration_days: number
): JsonLd {
  const today = new Date();
  const expiration = new Date(
    today.getTime() + duration_days * 24 * 60 * 60 * 1000
  ); // days to miliseconds

  return {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://schema.inrupt.com/credentials/v1.jsonld",
    ],
    credentialSubject: {
      providedConsent: {
        mode: [
          "http://www.w3.org/ns/auth/acl#Read",
          "http://www.w3.org/ns/auth/acl#Write",
        ],
        hasStatus: "https://w3id.org/GConsent#ConsentStatusExplicitlyGiven",
        forPersonalData: resources,
        isProvidedTo: webId,
        inherit: true,
      },
    },
    expirationDate: expiration.toISOString(),
  };
}

export async function getVcUrifromResource(resourceUri: string): Promise<
  | {
      umaUri: string;
      permissionTicket: string;
    }
  | undefined
> {
  // TODO find more elegant way
  let response: Response;
  await fetch(resourceUri).then((r) => {
    response = r;
  });

  console.log("got response headers", response.headers.get("Www-Authenticate"));
  return parseWwwAuthenticateHeader(response.headers.get("Www-Authenticate"));
}

export async function getCurrentPod(): Promise<Pod | undefined> {
  const unauth_session = getDefaultSession();
  const currentLocation = window.location;

  unauth_session.events.on(EVENTS.SESSION_RESTORED, (url) => {
    console.log("setting to current location", currentLocation);
    window.location = currentLocation;
  });

  const sessionInfo = await handleIncomingRedirect({
    restorePreviousSession: true,
  });

  return new UmaPod(sessionInfo.webId, unauth_session.fetch);
}

function parseWwwAuthenticateHeader(header: string): {
  umaUri: string;
  permissionTicket: string;
} {
  const header_split = header.split(",");
  const umaStartIndex = header_split[0].indexOf('"') + 1;
  const umaUri = header_split[0].slice(umaStartIndex, -1);

  const ticketStartIndex = header_split[1].indexOf('"') + 1;
  const permissionTicket = header_split[1].slice(ticketStartIndex, -1);

  return {
    umaUri,
    permissionTicket,
  };
}

async function getUmaConfiguration(umaUri: string): Promise<UmaConfiguration> {
  const response = await fetch(`${umaUri}/.well-known/uma2-configuration`);
  return await response.json();
}
