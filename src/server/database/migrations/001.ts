import { sql, schema as createSchema, table } from "zendb";
import { sanitize, restore } from "zenjson";

export type User = {
  id: string;
  email: string;
  token: string;
  name: string;
  practiceIds: Array<string>;
};

export type Practice = {
  id: string;
  name: string;
  content: string;
};

export type Stat = {
  id: string;
  userId: string;
  practiceId: string;
  date: Date;
  duration: number;
  accuracy: number;
  cpm: number;
};

export const schema = createSchema({
  sanitize,
  restore,
  tables: {
    users: table<User>()
      .key(sql.Value.text(), (user) => user.id)
      .index("email", sql.Value.text().unique(), (user) => user.email)
      .index("token", sql.Value.text().unique(), (user) => user.token),
    practices: table<Practice>().key(sql.Value.text(), (practice) => practice.id),
    stats: table<Stat>()
      .key(sql.Value.text(), (stat) => stat.id)
      .index("userId", sql.Value.text(), (stat) => stat.userId)
      .index("practiceId", sql.Value.text(), (stat) => stat.practiceId)
      .index("date", sql.Value.date(), (stat) => stat.date),
  },
});
