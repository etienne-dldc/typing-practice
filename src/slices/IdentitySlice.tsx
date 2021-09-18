import { createFactory } from "democrat";

export const IdentitySlice = createFactory(({ children }: { children: JSX.Element }): JSX.Element => {
  return children;
});
