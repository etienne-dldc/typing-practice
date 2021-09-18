import { AuthUser } from "@src/hooks/useAuth";
import { createOptionalContext } from "./Utils";

export const AuthCtx = createOptionalContext<AuthUser>({ name: "Auth" });
