import {
  login,
  getDefaultSession,
  ILoginInputOptions,
} from "@inrupt/solid-client-authn-browser";
import { Pod } from "./interfaces";
import {
  JsonLd,
  VerifiableCredentialApiConfiguration,
} from "@inrupt/solid-client-vc";
import { UmaConfiguration } from "@inrupt/solid-client-access-grants/dist/type/UmaConfiguration";
import { getPodUrlAll } from "@inrupt/solid-client";
import { AccessGrant } from "@inrupt/solid-client-access-grants";

type FetchFn = typeof fetch;
export type UmaPodConfig = {
  userWebId: string;
  applicationIdToken: string;
};

export type AccessGrantFilter = {
  credentialSubject: {
    providedConsent?: {
      isProvidedTo?: string;
      forPersonalData?: string | string[];
    };
  };
};

export class UmaPod implements Pod {
  userWebId: string;
  podUrl: string;
  fetch: FetchFn;

  constructor(userWebId: string, podUrl: string | undefined, fetch: FetchFn) {
    console.log("Creating solid pod for", userWebId);
    this.userWebId = userWebId;
    this.podUrl = podUrl;
    this.fetch = fetch;
  }

  async grantAccess(
    webId: string,
    resources: string[],
    duration_days: number
  ): Promise<AccessGrant> {
    if (!resources.length) return;
    // assume same vc and uma
    // TODO: should we not keep the configuration of the servers in memory?
    const { umaUri } = await getUmaUrifromResource(resources[0]);
    const { verifiable_credential_issuer } = await getUmaConfiguration(umaUri);

    // create and issue request
    const accessRequest = constructAccessGrant(webId, resources, duration_days);
    const { issuerService } = await getVcConfiguration(
      verifiable_credential_issuer
    );

    const accessGrant = await this.fetch(issuerService, {
      method: "POST",
      body: JSON.stringify({ credential: accessRequest }),
      mode: "cors",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });

    if (!accessGrant.ok) {
      throw Error(
        `Could not set grant to VC server. Got [${
          accessGrant.status
        }]: ${await accessGrant.text()}`
      );
    }
    return await accessGrant.json();
  }

  async getAccessGrantsForWebId(webId: string): Promise<{
    "@context": string[];
    type: "VerifiablePresentation";
    holder: string;
    verifiableCredential: AccessGrant[];
  }> {
    const { umaUri } = await getUmaUrifromResource(this.podUrl);
    const { verifiable_credential_issuer } = await getUmaConfiguration(umaUri);
    const { derivationService } = await getVcConfiguration(
      verifiable_credential_issuer
    );

    const accessGrantFilter = createAccessGrantFilter(webId);
    const accessGrants = await this.fetch(derivationService, {
      body: JSON.stringify(accessGrantFilter),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!accessGrants.ok) {
      throw Error(
        `Could not derive access grants. Got [${
          accessGrants.status
        }]: ${await accessGrants.text()}`
      );
    }

    return await accessGrants.json();
  }

  async revokeAccessGrant(accessGrantUri: string, vc_uri?: string) {
    if (!vc_uri) {
      // docs say that access grant uri is of the form https://vc.<ESS DOMAIN>/vc/<value>
      const sliceIndex = accessGrantUri.indexOf("/vc/");
      if (sliceIndex == -1) {
        throw Error(
          `Could not derive vc uri from access grant uri ${accessGrantUri}`
        );
      }
      vc_uri = accessGrantUri.slice(0, sliceIndex);
    }
    const revokeGrantPayload = {
      credentialId: accessGrantUri,
      credentialStatus: [{ type: "RevocationList2020Status", status: 1 }],
    };
    const { statusService } = await getVcConfiguration(vc_uri);

    const response = await this.fetch(statusService, {
      method: "POST",
      body: JSON.stringify(revokeGrantPayload),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw Error(
        `Could not revoke access grant. Got [${
          response.status
        }]: ${await response.text()}`
      );
    }
  }
}

export async function startLogin(options: ILoginInputOptions): Promise<void> {
  // Start the Login Process if not already logged in.
  if (!getDefaultSession().info.isLoggedIn) {
    await login(options);
  }
}

export async function getCurrentPod(): Promise<Pod> {
  const session = getDefaultSession();

  const sessionInfo = await session.handleIncomingRedirect({
    restorePreviousSession: true,
  });

  const podUrls = await getPodUrlAll(sessionInfo.webId);

  return new UmaPod(
    sessionInfo.webId,
    podUrls.length ? podUrls[0] : undefined,
    session.fetch
  );
}

// TODO: don't use deprecated type JsonLd
export function constructAccessGrant(
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

export async function getUmaUrifromResource(resourceUri: string): Promise<
  | {
      umaUri: string;
      permissionTicket: string;
    }
  | undefined
> {
  // TODO find more elegant way
  const response = await fetch(resourceUri);

  return parseWwwAuthenticateHeader(response.headers.get("Www-Authenticate"));
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

async function getVcConfiguration(
  vcUri: string
): Promise<VerifiableCredentialApiConfiguration> {
  const response = await fetch(`${vcUri}/.well-known/vc-configuration`);
  return await response.json();
}

function createAccessGrantFilter(
  webId?: string,
  resource_uri?: string | string[]
): { verifiableCredential: AccessGrantFilter } {
  return {
    verifiableCredential: {
      credentialSubject: {
        providedConsent: {
          isProvidedTo: webId,
          forPersonalData: resource_uri,
        },
      },
    },
  };
}
