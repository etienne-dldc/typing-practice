import Ky from "ky";
import type { Query } from "local-sql";
import * as z from "zod";

export async function isOnline(url: string): Promise<boolean> {
  return Ky.get(url).then((res) => res.ok);
}

const INTERNAL = Symbol("INTERNAL");

type InternalQuery<Data> = {
  [INTERNAL]: true;
  query: Query;
  schema: z.Schema<Data>;
};

export function createQuery<Data>(
  query: Query,
  schema: z.Schema<Data>
): InternalQuery<Data> {
  return {
    [INTERNAL]: true,
    query,
    schema,
  };
}

// export type ToResult =
