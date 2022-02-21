import { useRouter } from "next/router";
import { ParsedUrlQuery } from "node:querystring";
import {
  createContext,
  MutableRefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { Param } from "./Param";
import { Params } from "./Params";
import jsonUrl from "@jsonurl/jsonurl";
import { INTERNAL } from "./utils";

const ParamsContext = createContext<Params | null>(null);

export type ParamsConfig = Record<string, Param<any>>;

export function useParams(): Params {
  const params = useContext(ParamsContext);
  if (!params) {
    throw new Error("ParamsProvider not found");
  }
  return params;
}

export type ParamsProviderProps = {
  params: ParamsConfig;
  children: React.ReactNode;
};

export function ParamsProvider({
  params: config,
  children,
}: ParamsProviderProps): JSX.Element | null {
  const router = useRouter();

  const queryRef = useRef<ParsedUrlQuery | null>(null);
  const dataRef = useRef<Record<string, any> | null>(null);

  const data = useMemo((): Record<string, any> => {
    const query = noArrayQuery(router.query);
    const data: Record<string, any> = {};
    Object.entries(config).forEach(([key, param]) => {
      const queryStr = query[key];
      if (!queryStr) {
        return;
      }
      if (queryRef.current && dataRef.current) {
        const previousQueryStr = queryRef.current[key];
        if (previousQueryStr === queryStr) {
          data[key] = dataRef.current[key];
          return;
        }
      }
      // try to parse query string
      const json = safeJsonUrlParse(key, queryStr);
      if (json === null) {
        return;
      }
      // try to validate query string
      const parsed = param[INTERNAL].schema.safeParse(json);
      if (parsed.success === false) {
        console.warn(
          `Error while parsing query string "${key}": ${parsed.error}`
        );
        return;
      }
      data[key] = parsed.data;
    });
    return data;
  }, [config, router.query]);

  useEffect(() => {
    queryRef.current = router.query;
  }, [router.query]);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const params = useMemo(
    () => Params[INTERNAL](config, router.pathname, data),
    [config, data, router.pathname]
  );

  return (
    <ParamsContext.Provider value={params}>{children}</ParamsContext.Provider>
  );
}

type ParsedUrlQueryString = Record<string, string | undefined>;

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

function safeJsonUrlParse(key: string, data: string): null | any {
  try {
    return jsonUrl.parse(data, { AQF: true });
  } catch (error) {
    console.warn(`Error while parsing query string "${key}": ${error}`);
    return null;
  }
}

const refEqual = (l: any, r: any) => l === r;

function usePrevious<T>(
  equal: (l: T, r: T) => boolean = refEqual
): [previousRef: MutableRefObject<T | null>, useSync: (val: T) => void] {
  const currentRef = useRef<T | null>(null);
  const previousRef = useRef<T | null>(null);

  // const previous = (() => {
  //   if (!equal(currentRef.current as any, currentRef.current as any)) {
  //     return currentRef.current;
  //   }
  //   return previousRef.current;
  // })();

  const useSync = useCallback(
    function useSync(value: T) {
      useEffect(() => {
        if (!equal(currentRef.current as any, value)) {
          previousRef.current = currentRef.current;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [equal, value]);

      useEffect(() => {
        currentRef.current = value;
      }, [value]);
    },
    [equal]
  );

  return [previousRef, useSync];
}
