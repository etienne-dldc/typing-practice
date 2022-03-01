import { Migrations, sql, Expr } from "zendb";
import { schema as v001, User } from "./migrations/001";
import { customAlphabet } from "nanoid";
import { ServerEnvs } from "src/server/ServerEnvs";
import path from "path";
import { addMinutes, isBefore } from "date-fns";

export * from "./migrations/001";

const ALPHANUM_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const OTP_ALPHABET = "123456789ABCDEFGHJKLMNPRSTUVWXYZ";

const createPracticeId = customAlphabet(ALPHANUM_ALPHABET, 12);
const createUserId = customAlphabet(ALPHANUM_ALPHABET, 12);
const createStatId = customAlphabet(ALPHANUM_ALPHABET, 16);
const createUserToken = customAlphabet(ALPHANUM_ALPHABET, 32);
const createOtpId = customAlphabet(ALPHANUM_ALPHABET, 12);
const createOtp = customAlphabet(OTP_ALPHABET, 6);

const migrations = Migrations.create({
  id: "init",
  description: "Initialize the database",
  schema: v001,
  migrate: (_prev, db) => {
    db.tables.users.insert({
      id: createUserId(),
      name: "Etienne",
      email: "e.deladonchamps@gmail.com",
      token: createUserToken(),
      isAdmin: true,
      practiceIds: [],
    });
  },
});

export type Db = typeof db;

const db = migrations.applySync({
  databasePath: path.resolve(ServerEnvs.DATA_PATH, "database.db"),
  migrationDatabasePath: path.resolve(ServerEnvs.DATA_PATH, "migration-database.db"),
});

export function findUserByToken(token: string): User | null {
  return db.tables.users.findByIndex("token", token).maybeOne().value();
}

export function findUserByEmail(email: string): User | null {
  return db.tables.users.findByIndex("email", email).maybeOne().value();
}

export function findUserById(id: string): User | null {
  return db.tables.users.findByKey(id).value();
}

export function findAllUsers(): Array<User> {
  return db.tables.users.all().valuesArray();
}

export function insertUser(email: string, name: string): User {
  return db.tables.users
    .insert({
      id: createUserId(),
      token: createUserToken(),
      email,
      name,
      isAdmin: false,
      practiceIds: [],
    })
    .value();
}

export function deleteUserById(id: string): User | null {
  return db.tables.users.findByKey(id).delete().value();
}

export function createOtpForEmail(userEmail: string): {
  otp: string;
  id: string;
} {
  const otp = createOtp();
  const id = createOtpId();
  const now = new Date();
  const otpExpiration = addMinutes(now, 15);
  db.tables.emailOtp.insert({
    createdAt: now,
    email: userEmail,
    id,
    otp,
    otpExpiration,
  });
  return { otp, id };
}

type OtpStatus = { status: "INVALID" } | { status: "VALID" } | { status: "EXPIRED" };

const findOtpByEmailAndIdQuery = db.tables.emailOtp
  .prepare({ email: sql.Value.text(), id: sql.Value.text() })
  .where(({ indexes, params }) =>
    sql.Expr.and(sql.Expr.eq(indexes.email, params.email), sql.Expr.eq(indexes.id, params.id))
  );

export function validateOtp(otpId: string, userEmail: string, otp: string): OtpStatus {
  const res = db.tables.emailOtp.select(findOtpByEmailAndIdQuery, { email: userEmail, id: otpId }).maybeOne().value();
  if (res === null) {
    return { status: "INVALID" };
  }
  const optUp = otp.toUpperCase();
  if (res.otp !== optUp) {
    return { status: "INVALID" };
  }
  const now = new Date();
  if (isBefore(now, res.otpExpiration)) {
    return { status: "VALID" };
  }
  return { status: "EXPIRED" };
}

const findExpiredOtpQuery = db.tables.emailOtp
  .prepare({ now: sql.Value.date() })
  .where(({ indexes, params }) => sql.Expr.lte(indexes.otpExpiration, params.now));

export function deleteExpiredOtp() {
  db.tables.emailOtp.select(findExpiredOtpQuery, { now: new Date() }).delete();
}

export function insertPractice(userId: string, name: string, content: string): string {
  const id = createPracticeId();
  db.tables.practices.insert({ id, name, content });
  db.tables.users.findByKey(userId).update((prev) => ({ ...prev, practiceIds: [...prev.practiceIds, id] }));
  return id;
}

export function updatePracticeName(practiceId: string, name: string): void {
  db.tables.practices.findByKey(practiceId).updateIfExists((prev) => ({ ...prev, name }));
}

export function updatePracticeContent(practiceId: string, content: string): void {
  db.tables.practices.findByKey(practiceId).updateIfExists((prev) => ({ ...prev, content }));
}

export function insertStat(practiceId: string, userId: string, duration: number, accuracy: number, cpm: number) {
  db.tables.stats.insert({
    id: createStatId(),
    date: new Date(),
    practiceId,
    userId,
    duration,
    accuracy,
    cpm,
  });
}

export type GetStatsOptions = {
  practiceId?: string;
  userId?: string;
  period?: [min: Date, max: Date];
};

const { and, or, eq, lte, gte } = sql.Expr;

const NULL = sql.LiteralExpr.null;

function isNull(val: Expr): Expr {
  return sql.BinaryExpr.create(val, "IS", NULL);
}

const findStatsQuery = db.tables.stats
  .prepare({
    userId: sql.Value.text().nullable(),
    practiceId: sql.Value.text().nullable(),
    fromDate: sql.Value.date().nullable(),
    toDate: sql.Value.date().nullable(),
  })
  .where(({ params, indexes }) =>
    and(
      and(
        or(isNull(params.userId), eq(params.userId, indexes.userId)),
        or(isNull(params.practiceId), eq(params.userId, indexes.userId))
      ),
      and(
        or(isNull(params.fromDate), gte(indexes.date, params.fromDate)),
        or(isNull(params.toDate), lte(indexes.date, params.toDate))
      )
    )
  );

export type GetStatResult = {
  accuracy: number;
  duration: number;
  cpm: number;
  count: number;
};

export function getStats(options: GetStatsOptions = {}): GetStatResult {
  const [fromDate, toDate] = options.period || [null, null];
  const stats = db.tables.stats
    .select(findStatsQuery, {
      userId: options.userId ?? null,
      practiceId: options.practiceId ?? null,
      fromDate,
      toDate,
    })
    .values();
  const sums = { accuracy: 0, duration: 0, cpm: 0, count: 0 };
  for (const stat of stats) {
    sums.accuracy += stat.accuracy;
    sums.duration += stat.duration;
    sums.cpm += stat.cpm;
    sums.count += 1;
  }
  return {
    accuracy: sums.accuracy / sums.count,
    duration: sums.duration / sums.count,
    cpm: sums.cpm / sums.count,
    count: sums.count,
  };
}
