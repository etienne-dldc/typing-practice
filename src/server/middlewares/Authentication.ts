import { createKey } from "miid";
import { routeHref } from "src/generated/routes";
import { createAppError } from "src/logic/AppError";
import { ApiResponse, DynamicMiddleware, GsspResponse, dynamicMiddlewareFactory, Middleware } from "nextype/server";
import { getMeUser, MeUser } from "src/server/Authentication";
import { getTokenCookie, removeTokenCookie } from "src/server/Cookies";

type AuthenticationData = { meUser: MeUser | false; token: string | null };

export const AuthenticationKey = createKey<AuthenticationData>({ name: "Authentication" });

export const AuthenticatedKey = createKey<MeUser>({ name: "MeUser" });

export const AuthenticationMiddleware = dynamicMiddlewareFactory(async (ctx, next) => {
  const req = ctx.req;
  const token = await getTokenCookie(req.cookies);
  const meUser = await getMeUser(token);
  const result = await next(ctx.with(AuthenticationKey.Provider({ meUser, token })));
  if (result instanceof GsspResponse) {
    return result.addProps({ meUser });
  }
  return result;
});

export const IsAnonymousMiddleware = dynamicMiddlewareFactory(async (ctx, next) => {
  const { meUser, token } = ctx.getOrFail(AuthenticationKey.Consumer);
  if (meUser) {
    if (ctx.mode === "Gssp") {
      return GsspResponse.create({
        redirect: {
          destination: routeHref("/"),
          permanent: false,
        },
      });
    }
    throw createAppError({ type: "AuthenticationError", reason: "MustBeAnonymous" });
  }
  const res = await next(ctx);
  if (token) {
    // Remove token
    const tokenCookieHeaders = removeTokenCookie();
    if (res instanceof GsspResponse) {
      return res.addHeaders(["Set-Cookie", tokenCookieHeaders]);
    }
    if (res instanceof ApiResponse) {
      return res.addHeaders(["Set-Cookie", tokenCookieHeaders]);
    }
  }
  return res;
});

export const IsAuthenticatedMiddleware = dynamicMiddlewareFactory(async (ctx, next) => {
  const { meUser } = ctx.getOrFail(AuthenticationKey.Consumer);
  if (!meUser) {
    if (ctx.mode === "Gssp") {
      return GsspResponse.create({
        redirect: {
          destination: routeHref("/connexion"),
          permanent: false,
        },
      });
    }
    throw createAppError({ type: "AuthenticationError", reason: "UserNotFound" });
  }
  return next(ctx.with(AuthenticatedKey.Provider(meUser)));
});

// export const IsAdminAuthenticatedMiddleware = dynamicMiddlewareFactory(async (ctx, next) => {});

// export const IsAdminAuthenticatedMiddleware: Middleware = () => {
//   throw new Error("Method not implemented.");
// };
