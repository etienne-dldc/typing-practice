import produce from "immer";
import React, { useReducer } from "react";

type BaseReducer<State, Payload extends Array<any>> = (
  state: State,
  ...payload: Payload
) => void | State;

export type DispatchType<S extends UseSlice<any, any>> = ReturnType<S>[1];

type BaseReducers<State> = { [key: string]: BaseReducer<State, any> };

type SliceActions<Reducers extends BaseReducers<any>> = {
  [K in keyof Reducers]: SliceReducerToAction<K, Reducers[K]>;
}[keyof Reducers];

type SliceActionsCreator<Reducers extends BaseReducers<any>> = {
  [K in keyof Reducers]: Reducers[K] extends BaseReducer<any, infer Payload>
    ? (...payload: Payload) => SliceReducerToAction<K, Reducers[K]>
    : never;
};

type SliceReducerToAction<
  Key extends string | number | symbol,
  Reducer extends BaseReducer<any, any>
> = Reducer extends BaseReducer<any, infer Payload>
  ? { type: Key; payload: Payload }
  : never;

export type UseSlice<State, Reducers extends BaseReducers<State>> = () => [
  State,
  React.Dispatch<SliceActions<Reducers>>
];

export type Slice<State, Reducers extends BaseReducers<State>> = {
  useSlice: UseSlice<State, Reducers>;
  actions: SliceActionsCreator<Reducers>;
};

export function createSlice<State, Reducers extends BaseReducers<State>>({
  initialState,
  reducers,
}: {
  initialState: State | (() => State);
  reducers: Reducers;
}): Slice<State, Reducers> {
  function reducer(state: State, action: SliceActions<Reducers>): State {
    const type = action.type;
    const localReducer = reducers[type];
    if (!localReducer) {
      throw new Error(`Missing reducer for avction ${type}`);
    }
    return produce(state, (draft) => {
      return localReducer(draft as any, ...action.payload) as any;
    }) as any;
  }

  const actions: SliceActionsCreator<Reducers> = Object.keys(reducers).reduce<
    SliceActionsCreator<Reducers>
  >((acc, key) => {
    (acc as any)[key] = (...payload: Array<any>) => ({ type: key, payload });
    return acc;
  }, {} as any);

  const initState =
    typeof initialState === "function" ? (initialState as any)() : initialState;

  return {
    useSlice: () => useReducer(reducer, initState),
    actions,
  };
}
