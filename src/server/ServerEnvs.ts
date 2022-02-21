import * as z from "zod";

const RawEnvsValidators = z.object({
  NODE_ENV: z.union([z.literal("development"), z.literal("production")]),
  DATABASE_PATH: z.string(),
  MIGRATION_DATABASE_PATH: z.string(),
  SENDGRID_API_KEY: z.string(),
  SENDGRID_SENDER: z.string(),
  SENDGRID_SENDER_NAME: z.string(),
  MAIL_TEST_MODE: z.union([z.literal("true"), z.literal("false")]),
  TOKEN_SECRET: z.string(),
  COOKIE_TOKEN_NAME: z.string(),
});

const parsed = RawEnvsValidators.parse(process.env);

export const ServerEnvs = {
  ...parsed,
  IS_DEV: parsed.NODE_ENV === "development",
  IS_PRODUCTION: parsed.NODE_ENV === "production",
  MAIL_TEST_MODE: parsed.MAIL_TEST_MODE === "true",
};

export type ServerEnvs = typeof ServerEnvs;
