import {
  createApiHandler,
  ErrorToApiResponseMiddleware,
  RpcMiddleware,
  TransformMiddleware,
} from "nextype/server";
import { routes } from "src/server/rpc";
import { getAppErrorStatus } from "src/logic/AppError";

export default createApiHandler(
  ErrorToApiResponseMiddleware(getAppErrorStatus),
  TransformMiddleware(),
  RpcMiddleware(routes, (query) => query.route as string)
);
