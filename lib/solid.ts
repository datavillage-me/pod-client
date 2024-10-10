import {
  login,
  getDefaultSession,
  handleIncomingRedirect,
} from "@inrupt/solid-client-authn-browser";

export const SOLID = "solid";

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

export async function finishLogin(): Promise<string> {
  const sessionInfo = await handleIncomingRedirect();
  if (!sessionInfo || !sessionInfo.webId) {
    return "";
  }

  return sessionInfo.webId;
}
