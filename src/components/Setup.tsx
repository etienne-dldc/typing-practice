import React, { useState } from "react";
import { Layout } from "./Layout";
import { actions, Dispatch } from "../logic/state";
import { RocketLaunch } from "phosphor-react";

type Props = {
  dispatch: Dispatch;
  currentText: string;
};

export function Setup({ dispatch, currentText }: Props) {
  const [text, setText] = useState(currentText);

  return (
    <Layout
      content={
        <div className="Setup">
          <div className="Setup--text">
            <input
              className="Setup--input"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div style={{ width: "1rem" }} />
            <button
              className="Setup--go"
              onClick={() => dispatch(actions.setText(text))}
            >
              <RocketLaunch size={28} />
              <span style={{ width: "1rem" }} />
              Go !
            </button>
          </div>
          <div style={{ height: "2rem" }} />
          <div className="Setup--presets">TODO: Presets</div>
        </div>
      }
    />
  );
}
