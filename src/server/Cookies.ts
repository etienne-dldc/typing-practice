import { serialize } from "cookie";
import { ServerEnvs } from "./ServerEnvs";
import Iron from "@hapi/iron";

type Cookies = Record<string, string>;

const ONE_WEEK_IN_SECONDS = 7 * 24 * 60 * 60;

export async function createTokenCookie(token: string): Promise<string> {
  const tokenIroned = await Iron.seal(token, ServerEnvs.COOKIE_SECRET, Iron.defaults);
  const cookie = serialize(ServerEnvs.COOKIE_TOKEN_NAME, tokenIroned, {
    maxAge: ONE_WEEK_IN_SECONDS,
    expires: new Date(Date.now() + ONE_WEEK_IN_SECONDS * 1000),
    httpOnly: true,
    secure: ServerEnvs.IS_PRODUCTION,
    path: "/",
    sameSite: "lax",
  });
  return cookie;
}

export function removeTokenCookie(): string {
  const cookie = serialize(ServerEnvs.COOKIE_TOKEN_NAME, "", {
    maxAge: -1,
    path: "/",
  });
  return cookie;
}

export async function getTokenCookie(cookies: Cookies): Promise<string | null> {
  const tokenIroned = cookies[ServerEnvs.COOKIE_TOKEN_NAME];
  if (!tokenIroned || tokenIroned.length === 0) {
    return null;
  }
  const token: string = await Iron.unseal(tokenIroned, ServerEnvs.COOKIE_SECRET, Iron.defaults);
  return token;
}
