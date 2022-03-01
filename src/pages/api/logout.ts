import { ApiResponse, createApiHandler } from "nextype/server";
import { routeHref } from "src/generated/routes";
import { removeTokenCookie } from "src/server/Cookies";
import { AuthenticationMiddleware, IsAuthenticatedMiddleware } from "src/server/middlewares/Authentication";

export default createApiHandler(AuthenticationMiddleware(), IsAuthenticatedMiddleware(), async () => {
  const tokenCookie = removeTokenCookie();

  return ApiResponse.create(301, null, [
    ["Location", routeHref("/connexion")],
    ["Set-Cookie", tokenCookie],
  ]);
});
