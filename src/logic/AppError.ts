import { ApiError } from "nextype/shared";
import { expectNever } from "./Utils";

export type AppError =
  | { type: "BarError" }
  | { type: "AuthenticationError"; reason: "UserNotFound" | "OtpExpired" | "OtpInvalid" | "MustBeAnonymous" }
  | { type: "Unauthorized"; reason: "AdminOnly" }
  | { type: "WhitelistError"; reason: "EmailAlreadyInWhitelist" | "EmailNotInWhitelist" };

export function getAppErrorStatus(error: AppError): number {
  switch (error.type) {
    case "BarError":
    case "AuthenticationError":
      return 401;
    case "Unauthorized":
      return 403;
    case "WhitelistError":
      return 400;
    default:
      return expectNever(error);
  }
}

export function createAppError(error: AppError): ApiError<AppError> {
  return new ApiError<AppError>({ type: "AppError", error });
}
