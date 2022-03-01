export const routes = {
  "/api/rpc/[route]": (params: { route: string }) => `/api/rpc/${params.route}`,
  "/connexion": () => `/connexion`,
  "/": () => `/`,
} as const;

export type Routes = typeof routes;
export type RoutePathname = keyof Routes;
export type RouteParams = { [K in keyof Routes]: Parameters<Routes[K]>[0] };
export type Route = { pathname: RoutePathname; href: string };
export type RouteArgs<K extends RoutePathname> =
  RouteParams[K] extends undefined ? [] : [params: RouteParams[K]];

export function route<K extends RoutePathname>(
  pathname: K,
  ...args: RouteArgs<K>
): Route {
  return { pathname, href: routes[pathname]((args[0] || {}) as any) };
}

export function routeHref<K extends RoutePathname>(
  pathname: K,
  ...args: RouteArgs<K>
): string {
  return route(pathname, ...args).href;
}
