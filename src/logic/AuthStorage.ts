import store from "store2";
import * as z from "zod";
import { Subscription, SubscriptionCallback, Unsubscribe } from "suub";

const AUTH_STORAGE_KEY = "TYPING_AUTH_STORAGE_V2";

const subscription = Subscription<MaybeAuth>();
let current: MaybeAuth = null;

export type Auth = NonNullable<MaybeAuth>;

export type MaybeAuth = z.infer<typeof AuthSchema>;
const AuthSchema = z
  .object({
    server: z.string(),
    app: z.string(),
  })
  .nullable();

export function getAuth(): MaybeAuth {
  if (current === null) {
    current = getAuthInternal();
  }
  return current;
}

function getAuthInternal(): MaybeAuth {
  const val = store.get(AUTH_STORAGE_KEY);
  if (!val) {
    return null;
  }
  const parsed = AuthSchema.safeParse(val);
  if (parsed.success) {
    return parsed.data;
  } else {
    console.error(parsed.error);
    return null;
  }
}

export function watchAuth(cb: SubscriptionCallback<MaybeAuth>): Unsubscribe {
  return subscription.subscribe(cb);
}

export function setAuth(val: MaybeAuth | ((prev: MaybeAuth) => MaybeAuth)): void {
  console.log("setAuth", val);
  const next = typeof val === "function" ? val(getAuth()) : val;
  current = next;
  store.set(AUTH_STORAGE_KEY, current);
  subscription.emit(current);
}
