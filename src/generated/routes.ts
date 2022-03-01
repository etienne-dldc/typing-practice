import * as _api__rpc__$route from "../pages/api/rpc/[route]";
import * as _connexion from "../pages/connexion";
import * as _ from "../pages/index";

export const routes = {
  "/api/rpc/[route]": {
    path: (params: { route: string }) => `/api/rpc/${params.route}`,
    mod: _api__rpc__$route,
  },
  "/connexion": { path: () => `/connexion`, mod: _connexion },
  "/": { path: () => `/`, mod: _ },
} as const;

export type Routes = typeof routes;
export type RoutePathname = keyof Routes;
export type RouteParams = {
  [K in keyof Routes]: Parameters<Routes[K]["path"]>[0];
};
export type Route = { pathname: RoutePathname; href: string };
export type RouteArgs<K extends RoutePathname> =
  RouteParams[K] extends undefined ? [] : [params: RouteParams[K]];

export function route<K extends RoutePathname>(
  pathname: K,
  ...args: RouteArgs<K>
): Route {
  return { pathname, href: routes[pathname].path((args[0] || {}) as any) };
}

export function routeHref<K extends RoutePathname>(
  pathname: K,
  ...args: RouteArgs<K>
): string {
  return route(pathname, ...args).href;
}

export function routeModule<K extends RoutePathname>(
  pathname: K
): Routes[K]["mod"] {
  return routes[pathname].mod;
}
