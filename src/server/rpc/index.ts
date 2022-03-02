import { Route } from "nextype/server";
import {
  AuthenticatedKey,
  AuthenticationKey,
  AuthenticationMiddleware,
  IsAuthenticatedMiddleware,
} from "../middlewares/Authentication";
import { z } from "zod";
import { Practice, findUserById, findPracticeById } from "../database";
import { MeUser } from "../Authentication";

const me = Route.query()
  .middlewares(AuthenticationMiddleware())
  .resolve<MeUser | false>(async (ctx) => {
    const me = ctx.getOrFail(AuthenticationKey.Consumer);
    return me.meUser;
  });

const practices = Route.query()
  .middlewares(AuthenticationMiddleware(), IsAuthenticatedMiddleware())
  .resolve<Array<Practice>>(async (ctx) => {
    const me = ctx.getOrFail(AuthenticatedKey.Consumer);

    const user = findUserById(me.id);
    if (!user) {
      throw new Error("User not found");
    }
    const practices = user.practiceIds
      .map((id) => {
        return findPracticeById(id);
      })
      .filter((v): v is NonNullable<typeof v> => v !== null);
    return practices;
  });

export const routes = {
  me,
  practices,
};

export type Routes = typeof routes;
