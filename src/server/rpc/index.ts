import { Route } from "nextype/server";

const hello = Route.query().resolve(async () => {
  return { hello: "world" };
});

export const routes = {
  hello,
};

export type Routes = typeof routes;
