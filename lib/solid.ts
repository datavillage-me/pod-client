import {
  login,
  getDefaultSession,
  handleIncomingRedirect,
} from "@inrupt/solid-client-authn-browser";
import { Pod } from "./interfaces";
import { issueVerifiableCredential, JsonLd } from "@inrupt/solid-client-vc";
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
  applicationIdToken: string;
  fetch: FetchFn;

  constructor(options: UmaPodConfig) {
    console.log("Creating solid pod for", options.userWebId);
    this.userWebId = options.userWebId;
    this.fetch = (input, init) =>
      this.fetch(input, {
        ...init,
        headers: { Authentication: `Bearer ${options.applicationIdToken}` },
      });
  }

  // TODO: rename
  async getAmaRedirectUrl(
    resourceUris: string[],
    amaRootUrl: string,
    redirectUrl: string
  ): Promise<string> {
    // Create an access request
    const accessRequest = constructAccessRequest(
      resourceUris,
      this.userWebId,
      5 * 60
    );

    console.log(accessRequest);

    // Assume all resources have same vc
    const { umaUri } = await getVcInfofromResource(resourceUris[0]);
    console.log("Got uma uri", umaUri);

    const { verifiable_credential_issuer } = await getUmaConfiguration(umaUri);

    // issue access request to VC
    // TODO: don't hardcode /issue endpoint
    const requestVc = await issueVerifiableCredential(
      `${verifiable_credential_issuer}/issue`,
      getSubjectClaims(resourceUris, this.userWebId),
      getCredentialClaims(5 * 60),
      { returnLegacyJsonld: false, fetch: this.fetch }
    );

    console.log("requestVc", requestVc);

    // redirect to AMA with access request
    const urlParams = `?requestVcUrl=${encodeURIComponent(
      requestVc.id
    )}&redirectUrl=${encodeURIComponent(redirectUrl)}`;
    console.log("URL params", urlParams);

    return `${amaRootUrl}${urlParams}`;
  }
}

export async function startLogin(
  issuer: string,
  callback: string
): Promise<void> {
  // Start the Login Process if not already logged in.
  if (!getDefaultSession().info.isLoggedIn) {
    await login({
      oidcIssuer: issuer,
      redirectUrl: callback,
      clientName: "My application",
    });
  }
}

export async function finishLogin(): Promise<UmaPod | undefined> {
  await handleIncomingRedirect();
  const session = await getDefaultSession();
  console.log("Got session", session);
  // const session = await getDefaultSession();

  if (!session.info.isLoggedIn) {
    console.log("User not logged in");
    return undefined;
  } else if (!session.info.webId) {
    console.log("No session webId", session.info);
    return undefined;
  }

  // TODO: store sessionId
  const podConfig: UmaPodConfig = {
    userWebId: session.info.webId,
    applicationIdToken: appIdToken,
  };

  sessionStorage.setItem(sessionKey, JSON.stringify(podConfig));

  // TODO: get token
  return new UmaPod(podConfig);
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

function getSubjectClaims(resources: string[], webId: string): JsonLd {
  console.log("Getting subject claims for", webId);
  return {
    ...getDefaultContexts(),
    hasConsent: {
      mode: [
        "http://www.w3.org/ns/auth/acl#Read",
        "http://www.w3.org/ns/auth/acl#Write",
      ],
      hasStatus: "https://w3id.org/GConsent#ConsentStatusRequested",
      forPersonalData: resources,
      isConsentForDataSubject: webId,

      forPurpose:
        "https://solid.data.vlaanderen.be/doc/concept/Purpose/Acme-Purpose",
    },
  };
}

function getCredentialClaims(duration_s: number): JsonLd {
  const today = Date.now();
  const expiration = new Date(today + duration_s * 1000);
  return {
    ...getDefaultContexts(),
    issuanceDate: new Date(today).toISOString(),
    expirationDate: expiration.toISOString(),
    type: ["SolidAccessRequest"],
  };
}

// TODO: don't use deprecated type
export function constructAccessRequest(
  resources: string[],
  webId: string,
  duration_s: number
): JsonLd {
  const today = new Date();
  const expiration = new Date(today.getSeconds() + duration_s);
  return {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://solid.data.vlaanderen.be/ns/access/2023-03-15/access.jsonld",
      "https://schema.inrupt.com/credentials/v1.jsonld",
    ],
    credentialSubject: {
      hasConsent: {
        mode: [
          "http://www.w3.org/ns/auth/acl#Read",
          "http://www.w3.org/ns/auth/acl#Write",
        ],
        hasStatus: "https://w3id.org/GConsent#ConsentStatusRequested",
        forPersonalData: resources,
        isConsentForDataSubject: webId,

        forPurpose:
          "https://solid.data.vlaanderen.be/doc/concept/Purpose/Acme-Purpose",
      },
    },
    issuanceDate: today.toISOString(),
    exirationDate: expiration.toISOString(),
    type: ["SolidAccessRequest", "VerifiableCredential"],
  };
}

export async function getVcInfofromResource(resourceUri: string): Promise<
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
  const sessionConfig = JSON.parse(sessionStorage.getItem(sessionKey));
  if (sessionConfig == null) {
    console.log("user not logged in");
    return undefined;
  }
  console.log("config from storage", sessionConfig);
  return new UmaPod(sessionConfig as UmaPodConfig);
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
