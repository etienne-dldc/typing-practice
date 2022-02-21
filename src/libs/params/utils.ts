import jsonUrl from "@jsonurl/jsonurl";

type JsonURLStringifyOptions = Parameters<typeof jsonUrl.stringify>[1];
type JsonURLParseOptions = Parameters<typeof jsonUrl.parse>[1];

export const INTERNAL = Symbol.for("NEXT_PARAMS_INTERNAL");
