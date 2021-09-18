import { useState, useCallback, useMemo, useLayoutEffect } from "democrat";
import { useSliceQuery } from "./useSliceQuery";
import { useSliceMutation } from "./useSliceMutation";
import { Auth, getAuth, watchAuth, setAuth, MaybeAuth } from "@src/logic/AuthStorage";
import { createJarvisMutation, createJarvisQuery } from "@src/logic/JarvisApi";
import { MeUser } from "@src/logic/JarvisApi.types";

export type AuthUser = Auth &
  MeUser & {
    logout: () => void;
  };

type Result = {
  loading: boolean;
  account: AuthUser | null;
  auth: MaybeAuth;
  loggedIn: (account: Auth) => void;
};

export function useAuth(): Result {
  const [auth, setAuthInternal] = useState(getAuth);

  useLayoutEffect(() => {
    return watchAuth((v) => setAuthInternal(v));
  }, []);

  const meRes = useSliceQuery({
    ...(auth ? createJarvisQuery(auth, "me", null) : {}),
    enabled: auth !== null,
  });

  const logoutMut = useSliceMutation({
    ...(auth ? createJarvisMutation(auth, "logout") : {}),
    onSuccess: () => {
      meRes.remove();
    },
  });

  const logout = useCallback(() => {
    logoutMut.mutate();
  }, [logoutMut]);

  const loggedIn = useCallback(
    (account: Auth) => {
      setAuth(account);
      meRes.remove();
    },
    [meRes]
  );

  const authInfos = useMemo((): AuthUser | null => {
    if (meRes.data && auth) {
      return { ...meRes.data, ...auth, logout };
    }
    return null;
  }, [auth, logout, meRes.data]);

  return {
    loading: meRes.isLoading,
    account: authInfos,
    loggedIn,
    auth,
  };
}
