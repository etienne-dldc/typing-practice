import { createJarvisQuery, createSqlMutation, createSqlQuery } from "./JarvisApi";
import * as z from "zod";
import { queryClient } from "./queryClient";
import { createTable, expr, insertInto, select, table } from "./TypedSql";
import { Schema } from "./JarvisApi.types";
import { dateToUtcUnixepoch } from "./Utils";

export const APP_SCHEMA: Schema = [
  {
    name: "Events",
    sql: "CREATE TABLE Events (id TEXT NOT NULL, createdAt REAL NOT NULL DEFAULT (strftime('%s','now')), name TEXT NOT NULL, taskId TEXT, date REAL NOT NULL, PRIMARY KEY (id))",
    columns: [
      { name: "id", type: "TEXT", notNull: true, defaultValue: null, primary: true },
      { name: "createdAt", type: "REAL", notNull: true, defaultValue: "strftime('%s','now')", primary: false },
      { name: "name", type: "TEXT", notNull: true, defaultValue: null, primary: false },
      { name: "taskId", type: "TEXT", notNull: false, defaultValue: null, primary: false },
      { name: "date", type: "REAL", notNull: true, defaultValue: null, primary: false },
    ],
  },
  {
    name: "Users",
    sql: "CREATE TABLE Users (username TEXT PRIMARY KEY, name TEXT NOT NULL)",
    columns: [
      { name: "username", type: "TEXT", notNull: false, defaultValue: null, primary: true },
      { name: "name", type: "TEXT", notNull: true, defaultValue: null, primary: false },
    ],
  },
  {
    name: "Tasks",
    sql: "CREATE TABLE Tasks (id TEXT NOT NULL, name TEXT NOT NULL, frequencyType TEXT NOT NULL, frequency INTEGER NOT NULL, PRIMARY KEY (id))",
    columns: [
      { name: "id", type: "TEXT", notNull: true, defaultValue: null, primary: true },
      { name: "name", type: "TEXT", notNull: true, defaultValue: null, primary: false },
      { name: "frequencyType", type: "TEXT", notNull: true, defaultValue: null, primary: false },
      { name: "frequency", type: "INTEGER", notNull: true, defaultValue: null, primary: false },
    ],
  },
  {
    name: "EventsDoneBy",
    sql: "CREATE TABLE EventsDoneBy (doneAt REAL NOT NULL DEFAULT (strftime('%s','now')), userUsername TEXT NOT NULL, eventId TEXT NOT NULL, PRIMARY KEY (userUsername, eventId))",
    columns: [
      { name: "doneAt", type: "REAL", notNull: true, defaultValue: "strftime('%s','now')", primary: false },
      { name: "userUsername", type: "TEXT", notNull: true, defaultValue: null, primary: true },
      { name: "eventId", type: "TEXT", notNull: true, defaultValue: null, primary: true },
    ],
  },
];

export const createSchema = createSqlMutation((account) => ({
  query: (db) => {
    return db.transaction(() => {
      const events = createTable(db, {
        tableName: "Events",
        primaryKeys: ["id"],
        columns: [
          { name: "id", type: "TEXT" },
          { name: "createdAt", type: "REAL", defaultValue: `(strftime('%s','now'))` },
          { name: "name", type: "TEXT" },
          { name: "taskId", type: "TEXT", nullable: true },
          { name: "date", type: "REAL" },
        ],
      }).run();
      const users = createTable(db, {
        tableName: "Users",
        columns: [
          { name: "username", type: "TEXT", primary: true },
          { name: "name", type: "TEXT" },
        ],
      }).run();
      const tasks = createTable(db, {
        tableName: "Tasks",
        primaryKeys: ["id"],
        columns: [
          { name: "id", type: "TEXT" },
          { name: "name", type: "TEXT" },
          { name: "frequencyType", type: "TEXT" },
          { name: "frequency", type: "INTEGER" },
        ],
      }).run();
      const eventsDoneBy = createTable(db, {
        tableName: "EventsDoneBy",
        primaryKeys: ["userUsername", "eventId"],
        columns: [
          { name: "doneAt", type: "REAL", defaultValue: `(strftime('%s','now'))` },
          { name: "userUsername", type: "TEXT" },
          { name: "eventId", type: "TEXT" },
        ],
      }).run();
      return {
        events,
        users,
        tasks,
        eventsDoneBy,
      };
    })();
  },
  onSuccess: () => {
    queryClient.invalidateQueries(createJarvisQuery(account, "schema", null).queryKey);
  },
}));

