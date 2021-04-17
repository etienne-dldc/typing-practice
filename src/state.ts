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
