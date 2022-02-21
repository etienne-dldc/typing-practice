export const routes = {
  "/api/rpc/[route]": (params: { route: string }) => `/api/rpc/${params.route}`,
  "/connexion": () => `/connexion`,
  "/": () => `/`,
  "/inscription": () => `/inscription`,
} as const;

export type Routes = typeof routes;
export type RoutePathname = keyof Routes;
export type RouteParams = { [K in keyof Routes]: Parameters<Routes[K]>[0] };
export type Route = { pathname: RoutePathname; href: string };

export function route<K extends RoutePathname>(
  pathname: K,
  ...args: RouteParams[K] extends undefined ? [] : [params: RouteParams[K]]
): Route {
  return { pathname, href: routes[pathname]((args[0] || {}) as any) };
}
