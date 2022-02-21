import { AuthUser } from "@src/hooks/useAuth";
import { createFactory, useMemo } from "democrat";
import { firstNotNullWithDefault, execIfTruthy } from "@src/logic/Utils";
import React from "react";

type Props = {
  account: AuthUser;
};

export const AppSlice = createFactory(({ account }: Props): JSX.Element => {
  const content = useMemo(() => {
    return firstNotNullWithDefault(
      execIfTruthy(false, () => <div>TODO</div>),
      <div>Not Found</div>
    );
  }, []);

  return content;
});