export const selectUserByUsername = createSqlQuery({
  query: (db, username: string) =>
    select(db, {
      table: "Users",
      columns: { username: z.string(), name: z.string() },
      where: expr.equal("username", expr.stringParam("username")),
    }).get({ username }),
  key: (username) => ["user", username],
});

export const insertUser = createSqlMutation((account) => ({
  query: (db, data: { username: string; name: string }) =>
    insertInto(db, {
      table: "Users",
      columns: {
        username: expr.stringParam("username"),
        name: expr.stringParam("name"),
      },
    }).run(data),
  onSuccess: () => {
    queryClient.invalidateQueries(selectUsers(account).queryKey);
  },
}));

export const selectUsers = createSqlQuery({
  query: (db) =>
    select(db, {
      table: "Users",
      columns: {
        username: z.string(),
        name: z.string(),
      },
    }).all({}),
  key: () => ["users"],
});

export const addUser = createSqlMutation((account) => ({
  query: (db, variables: { name: string; id: string }) =>
    insertInto(db, {
      table: "Users",
      columns: {
        id: expr.stringParam("id"),
        name: expr.stringParam("name"),
      },
    }).run(variables),
  onSuccess: () => {
    queryClient.invalidateQueries(selectUsers(account).queryKey);
  },
}));

export const selectTasks = createSqlQuery({
  query: (db, variables: { page: number }) =>
    select(db, {
      table: "Tasks",
      columns: {
        id: z.string(),
        name: z.string(),
      },
      orderBy: "name",
      limit: "20",
      offset: expr.param("page").type<number>(),
    }).all({ page: variables.page * 30 }),
  key: ({ page }) => ["tasks", page],
});

export const FrequencyTypeSchema = z.enum(["DAY", "WEEK", "MONTH", "YEAR"]);
export type FrequencyType = z.infer<typeof FrequencyTypeSchema>;

export const addTask = createSqlMutation((account) => ({
  query: (db, variables: { name: string; id: string; frequencyType: FrequencyType; frequency: number }) => {
    insertInto(db, {
      table: "Tasks",
      columns: {
        id: expr.stringParam("id"),
        name: expr.stringParam("id"),
        frequencyType: expr.param("frequencyType").type<FrequencyType>(),
        frequency: expr.param("frequency").type<number>(),
      },
    }).run(variables);
  },
  onSuccess: () => {
    queryClient.invalidateQueries(selectTasks.key(account, { page: 0 }).slice(0, -1));
  },
}));

type AddEventVariables = { id: string; name: string; date: Date; taskId: string | null };

export const addEvent = createSqlMutation((account) => ({
  query: (db, { date, id, name, taskId }: AddEventVariables) => {
    insertInto(db, {
      table: "Events",
      columns: {
        id: expr.stringParam("id"),
        name: expr.stringParam("name"),
        date: expr.param("date").type<number>(),
        taskId: expr.param("taskId").type<string | null>(),
      },
    }).run({ id, name, taskId, date: dateToUtcUnixepoch(date) });
  },
  onSuccess: () => {
    console.log(selectTodayEvents(account).queryKey);
    queryClient.invalidateQueries(selectTodayEvents(account).queryKey);
  },
}));

export const selectTodayEvents = createSqlQuery({
  query: (db) => {
    return select(db, {
      table: table.leftJoin("Events", "id", "EventsDoneBy", "eventId"),
      columns: {
        name: z.string(),
        formattedDate: {
          schema: z.string(),
          value: expr.date("Events.date", "unixepoch"),
        },
      },
      // TODO: exclude done events !
      where: expr.and(
        expr.lte(expr.date("Events.date", "unixepoch"), expr.date(`'now'`)),
        expr.isNull("EventsDoneBy.eventId")
      ),
    }).all({});
  },
  key: () => ["today"],
});
