import { findUserByToken } from "./database";

export type MeUser = {
  id: string;
  email: string;
  name: string;
  admin: boolean;
};

export async function getMeUser(token: string | null): Promise<MeUser | false> {
  if (!token) {
    return false;
  }
  const user = findUserByToken(token);
  if (!user) {
    return false;
  }
  return { id: user.id, name: user.name, admin: user.isAdmin, email: user.email };
}
