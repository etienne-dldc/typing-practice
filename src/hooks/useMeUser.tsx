import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useMemo } from "react";
import { createAppError } from "src/logic/AppError";
import { useRpcQuery } from "src/logic/RpcClient";
import { MeUser } from "src/server/Authentication";

// false is not connected - null is unknow
const UserContext = createContext<MeUser | null | false>(null);

type Props = {
  meUser: MeUser | false | null;
  children: React.ReactNode;
};

export function UserContextProvider({ children, meUser }: Props): JSX.Element {
  const { status, data } = useRpcQuery(["me"]);
  const router = useRouter();

  // me come from server, once me user is fetched we use it instead
  // this allow user to be logged in on every pages (even without gssp) like 404
  const meResolved = useMemo((): MeUser | false | null => {
    if (status === "success" && data !== undefined) {
      return data;
    }
    return meUser;
  }, [data, meUser, status]);

  useEffect(() => {
    if (meResolved === null || meResolved === false) {
      // not loaded or not connected
      return;
    }
    if (router.pathname !== "/") {
      // not home
      return;
    }
  }, [meResolved, router]);

  return <UserContext.Provider value={meResolved}>{children}</UserContext.Provider>;
}

export function useMeUser(): MeUser | false | null {
  const value = useContext(UserContext);
  return value;
}

export function useMeUserOrThrow(): MeUser {
  const user = useMeUser();
  if (user === null || user === false) {
    throw createAppError({ type: "MissingProvider", provider: "User" });
  }
  return user;
}
