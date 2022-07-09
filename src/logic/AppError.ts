import { ApiError } from "nextype/shared";
import { expectNever } from "./Utils";

export type AppError =
  | { type: "AuthenticationError"; reason: "UserNotFound" | "MustBeAnonymous" }
  | { type: "Unauthorized"; reason: "AdminOnly" }
  | { type: "MissingProvider"; provider: "User" };

export function getAppErrorStatus(error: AppError): number {
  switch (error.type) {
    case "AuthenticationError":
      return 401;
    case "Unauthorized":
      return 403;
    case "MissingProvider":
      return 500;
    default:
      return expectNever(error);
  }
}

export function createAppError(error: AppError): ApiError<AppError> {
  return new ApiError<AppError>({ type: "AppError", error });
}
