import { useRouter } from "next/router";
import NextLink from "next/link";
import type { ParsedUrlQuery, ParsedUrlQueryInput } from "node:querystring";
import { Params } from "./Params";
import { useParams } from "./ParamsProvider";
import { useMemo } from "react";
import { INTERNAL } from "./utils";
import { encode } from "querystring";

export type Route = {
  pathname: string;
  href: string;
};

export type ParamsUpdate = (params: Params) => Params;

export type LinkProps = {
  route?: Route;
  params?: Params | ParamsUpdate;
  children: React.ReactNode;
  passHref?: boolean;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
};

export function Link({
  children,
  route,
  params,
  ...linkProps
}: LinkProps): JSX.Element | null {
  const router = useRouter();
  const currentRoute = useMemo((): Route => {
    const url = new URL(router.asPath, "http://placeholder.local");
    return { href: url.pathname, pathname: router.pathname };
  }, [router.asPath, router.pathname]);
  const routeResolved = route ?? currentRoute;
  const providedParams = useParams();
  const query = useMemo((): ParsedUrlQueryInput => {
    if (!params) {
      return providedParams[INTERNAL](routeResolved.pathname);
    }
    if (typeof params === "function") {
      return params(providedParams)[INTERNAL](routeResolved.pathname);
    }
    return params[INTERNAL](routeResolved.pathname);
  }, [params, providedParams, routeResolved.pathname]);

  const search = useMemo((): string => {
    return encode(query);
  }, [query]);

  return (
    <NextLink href={{ pathname: routeResolved.href, search }} {...linkProps}>
      {children}
    </NextLink>
  );
}

type ParsedUrlQueryString = Record<string, string>;

function noArrayQuery(query: ParsedUrlQuery): ParsedUrlQueryString {
  const result: ParsedUrlQueryString = {};
  for (const key in query) {
    let val = query[key];
    if (Array.isArray(val)) {
      val = val[0];
    }
    if (val) {
      result[key] = val;
    }
  }
  return result;
}
