import { createSlice, DispatchType } from "./createSlice";

export type Mode = "setup" | "playing";

export type State = {
  mode: Mode;
  text: string;
  presets: Array<string>;
  stopOnError: boolean;
};

// const initialState: State = {
//   mode: "playing",
//   text: "this is a test",
//   stopOnError: true,
// };

export const { useSlice, actions } = createSlice({
  initialState: (): State => {
    return {
      mode: "playing",
      text: "this is a test",
      presets: [],
      stopOnError: true,
    };
  },
  reducers: {
    setText: (state, text: string) => {
      state.text = text;
      state.mode = "playing";
    },
    toggleStopOnError: (state) => {
      state.stopOnError = !state.stopOnError;
    },
    edit: (state) => {
      state.mode = "setup";
    },
  },
});

export type Dispatch = DispatchType<typeof useSlice>;

export type KeyEvent = { key: string; time: number };

export type KeyEvents = Array<KeyEvent>;

type Char = {
  char: string;
  display?: string;
  state: "valid" | "next" | "error";
};

export type TypingState = {
  status: "void" | "playing" | "done";
  chars: Array<Char>;
  offset: number;
  stats: {
    cpm: number;
    time: number;
    accuracy: number;
  };
};

export function typingState(
  text: string,
  events: KeyEvents,
  stopOnError: boolean
): TypingState {
  const notStarted = events.length === 0;
  const chars = text
    .split("")
    .map((char, index): Char => ({ char, state: "next" }));
  if (notStarted) {
    return {
      status: "void",
      offset: 0,
      stats: { time: 0, cpm: 0, accuracy: 1 },
      chars,
    };
  }
  const startTime = events[0].time;
  const now = Date.now();
  let offset = 0;
  let count = 0;
  let valids = 0;
  let done = false;
  let lastTime = startTime;
  events.forEach((event) => {
    if (done) {
      return;
    }
    lastTime = event.time;
    count++;
    const current = chars[offset];
    const isValid = current.char === event.key;
    if (isValid === false && stopOnError) {
      setError(current);
      return;
    }
    offset += 1;
    if (current.state === "next") {
      if (isValid) {
        current.state = "valid";
      } else {
        setError(current);
      }
    }
    if (isValid) {
      valids++;
    }
    if (offset >= chars.length) {
      done = true;
    }
  });
  const time = (done ? lastTime - startTime : now - startTime) / 1000;
  const accuracy = valids === 0 ? 0 : valids / count;
  const cpm = valids < 5 ? 0 : valids / (time / 60);

  return {
    status: done ? "done" : "playing",
    chars,
    offset,
    stats: { cpm, time, accuracy },
  };
}

function setError(char: Char) {
  char.state = "error";
  if (char.char === " ") {
    char.display = "_";
  }
}
