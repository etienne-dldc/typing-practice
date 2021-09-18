import React from "react";
import { Auth, MaybeAuth } from "@src/logic/AuthStorage";
import { createFactory } from "democrat";
import { FactoryState } from "@src/logic/Utils";
import { LoginForm } from "@src/views/LoginForm";

type Props = {
  loggedIn: (account: Auth) => void;
  auth: MaybeAuth;
};

export type AnonymousSliceState = FactoryState<typeof AnonymousSlice>;

export const AnonymousSlice = createFactory(({ loggedIn, auth }: Props): JSX.Element => {
  // const current = useMemo(() => {
  //   return firstNotNullWithDefault(
  //     execIfNotFalse(routes.login, () => LoginRouteSlice.createElement({ onSuccess: loggedIn, auth })),
  //     LoadingSlice.createElement()
  //   );
  // }, [auth, loggedIn, routes.login]);

  return <LoginForm onSuccess={loggedIn} auth={auth} />;
});
