import { AuthUser } from "@src/hooks/useAuth";
import { createFactory, useMemo, useEffect } from "democrat";
import { firstNotNullWithDefault, execIfTruthy } from "@src/logic/Utils";
import { useSliceQuery } from "@src/hooks/useSliceQuery";
import { insertUser, selectUserByUsername } from "@src/logic/TypingJarvisApi";
import { useSliceMutation } from "@src/hooks/useSliceMutation";
import React from "react";

type Props = {
  account: AuthUser;
};

export const AppSlice = createFactory(({ account }: Props): JSX.Element => {
  const meRes = useSliceQuery(selectUserByUsername(account, account.username));
  const addUserMut = useSliceMutation(insertUser(account));

  useEffect(() => {
    const noUser = meRes.status === "success" && !meRes.data;
    const notInserting = addUserMut.status === "idle";
    if (noUser && notInserting) {
      addUserMut.mutate({ name: account.name, username: account.username });
    }
  }, [account.name, account.username, addUserMut, meRes.data, meRes.status]);

  const content = useMemo(() => {
    return firstNotNullWithDefault(
      execIfTruthy(false, () => <div>TODO</div>),
      <div>Not Found</div>
    );
  }, []);

  return content;
});
