import { createParam, ParamFilter } from "src/libs/params";
import { z } from "zod";
import { RoutePathname } from "src/generated/routes";

function routes(routes: Array<RoutePathname>): ParamFilter {
  return (pathname: string) => routes.includes(pathname as any);
}

export const PARAMS = {
  users: createParam(
    "Users filters",
    z.object({
      limit: z.number().optional(),
      offset: z.number().optional(),
      sort: z.enum(["id", "name", "email"]).optional(),
    })
  ),
  other: createParam("Other param", z.number()),
};
