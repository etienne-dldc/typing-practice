/* eslint-disable @typescript-eslint/ban-types */

export type SqlStatementExecMode = "run" | "get" | "all";

export type SqlTransactionMode = "deferred" | "immediate" | "exclusive";

export type SqlCommandPrepare = {
  type: "prepare";
  id: string;
  sql: string;
};

export type SqlCommandPragma = {
  type: "pragma";
  pragma: string;
  simple: boolean;
};

export type SqlCommandStatementExec = {
  type: "statement-exec";
  id: string;
  mode: SqlStatementExecMode;
  statementId: string;
  bindParameters: Array<any>;
};

export type SqlCommandTransactionExec = {
  type: "transaction-exec";
  mode: SqlTransactionMode | null;
  transactionId: string;
};

export type SqlCommandCreateTransaction = {
  type: "transaction";
  id: string;
  commands: SqlCommands;
};

export type SqlCommand =
  | SqlCommandCreateTransaction
  | SqlCommandPrepare
  | SqlCommandPragma
  | SqlCommandStatementExec
  | SqlCommandTransactionExec;

export type SqlCommands = Array<SqlCommand>;

export type SqlQueryResultKeys = null | string | Record<string, string>;

export type SqlQuery = {
  commands: SqlCommands;
  results: SqlQueryResultKeys;
};

export type SqlQueryResult = null | unknown | Record<string, unknown>;

export type UserAccessDatabase = "read" | "write" | "none";

export type UserAccess = {
  database: UserAccessDatabase;
  fileUpload: boolean;
  fileDelete: boolean;
  managerUsers: boolean;
};

export type MeUser = {
  name: string;
  username: string;
  access: UserAccess;
};

export type UserListItem = {
  name: string;
  username: string;
  access: UserAccess;
};

export type UserList = Array<UserListItem>;

export type DataType = "NULL" | "INTEGER" | "REAL" | "TEXT" | "BLOB";

export type SchemaColumn = {
  name: string;
  type: DataType;
  notNull: boolean;
  defaultValue: unknown | null;
  primary: boolean;
};

export type SchemaTable = {
  name: string;
  sql: string;
  columns: Array<SchemaColumn>;
};

export type Schema = Array<SchemaTable>;

export type UpdateUserData = { name?: string; password?: string; access?: Partial<UserAccess> };

export type ApiRouteKind = "Query" | "Mutation";

export type ApiRoute<Kind extends ApiRouteKind, Input, Result> = {
  kind: Kind;
  input: Input;
  result: Result;
};

export type ApiRouteQuery<Input, Result> = ApiRoute<"Query", Input, Result>;
export type ApiRouteMutation<Input, Result> = ApiRoute<"Mutation", Input, Result>;

export type ParamFile = { __type: "file" };

export type ApiV1 = {
  login: ApiRouteMutation<{ username: string; password: string }, null>;
  logout: ApiRouteMutation<null, null>;
  me: ApiRouteQuery<null, MeUser | null>;
  updateMe: ApiRouteMutation<{ name?: string; password?: string }, null>;
  deleteFile: ApiRouteMutation<{ fileName: string }, null>;
  sqlQuery: ApiRouteMutation<{ query: SqlQuery }, SqlQueryResult>;
  meta: ApiRouteQuery<null, { projectName: string }>;
  schema: ApiRouteQuery<null, Schema>;
  uploadFile: ApiRouteMutation<{ file: ParamFile }, { filePath: string }>;
  users: ApiRouteQuery<null, UserList>;
  addUser: ApiRouteMutation<{ name: string; username: string; password: string }, null>;
  updateUser: ApiRouteMutation<{ username: string; data: UpdateUserData }, null>;
  deleteUser: ApiRouteMutation<{ username: string }, null>;
};
