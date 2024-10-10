import { login, getDefaultSession } from "@inrupt/solid-client-authn-browser";

export const SOLID = "solid";

export async function startLogin() {
  // Start the Login Process if not already logged in.
  if (!getDefaultSession().info.isLoggedIn) {
    await login({
      oidcIssuer: "https://idp.dev.jouw.id",
      redirectUrl: new URL("/callback", window.location.href).toString(),
      clientName: "My application",
    });
  }
}
