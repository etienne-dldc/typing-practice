import { firstNotNullWithDefault, execIfTruthy, execIfTrue } from "@src/logic/Utils";
import { createFactory, useChildren } from "democrat";
import { useAuth } from "@src/hooks/useAuth";
import { AnonymousSlice } from "./AnonymousSlice";
import { AuthenticatedSlice } from "./AuthenticatedSlice";
import { LoadingSlice } from "./LoadingSlice";

export const RootSlice = createFactory(() => {
  const { loading, account, loggedIn, auth } = useAuth();

  const children = useChildren(
    firstNotNullWithDefault(
      execIfTrue(loading, () => LoadingSlice.createElement()),
      execIfTruthy(account, (account) => AuthenticatedSlice.createElement({ account })),
      AnonymousSlice.createElement({ loggedIn, auth })
    )
  );

  return children;
});
