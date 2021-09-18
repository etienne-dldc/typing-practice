import ky from "ky";
import { QueryKey, UseBaseQueryOptions, UseMutationOptions } from "react-query";
import { Auth } from "./AuthStorage";
import { ApiV1 } from "./JarvisApi.types";
import { Builder, createQuery, QueryBuilderResult, QueryBuilderResultValue } from "./JarvisQueryBuilder";
import { notNil } from "./Utils";

export async function jarvisApiHealthcheck(server: string): Promise<true> {
  const res = await ky.get("api/v1/healthcheck", { prefixUrl: server });
  const data = await res.json();
  if (data && data.isJarvis) {
    return true;
  }
  throw new Error("Invalid response");
}

type QueryCommands = {
  [K in keyof ApiV1]: ApiV1[K]["kind"] extends "Query" ? K : never;
}[keyof ApiV1];
type MutationCommands = {
  [K in keyof ApiV1]: ApiV1[K]["kind"] extends "Mutation" ? K : never;
}[keyof ApiV1];

export type CommandInput<K extends keyof ApiV1> = ApiV1[K]["input"];
export type CommandResult<K extends keyof ApiV1> = ApiV1[K]["result"];

export function createJarvisQuery<K extends QueryCommands>(
  account: Auth,
  path: K,
  params: CommandInput<K>
): UseBaseQueryOptions<unknown, unknown, CommandResult<K>> {
  async function queryFn(): Promise<CommandResult<K>> {
    const res = await ky.get(`api/v1/project/${account.app}/rpc/${path}`, {
      credentials: "include",
      prefixUrl: account.server,
      searchParams:
        params === undefined || params === null
          ? undefined
          : {
              input: JSON.stringify(params),
            },
    });
    if (res.status === 204) {
      return null as any;
    }
    return res.json();
  }
  const accountStr = `${account.app}___${account.server}`;
  return {
    queryFn,
    queryKey: [accountStr, path, params],
  };
}

export function createJarvisMutation<K extends MutationCommands>(
  account: Auth,
  path: K,
  options: UseMutationOptions<CommandResult<K>, unknown, CommandInput<K>> = {}
): UseMutationOptions<CommandResult<K>, unknown, CommandInput<K> extends null ? void : CommandInput<K>> {
  async function mutationFn(variables: CommandInput<K>): Promise<CommandResult<K>> {
    const res = await ky.post(`api/v1/project/${account.app}/rpc/${path}`, {
      prefixUrl: account.server,
      credentials: "include",
      json: variables,
    });
    if (res.status === 204) {
      return null;
    }
    return res.json();
  }
  return {
    mutationFn,
    ...options,
  } as any;
}

export function mergeMutation<TData, TVariables, TContext>(
  ...muts: Array<UseMutationOptions<TData, unknown, TVariables, TContext>>
): UseMutationOptions<TData, unknown, TVariables, TContext> {
  const result: UseMutationOptions<TData, unknown, TVariables, TContext> = {};
  muts.forEach((mut) => {
    const onSuccess = mergeFn(result.onSuccess, mut.onSuccess);
    Object.assign(result, mut);
    if (onSuccess) {
      result.onSuccess = onSuccess;
    }
  });
  return result;
}

function mergeFn<Fn extends (...args: Array<any>) => any>(left: Fn | undefined, right: Fn | undefined): Fn | undefined {
  if (left === undefined && right === undefined) {
    return undefined;
  }
  if (left === undefined) {
    return right;
  }
  if (right === undefined) {
    return left;
  }
  return ((...args: Array<any>) => {
    left(...args);
    right(...args);
  }) as any;
}

interface QueryFactory<Output, Variables = void> {
  (...args: Variables extends void ? [account: Auth] : [account: Auth, variables: Variables]): UseBaseQueryOptions<
    unknown,
    unknown,
    Output
  >;
  key: (...args: Variables extends void ? [account: Auth] : [account: Auth, variables: Variables]) => QueryKey;
}

export function createSqlQuery<Output extends QueryBuilderResult, Variables = void>(options: {
  query: (builder: Builder, variables: Variables) => Output;
  key: (variables: Variables) => readonly unknown[];
}): QueryFactory<QueryBuilderResultValue<Output>, Variables> {
  const key = (account: Auth, variables: Variables): QueryKey => {
    const strAccount = `${account.server}___${account.app}`;
    return [strAccount, "sqlQuery", ...options.key(variables)];
  };
  const queryFactory: QueryFactory<QueryBuilderResultValue<Output>, Variables> = function queryFactory(
    account: Auth,
    variables: Variables
  ): UseBaseQueryOptions<unknown, unknown, QueryBuilderResultValue<Output>> {
    const fn = notNil(createJarvisMutation(account, "sqlQuery").mutationFn);
    return {
      queryFn: async () => {
        const { query, schema } = createQuery((db) => options.query(db, variables));
        console.log(query);
        const data = await fn({ query });
        return schema.parse(data);
      },
      queryKey: key(account, variables),
    };
  } as any;
  queryFactory.key = key as any;
  return queryFactory;
}

type SqlMutationOptions<Output, Variables = undefined> = {
  query: (builder: Builder, variables: Variables) => QueryBuilderResult | void;
} & UseMutationOptions<Output, unknown, Variables>;

export function createSqlMutation<Output, Variables = undefined>(
  createOptions: (account: Auth) => SqlMutationOptions<Output, Variables>
) {
  return function mutationFactory(
    account: Auth,
    overrideOptions: UseMutationOptions<Output, unknown, Variables> = {}
  ): UseMutationOptions<Output, unknown, Variables extends undefined ? void : Variables> {
    const fn = notNil(createJarvisMutation(account, "sqlQuery").mutationFn);
    const { query: buildQuery, ...options } = createOptions(account);
    async function mutationFn(variables: Variables): Promise<Output> {
      const { query, schema } = createQuery((db) => buildQuery(db, variables));
      const data = await fn({ query });
      const parsed = schema.parse(data);
      return parsed;
    }
    return {
      mutationFn: mutationFn as any,
      ...options,
      ...overrideOptions,
    } as any;
  };
}
