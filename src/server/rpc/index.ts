import { Route } from "nextype/server";
import { user } from "./user";

const hello = Route.query().resolve(async () => {
  return { hello: "world" };
});

export const routes = {
  hello,
  ...user,
};

export type Routes = typeof routes;
