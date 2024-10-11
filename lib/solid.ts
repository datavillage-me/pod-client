import {
  login,
  getDefaultSession,
  handleIncomingRedirect,
} from "@inrupt/solid-client-authn-browser";
import { Pod } from "./interfaces";
import { issueVerifiableCredential, JsonLd } from "@inrupt/solid-client-vc";

export const SOLID = "solid";

type FetchFn = typeof fetch;

export class SolidPod implements Pod {
  webId: string;
  issuer: string;
  fetch: FetchFn;

  constructor(webId: string, issuer: string, fetch: FetchFn) {
    console.log("Creating solid pod for", webId);
    this.webId = webId;
    this.issuer = issuer;
    this.fetch = fetch;
  }

  async askAccess(resourceUris: string[]): Promise<void> {
    const accessRequest = constructAccessRequest(
      resourceUris,
      this.webId,
      5 * 60
    );

    console.log(accessRequest);

    const requestVc = await issueVerifiableCredential(
      "",
      getSubjectClaims(resourceUris, this.webId),
      getCredentialClaims(5 * 60),
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

export async function finishLogin(
  issuer: string
): Promise<SolidPod | undefined> {
  const session = await getDefaultSession();
  console.log("Got session", session);
  await session.handleIncomingRedirect();
  // const session = await getDefaultSession();

  if (!session.info.isLoggedIn) {
    console.log("User not logged in");
    return undefined;
  } else if (!session.info.webId) {
    console.log("No session webId", session.info);
    return undefined;
  }

  return new SolidPod(session.info.webId, issuer, session.fetch);
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
  const today = new Date();
  const expiration = new Date(today.getSeconds() + duration_s);
  return {
    ...getDefaultContexts(),
    issuanceDate: today.toISOString(),
    exirationDate: expiration.toISOString(),
    type: ["SolidAccessRequest", "VerifiableCredential"],
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
