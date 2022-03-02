import { routeHref } from "src/generated/routes";
import { createRpcClient } from "nextype/client";
import type { Routes } from "src/server/rpc";
import type { AppError } from "./AppError";

const { useRpcMutation, useRpcQuery, rpcQueryKey } = createRpcClient<Routes, AppError>({
  rpcPath: (route) => routeHref("/api/rpc/[route]", { route }),
});

export { useRpcMutation, useRpcQuery, rpcQueryKey };
