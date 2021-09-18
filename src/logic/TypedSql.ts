/* eslint-disable @typescript-eslint/ban-types */
import { Builder, Statement } from "./JarvisQueryBuilder";
import * as z from "zod";
import { DataType } from "./JarvisApi.types";

type RecordAny = Record<string, any>;

const WITH_PARAMS = Symbol("WITH_PARAMS");

type WithParams<Params extends RecordAny> = {
  fragment: string;
  [WITH_PARAMS]: Params;
};

function withParams<Params extends RecordAny>(fragment: string): WithParams<Params> {
  return {
    fragment,
    [WITH_PARAMS]: {} as any,
  };
}

type Expression<Params extends RecordAny> = string | WithParams<Params>;

type ExpressionAny = Expression<any>;

type ExpressionToParams<Ex> = Ex extends WithParams<infer P> ? P : {};
type EToP<Ex> = ExpressionToParams<Ex>;

type MergeParams<Left extends ExpressionAny, Right extends ExpressionAny> = ExpressionToParams<Left> &
  ExpressionToParams<Right>;

function binaryExpr(joiner: string) {
  return function binary<Left extends ExpressionAny, Right extends ExpressionAny>(
    left: Left,
    right: Right
  ): WithParams<MergeParams<Left, Right>> {
    return withParams(`(${expr.print(left)} ${joiner} ${expr.print(right)})`);
  };
}

export const table = {
  leftJoin(lTable: string, lCol: string, rTable: string, rCol: string): string {
    return `${lTable} LEFT JOIN ${rTable} ON ${lTable}.${lCol} = ${rTable}.${rCol}`;
  },
};

export const expr = {
  equal: binaryExpr("="),
  and: binaryExpr("AND"),
  or: binaryExpr("OR"),
  lte: binaryExpr("<="),
  gte: binaryExpr(">="),
  isNull<Exp extends ExpressionAny>(inner: Exp): WithParams<EToP<Exp>> {
    return withParams(`(${expr.print(inner)} IS NULL)`);
  },
  param<Name extends string>(name: Name): { type<T>(): WithParams<Record<Name, T>> } {
    return {
      type: () => withParams(`@${name}`),
    };
  },
  stringParam<Name extends string>(name: Name): WithParams<Record<Name, string>> {
    return withParams(`:${name}`);
  },
  raw(val: string): WithParams<{}> {
    return withParams(val);
  },
  date<Exp extends ExpressionAny>(inner: Exp, modifier?: "unixepoch" | "localtime" | "utc"): WithParams<EToP<Exp>> {
    return withParams(`date(${expr.print(inner)}${modifier ? `, '${modifier}'` : ""})`);
  },
  print(exp: ExpressionAny): string {
    if (typeof exp === "string") {
      return exp;
    }
    return exp.fragment;
  },
};

export type ColumnAlias = {
  value: ExpressionAny;
  schema: z.Schema<any>;
};

type SelectOptionsColumn = z.Schema<any> | ColumnAlias;

type SelectOptionsColumnVal<Col extends SelectOptionsColumn> = Col extends ColumnAlias
  ? z.infer<Col["schema"]>
  : Col extends z.Schema<infer T>
  ? T
  : never;

type SelectOptionsColumnsParams<Cols extends Record<string, SelectOptionsColumn>> = UnionToIntersection<
  { [K in keyof Cols]: Cols[K] extends ColumnAlias ? EToP<Cols[K]["value"]> : never }[keyof Cols]
>;

type SelectOptions = {
  table: string;
  columns: Record<string, SelectOptionsColumn>;
  where?: ExpressionAny;
  limit?: ExpressionAny;
  offset?: ExpressionAny;
  orderBy?: ExpressionAny;
};

type SelectStatment<Options extends SelectOptions> = Statement<
  [
    EToP<Options["where"]> &
      EToP<Options["limit"]> &
      EToP<Options["offset"]> &
      EToP<Options["orderBy"]> &
      SelectOptionsColumnsParams<Options["columns"]>
  ],
  { [K in keyof Options["columns"]]: SelectOptionsColumnVal<Options["columns"][K]> }
>;

export function select<Options extends SelectOptions>(
  builder: Builder,
  { columns, table, where, limit, offset, orderBy }: Options
): SelectStatment<Options> {
  const colsSchema: Record<string, z.Schema<any>> = {};
  const colsStr: Array<string> = [];
  for (const [key, col] of Object.entries(columns)) {
    if (col instanceof z.Schema) {
      colsStr.push(key);
      colsSchema[key] = col;
    } else {
      colsSchema[key] = col.schema;
      colsStr.push(`${expr.print(col.value)} AS ${key}`);
    }
  }

  const cols = colsStr.join(", ");
  return builder.prepare(
    join(
      `SELECT ${cols} FROM ${table}`,
      where && `WHERE ${expr.print(where)}`,
      orderBy && `ORDER BY ${expr.print(orderBy)}`,
      limit && `LIMIT ${expr.print(limit)}`,
      offset && `OFFSET ${expr.print(offset)}`
    ),
    z.strictObject(colsSchema) as any
  );
}

export type CreateTableColumn = {
  name: string;
  type: DataType;
  primary?: boolean;
  nullable?: boolean;
  defaultValue?: unknown | null;
};

type CreateTableOptions = {
  tableName: string;
  columns: Array<CreateTableColumn>;
  primaryKeys?: Array<string>;
};

export function createTable(
  builder: Builder,
  { columns, tableName, primaryKeys }: CreateTableOptions
): Statement<[], null> {
  const cols = columns.map(({ name, type, nullable = false, primary = false, defaultValue }) => {
    return join(
      `${name} ${type}`,
      !nullable && !primary && `NOT NULL`,
      primary && `PRIMARY KEY`,
      defaultValue !== undefined && `DEFAULT ${defaultValue}`
    );
  });
  const items = [...cols, primaryKeys && `PRIMARY KEY (${primaryKeys.join(", ")})`];
  return builder.prepare(`CREATE TABLE ${tableName} (${joinBy(", ", items)});`, z.null());
}

type InsertIntoOptions = {
  table: string;
  columns: Record<string, ExpressionAny>;
};

type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer R) => any ? R : never;

export function insertInto<Options extends InsertIntoOptions>(
  builder: Builder,
  { columns, table }: Options
): Statement<[UnionToIntersection<EToP<Options["columns"][keyof Options["columns"]]>>], null> {
  const colsKeys: Array<string> = [];
  const colsExprs: Array<string> = [];
  Object.entries(columns).forEach(([key, val]) => {
    colsKeys.push(key);
    colsExprs.push(expr.print(val));
  });
  return builder.prepare(`INSERT INTO ${table}(${colsKeys.join(", ")}) VALUES (${colsExprs.join(", ")})`, z.null());
}

function join(...items: Array<string | null | undefined | false>): string {
  return items.filter((v) => Boolean(v)).join(" ");
}

function joinBy(sep: string, items: Array<string | null | undefined | false>): string {
  return items.filter((v) => Boolean(v)).join(sep);
}
