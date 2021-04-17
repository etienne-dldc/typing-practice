import React from "react";
import { Setup } from "./Setup";
import { Playing } from "./Playing";
import { useSlice } from "../logic/state";

export function App() {
  const [state, dispatch] = useSlice();

  if (state.mode === "setup") {
    return <Setup currentText={state.text} dispatch={dispatch} />;
  }
  return (
    <Playing
      dispatch={dispatch}
      text={state.text}
      stopOnError={state.stopOnError}
    />
  );
}
