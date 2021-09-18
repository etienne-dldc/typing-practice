import React, { useState } from "react";
import { LoginServerForm } from "./LoginServerForm";
import { LoginAppForm } from "./LoginAppForm";
import { Auth, MaybeAuth } from "@src/logic/AuthStorage";

type Props = {
  onSuccess: (auth: Auth) => void;
  auth: MaybeAuth;
};

export function LoginForm({ onSuccess, auth }: Props): React.ReactElement {
  const [server, setServer] = useState<string | null>(auth?.server ?? null);

  if (server === null) {
    return <LoginServerForm onConnected={(server) => setServer(server)} />;
  }
  return <LoginAppForm server={server} clerServer={() => setServer(null)} onSuccess={onSuccess} auth={auth} />;
}
