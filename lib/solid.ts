import {
  login,
  getDefaultSession,
  handleIncomingRedirect,
} from "@inrupt/solid-client-authn-browser";
import { Pod } from "./dist";

export const SOLID = "solid";

export class SolidPod implements Pod {
  webId: string;
  issuer: string;

  constructor(webId: string, issuer: string) {
    this.webId = webId;
    this.issuer = issuer;
  }
}

export async function startLogin(): Promise<void> {
  // Start the Login Process if not already logged in.
  if (!getDefaultSession().info.isLoggedIn) {
    await login({
      oidcIssuer: "https://idp.dev.jouw.id",
      redirectUrl: new URL("/callback", window.location.href).toString(),
      clientName: "My application",
    });
  }
}

export async function finishLogin(): Promise<SolidPod> {
  const sessionInfo = await handleIncomingRedirect();
  if (!sessionInfo || !sessionInfo.webId) {
    Promise.reject("Could not get webId from session");
  }

  return new SolidPod(sessionInfo.webId, "https://idp.dev.jouw.id");
}
