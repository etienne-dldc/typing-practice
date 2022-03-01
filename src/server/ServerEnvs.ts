import * as z from "zod";

const RawEnvsValidators = z.object({
  NODE_ENV: z.union([z.literal("development"), z.literal("production")]),
  DATA_PATH: z.string(),
  COOKIE_SECRET: z.string(),
  COOKIE_TOKEN_NAME: z.string(),
  UMBRELLA_URL: z.string(),
  UMBRELLA_SECRET: z.string(),
  UMBRELLA_APP: z.string(),
});

const parsed = RawEnvsValidators.parse(process.env);

export const ServerEnvs = {
  ...parsed,
  IS_DEV: parsed.NODE_ENV === "development",
  IS_PRODUCTION: parsed.NODE_ENV === "production",
};

export type ServerEnvs = typeof ServerEnvs;
