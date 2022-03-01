import { createApiHandler, ApiResponse } from "nextype/server";
import { createTokenCookie } from "src/server/Cookies";
import { findUserByEmail, insertUser } from "src/server/database";
import { ServerEnvs } from "src/server/ServerEnvs";

type UmbrellaUser = {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
};

export default createApiHandler(async (ctx) => {
  console.log(ctx.query.token);

  const res = await fetch(
    `${ServerEnvs.UMBRELLA_URL}/api/${ServerEnvs.UMBRELLA_APP}?secret=${ServerEnvs.UMBRELLA_SECRET}&token=${ctx.query.token}`
  );
  const data: UmbrellaUser = await res.json();

  let user = findUserByEmail(data.email);
  if (!user) {
    user = insertUser(data.email, data.name);
  }
  const tokenCookie = await createTokenCookie(user.token);

  return ApiResponse.create(301, null, [
    ["Location", "/"],
    ["Set-Cookie", tokenCookie],
  ]);
});
