import { SqlQuery, SqlCommands, SqlStatementExecMode, SqlQueryResultKeys, SqlTransactionMode } from "./JarvisApi.types";
import { nanoid } from "nanoid";
import * as z from "zod";

const BUILDER_TYPE = Symbol("BUILDER_TYPE");
const BUILDER_SCHEMA = Symbol("BUILDER_SCHEMA");
const QUERY_RESULT = Symbol("QUERY_RESULT");
const QUERY_RESULT_TYPE = Symbol("QUERY_RESULT_TYPE");

export type Statement<Params extends Array<any>, Result> = {
  [BUILDER_SCHEMA]: z.Schema<Result>;
  [BUILDER_TYPE]: "statement";
  run(...parameters: Params): QueryBuilderCommandResult<{ changes: number; lastInsertRowid: number }>;
  get(...parameters: Params): QueryBuilderCommandResult<Result | null>;
  all(...parameters: Params): QueryBuilderCommandResult<Array<Result>>;
};

type Transaction<Res extends QueryBuilderResult> = {
  [BUILDER_TYPE]: "transaction";
  (): Res;
  deferred(): Res;
  immediate(): Res;
  exclusive(): Res;
};

export type Builder = {
  [BUILDER_TYPE]: "builder";
  prepare<Params extends any[], Result>(sql: string, schema: z.Schema<Result>): Statement<Params, Result>;
  transaction<Res extends QueryBuilderResult>(runner: () => Res): Transaction<Res>;
  pragma(pragma: string, options?: { simple?: boolean }): void;
};

type QueryBuilderCommandResult<Result> = {
  __internal: true;
  [BUILDER_SCHEMA]: z.Schema<Result>;
  [QUERY_RESULT]: { id: string };
  [QUERY_RESULT_TYPE]: Result;
};

function isQueryBuilderCommandResult(val: QueryBuilderResult): val is QueryBuilderCommandResult<any> {
  return val["__internal"] === true;
}

export type QueryBuilderResult = QueryBuilderCommandResult<any> | Record<string, QueryBuilderCommandResult<any>>;

export type QueryBuilderResultValue<T extends QueryBuilderResult> = T extends QueryBuilderCommandResult<infer V>
  ? V
  : { [K in keyof T]: T[K] extends QueryBuilderCommandResult<infer V> ? V : never };

export type BuilderFn = (builder: Builder) => QueryBuilderResult | void;

export function createQuery(exec: BuilderFn): { query: SqlQuery; schema: z.Schema<any> } {
  const commands: SqlCommands = [];
  let currentCommands = commands;
  const builder: Builder = {
    [BUILDER_TYPE]: "builder",
    prepare(sql, schema) {
      const id = nanoid(6);
      currentCommands.push({
        type: "prepare",
        id,
        sql,
      });
      return createStatement(id, schema);
    },
    transaction(runner) {
      const id = nanoid(6);
      const prevCommands = currentCommands;
      currentCommands = [];
      const res = runner();
      const commands = currentCommands;
      currentCommands = prevCommands;
      currentCommands.push({
        type: "transaction",
        id,
        commands,
      });
      return createTransaction(id, res);
    },
    pragma(pragma, { simple = false } = {}) {
      currentCommands.push({
        type: "pragma",
        pragma,
        simple,
      });
    },
  };
  const { results, schema } = extractResult(exec(builder) ?? null);
  const query: SqlQuery = {
    commands,
    results,
  };
  return {
    query,
    schema,
  };

  function extractResult(res: QueryBuilderResult | null): { results: SqlQueryResultKeys; schema: z.Schema<any> } {
    if (res === null) {
      return {
        results: null,
        schema: z.null(),
      };
    }
    if (isQueryBuilderCommandResult(res)) {
      return {
        results: res[QUERY_RESULT].id,
        schema: res[BUILDER_SCHEMA],
      };
    }
    const results: Record<string, string> = {};
    const schemaKeys: Record<string, z.Schema<any>> = {};
    Object.entries(res).forEach(([key, item]) => {
      results[key] = item[QUERY_RESULT].id;
      schemaKeys[key] = item[BUILDER_SCHEMA];
    });
    return {
      results,
      schema: z.object(schemaKeys),
    };
  }

  function createStatement<Params extends Array<any>, Result>(
    statementId: string,
    schema: z.Schema<Result>
  ): Statement<Params, Result> {
    const addCommand = (
      mode: SqlStatementExecMode,
      schema: z.Schema<any>,
      ...parameters: Array<any>
    ): QueryBuilderCommandResult<any> => {
      const id = nanoid(6);
      currentCommands.push({
        type: "statement-exec",
        id,
        bindParameters: parameters,
        mode,
        statementId,
      });
      return {
        __internal: true,
        [BUILDER_SCHEMA]: schema,
        [QUERY_RESULT]: { id },
        [QUERY_RESULT_TYPE]: {} as any,
      };
    };
    return {
      [BUILDER_TYPE]: "statement",
      [BUILDER_SCHEMA]: schema,
      get(...parameters: Array<any>) {
        return addCommand("get", schema.nullable(), ...parameters);
      },
      run(...parameters: Array<any>) {
        return addCommand("run", z.object({ changes: z.number(), lastInsertRowid: z.number() }), ...parameters);
      },
      all(...parameters: Array<any>) {
        return addCommand("all", z.array(schema), ...parameters);
      },
    };
  }

  function createTransaction<Res extends QueryBuilderResult>(id: string, res: Res): Transaction<Res> {
    const addCommand = (mode: SqlTransactionMode | null): Res => {
      currentCommands.push({
        type: "transaction-exec",
        transactionId: id,
        mode,
      });
      return res;
    };
    const transactionBase = (): Res => addCommand(null);
    const transaction: Transaction<Res> = Object.assign(transactionBase, {
      [BUILDER_TYPE]: "transaction" as const,
      deferred: () => addCommand("deferred"),
      immediate: () => addCommand("immediate"),
      exclusive: () => addCommand("exclusive"),
    });
    return transaction;
  }
}
