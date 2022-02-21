import { createTokenCookie } from "src/server/Cookies";
import { createOtpForEmail, validateOtp } from "src/server/database";
import { Mailer } from "src/server/Mailer";
import { HttpHeaders } from "src/server/Utils";
import * as z from "zod";
import { findUserByEmail } from "src/server/database";
import { RpcResult, Route } from "nextype/server";
import { createAppError } from "src/logic/AppError";
import { IsAnonymousMiddleware } from "src/server/middlewares/Authentication";

const requestLogin = Route.mutation()
  .middlewares(IsAnonymousMiddleware())
  .params(z.object({ email: z.string().email(), hCaptchaToken: z.string().optional() }))
  .resolve<{
    email: string;
    id: string;
  }>(async (ctx, { email, hCaptchaToken }) => {
    const user = findUserByEmail(email);
    if (!user) {
      throw createAppError({ type: "AuthenticationError", reason: "UserNotFound" });
    }
    const { otp, id } = createOtpForEmail(email);
    await Mailer.sendLoginOtp(user.name, email, otp);
    return { email, id };
  });

const validateLogin = Route.mutation()
  .middlewares(IsAnonymousMiddleware())
  .params(z.object({ email: z.string().email(), id: z.string(), otp: z.string() }))
  .resolve(async (ctx, { email, otp, id }) => {
    const user = findUserByEmail(email);
    if (!user) {
      throw createAppError({ type: "AuthenticationError", reason: "UserNotFound" });
    }
    const currentOtp = validateOtp(id, email, otp);
    if (currentOtp.status === "EXPIRED") {
      throw createAppError({ type: "AuthenticationError", reason: "OtpExpired" });
    }
    if (currentOtp.status === "INVALID") {
      throw createAppError({ type: "AuthenticationError", reason: "OtpInvalid" });
    }
    const tokenCookie = await createTokenCookie(user.token);
    return new RpcResult(null, [[HttpHeaders.SetCookie, tokenCookie]]);
  });

export const user = Route.namespace("user", null, {
  requestLogin,
  validateLogin,
});
