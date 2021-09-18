import { Factory } from "democrat";
import React, { createContext, Fragment, useContext } from "react";

export function execIfNotFalse<Params, Res>(params: Params | false, exec: (params: Params) => Res): Res | null {
  if (params === false) {
    return null;
  }
  return exec(params);
}

export function execIfTruthy<Params, Res>(
  params: Params | null | false | undefined,
  exec: (params: Params) => Res
): Res | null {
  return params ? exec(params) : null;
}

export function execIfNotTrue<Params, Res>(params: Params | true, exec: (params: Params) => Res): Res | null {
  return params !== true ? exec(params) : null;
}

export function firstNotNullWithDefault<D, T extends Array<D | null>>(...items: [...T, D]): D {
  for (let i = 0; i < items.length; i++) {
    const element = items[i];
    if (element) {
      return element as any;
    }
  }
  return items[items.length - 1] as any;
}

export function execIfTrue<Res>(params: boolean, exec: () => Res): Res | null {
  if (params === true) {
    return exec();
  }
  return null;
}

export function firstTruthy<D>(...items: Array<D | null | undefined | false>): D | null {
  for (let i = 0; i < items.length; i++) {
    const element = items[i];
    if (element) {
      return element;
    }
  }
  return null;
}

export function firstNotNull<D>(...items: Array<D | null>): D | null {
  for (let i = 0; i < items.length; i++) {
    const element = items[i];
    if (element) {
      return element;
    }
  }
  return null;
}

export type FactoryState<F extends Factory<any, any>> = F extends Factory<any, infer R> ? R : never;

export function notNil<T>(val: T | null | undefined): T {
  if (val === null || val === undefined) {
    throw new Error("Unexpected nil value");
  }
  return val;
}

export function renderAround(
  before: React.ReactNode | null,
  elem: React.ReactNode | null | undefined,
  after: React.ReactNode | null = null
): React.ReactNode | undefined | null {
  return (
    elem && (
      <Fragment>
        {before}
        {elem}
        {after}
      </Fragment>
    )
  );
}

export function renderAfter(
  elem: React.ReactNode | null | undefined,
  after: React.ReactNode
): React.ReactNode | undefined | null {
  return (
    elem && (
      <Fragment>
        {elem}
        {after}
      </Fragment>
    )
  );
}

export function addBetween<T>(list: Array<T>, addItem: (sepIndex: number, before: T, after: T) => T): Array<T> {
  return list.reduce<Array<T>>((acc, item, index) => {
    if (index > 0) {
      const before = list[index - 1];
      const sep = addItem(index - 1, before, item);
      acc.push(sep);
    }
    acc.push(item);
    return acc;
  }, []);
}

export function sum(...nums: Array<number>): number {
  let sum = 0;
  for (const num of nums) {
    sum += num;
  }
  return sum;
}

export function arrayShallowEqual<T>(left: Array<T>, right: Array<T>): boolean {
  if (left.length !== right.length) {
    return false;
  }
  return left.every((v, i) => v === right[i]);
}

export type OptionalContextProviderProps<T> = {
  value: T;
  children: React.ReactNode;
};

type OptionalContext<T> = {
  useMaybeValue: () => T | null;
  useValue: () => T;
  Provider: (props: OptionalContextProviderProps<T>) => JSX.Element;
};

export function createOptionalContext<T>(options: { name: string }): OptionalContext<T> {
  const Ctx = createContext<T | null>(null);

  return {
    useValue,
    useMaybeValue,
    Provider,
  };

  function useMaybeValue(): T | null {
    return useContext(Ctx);
  }

  function useValue(): T {
    const val = useContext(Ctx);
    if (val === null) {
      throw new Error(`Missing Context Provider for ${options.name}`);
    }
    return val;
  }

  function Provider({ children, value }: OptionalContextProviderProps<T>): JSX.Element {
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
  }
}

export function dateToUtcUnixepoch(date: Date): number {
  console.log(date.getTime() / 1000);
  const res = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0) / 1000;
  console.log(res);
  return res;
}
