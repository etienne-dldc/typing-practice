import { Schema } from "zod";
import { INTERNAL } from "./utils";

export type Param<T> = {
  [INTERNAL]: {
    schema: Schema<T>;
    filter: ParamFilter;
  };
  readonly description: string;
};

// Filter is only called when pathname changes
export type ParamFilter = (pathname: string) => boolean;

// By default params are removed when pathname changes
const DEFAULT_FILTER: ParamFilter = () => false;

export function createParam<T>(
  description: string,
  schema: Schema<T>,
  filter: ParamFilter = DEFAULT_FILTER
): Param<T> {
  return {
    [INTERNAL]: { schema, filter },
    description,
  };
}
