import { Param } from "./Param";
import { INTERNAL } from "./utils";
import { ParamsConfig } from "./ParamsProvider";
import { ParsedUrlQueryInput } from "node:querystring";
import jsonUrl from "@jsonurl/jsonurl";

/**
 * Params is immutable
 */
export class Params {
  // Hidden constructor
  public static readonly [INTERNAL] = (
    config: ParamsConfig,
    pathname: string,
    data: Record<string, any>
  ) => {
    return new Params(config, pathname, data);
  };

  public readonly pathname: string;

  private readonly config: ParamsConfig;
  private readonly data: Record<string, any>;

  public readonly [INTERNAL] = (pathname: string): ParsedUrlQueryInput => {
    const result: ParsedUrlQueryInput = {};
    const pathnameChanged = pathname !== this.pathname;
    for (const [key, value] of Object.entries(this.data)) {
      const keep =
        pathnameChanged === false
          ? true
          : this.config[key][INTERNAL].filter(pathname);
      if (keep) {
        result[key] = jsonUrl.stringify(value, { AQF: true });
      }
    }
    return result;
  };

  private constructor(
    config: ParamsConfig,
    pathname: string,
    data: Record<string, any>
  ) {
    this.config = config;
    this.pathname = pathname;
    this.data = data;
  }

  private findParam(param: Param<any>): { param: Param<any>; key: string } {
    for (const [key, p] of Object.entries(this.config)) {
      if (param === p) {
        return { param, key };
      }
    }
    throw new Error(`Param "${param.description}" not found`);
  }

  public get<T>(param: Param<T>): Readonly<T> | null {
    return this.data[this.findParam(param).key] ?? null;
  }

  public set<T>(param: Param<T>, value: T): Params {
    return new Params(this.config, this.pathname, {
      ...this.data,
      [this.findParam(param).key]: value,
    });
  }

  public has(param: Param<any>): boolean {
    const value = this.get(param);
    return value !== null;
  }

  public delete(param: Param<any>): Params {
    if (this.has(param) === false) {
      return this;
    }
    const { key } = this.findParam(param);
    const data = { ...this.data };
    delete data[key];
    return new Params(this.config, this.pathname, data);
  }

  public deleteAll(): Params {
    return new Params(this.config, this.pathname, {});
  }

  public update<T>(
    param: Param<T>,
    updater: (prev: Readonly<T> | null) => T | null
  ): Params {
    const prev = this.get(param);
    const next = updater(prev);
    if (next === null) {
      return this.delete(param);
    }
    return this.set(param, next);
  }
}
