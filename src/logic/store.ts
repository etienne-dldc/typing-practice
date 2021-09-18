import React from "react";
import { createStore, Store } from "democrat";
import { RootSlice } from "@src/slices/RootSlice";

export const store = createStore(RootSlice.createElement(), {
  ReactInstance: React,
});

export type State = typeof store extends Store<infer S> ? S : never;
