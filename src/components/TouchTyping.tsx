import React, { useEffect, useState } from "react";
import { Layout } from "./Layout";
import { KeyEvents, typingState, actions, Dispatch } from "../logic/state";
import { useRenderAt } from "../hooks/useRenderAt";
import confetti from "canvas-confetti";
import { CaretCircleDoubleRight, CheckSquareOffset, HourglassMedium, Pencil, Square, Target } from "phosphor-react";

const STAT_ICON_SIZE = 60;
const CHAR_WIDTH = 16;

type Props = {
  text: string;
  stopOnError: boolean;
  dispatch: Dispatch;
};

export function Playing({ text, stopOnError, dispatch }: Props) {
  const [pressed, setPressed] = useState<KeyEvents>([]);

  const state = typingState(text, pressed, stopOnError);

  const nextRender = state.status !== "playing" ? null : Date.now() + 100;

  useEffect(() => {
    if (state.status === "done") {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 1 },
      });
    }
  }, [state.status]);

  useRenderAt(nextRender);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        // restart
        setPressed([]);
        return;
      }
      if (e.key === "Shift") {
        // Maj key
        return;
      }
      if (state.status === "done") {
        return;
      }
      setPressed((prev) => [...prev, { key: e.key, time: Date.now() }]);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [state.status]);

  return (
    <Layout
      content={
        <div className="Playing">
          <div className="Playing--actions">
            <button
              className="Playing--settings"
              onClick={() => {
                dispatch(actions.edit());
              }}
            >
              <Pencil size={28} />
              <span style={{ width: "0.5rem" }} />
              Edit
            </button>
            <div style={{ width: "2rem" }} />
            <button
              style={{ background: stopOnError ? "#9575CD" : "#D1C4E9" }}
              className="Playing--settings"
              onClick={(e) => {
                dispatch(actions.toggleStopOnError());
                setPressed([]);
                e.currentTarget.blur();
              }}
            >
              {stopOnError ? <CheckSquareOffset size={28} /> : <Square size={28} />}
              <span style={{ width: "0.5rem" }} />
              Stop on Error
            </button>
          </div>
          <div style={{ height: "2rem" }} />
          <div className="Playing--stats">
            <Stat
              icon={<CaretCircleDoubleRight size={STAT_ICON_SIZE} color="#7E57C2" weight="duotone" />}
              name="CPM"
              value={Math.round(state.stats.cpm).toFixed()}
            />
            <div style={{ width: "3rem" }} />
            <Stat
              icon={<HourglassMedium size={STAT_ICON_SIZE} color="#9CCC65" weight="duotone" />}
              name="Time"
              value={<Time time={state.stats.time} />}
            />
            <div style={{ width: "3rem" }} />
            <Stat
              icon={<Target size={STAT_ICON_SIZE} color="#EF5350" weight="duotone" />}
              name="Accuracy"
              value={(state.stats.accuracy * 100).toFixed(0) + "%"}
            />
          </div>
          <div style={{ height: "2rem" }} />
          <div className="Playing--scroll">
            <div className="Playing--cursor" />
            <div
              className="Playing--text"
              style={{
                width: text.length * CHAR_WIDTH + "px",
                transform: `translateX(-${state.offset * CHAR_WIDTH}px)`,
              }}
            >
              {state.chars.map((item, index) => {
                const current = index === state.offset;
                return (
                  <span
                    key={index}
                    className={`Playing--char Playing--char-${item.state} ${current ? "Playing--char-curent" : ""}`}
                  >
                    {item.display ?? item.char}
                  </span>
                );
              })}
            </div>
            <div className="Playing--fade-in" />
            <div className="Playing--fade-out" />
          </div>
        </div>
      }
    />
  );
}

type StatProps = {
  icon: React.ReactNode;
  name: string;
  value: string | React.ReactNode;
};

function Stat({ icon, name, value }: StatProps) {
  return (
    <div className="Playing--stat">
      <div className="Playing--stat-icon">{icon}</div>
      <div style={{ height: "2rem" }} />
      <div className="Playing--stat-value">{value}</div>
      <div style={{ height: "2rem" }} />
      <div className="Playing--stat-name">{name}</div>
    </div>
  );
}

type TimeProps = {
  time: number;
};

function Time({ time }: TimeProps) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  const millisec = (time * 1000) % 100;
  return (
    <span>
      {minutes === 0 ? "" : ("00" + minutes).slice(-2) + ":"}
      {("00" + seconds).slice(-2)}.{("000" + millisec).slice(-3)}
    </span>
  );
}
