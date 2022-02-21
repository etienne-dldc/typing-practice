import { createSqlMutation, createSqlQuery } from "./JarvisApi";
import * as z from "zod";
import { expr, insertInto, select } from "./TypedSql";
import { Schema } from "./JarvisApi.types";
import { nanoid } from "nanoid";

export const APP_SCHEMA: Schema = [
  {
    name: "Exercices",
    sql: "CREATE TABLE Exercices (id TEXT not null, name TEXT not null, createdAt TEXT not null, content TEXT not null, primary key (id))",
    columns: [
      { name: "id", type: "TEXT", notNull: true, defaultValue: null, primary: true },
      { name: "createdAt", type: "REAL", notNull: true, defaultValue: "strftime('%s','now')", primary: false },
      { name: "name", type: "TEXT", notNull: true, defaultValue: null, primary: false },
      { name: "content", type: "TEXT", notNull: true, defaultValue: null, primary: false },
    ],
  },
  {
    name: "Stats",
    sql: "CREATE TABLE Stats (id TEXT not null, createdAt TEXT not null, time REAL not null, cpm REAL not null, accuracy REAL not null, state TEXT not null, primary key (id))",
    columns: [
      { name: "id", type: "TEXT", notNull: true, defaultValue: null, primary: true },
      { name: "createdAt", type: "REAL", notNull: true, defaultValue: "strftime('%s','now')", primary: false },
      { name: "time", type: "REAL", notNull: true, defaultValue: null, primary: false },
      { name: "cpm", type: "REAL", notNull: true, defaultValue: null, primary: false },
      { name: "accuracy", type: "REAL", notNull: true, defaultValue: null, primary: false },
      { name: "state", type: "TEXT", notNull: true, defaultValue: null, primary: false },
    ],
  },
];

type SelectExercicesOptions = {
  oderBy?: "date" | "name";
  page?: number;
};

const PAGE_SIZE = 20;

export const selectExercices = createSqlQuery({
  query: (db, { page = 0, oderBy = "date" }: SelectExercicesOptions = {}) =>
    select(db, {
      table: "Exercices",
      columns: { id: z.string(), name: z.string() },
      offset: expr.stringParam("offset"),
      limit: PAGE_SIZE.toFixed(),
      orderBy: expr.stringParam("oderBy"),
    }).get({ offset: (page * PAGE_SIZE).toFixed(), oderBy: oderBy === "date" ? "createdAt" : "name" }),
  key: (username) => ["user", username],
});

type CreateExerciceData = {
  name: string;
  content: string;
};

export const createExercice = createSqlMutation((account) => ({
  query: (db, { name, content }: CreateExerciceData) =>
    insertInto(db, {
      table: "Exercices",
      columns: {
        id: expr.stringParam("id"),
        name: expr.stringParam("name"),
        content: expr.stringParam("content"),
      },
    }).run({ id: nanoid(10), name, content }),
  onSuccess: () => {
    // queryClient.invalidateQueries(selectExercices(account).queryKey);
  },
}));
