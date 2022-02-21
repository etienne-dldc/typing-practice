import { sql, schema as createSchema, table } from "zendb";
import { sanitize, restore } from "zenjson";

export type User = {
  id: string;
  email: string;
  token: string;
  name: string;
  isAdmin: boolean;
  practiceIds: Array<string>;
};

export type EmailOtp = {
  id: string;
  email: string;
  otp: string;
  createdAt: Date;
  otpExpiration: Date;
};

export type AllowedEmail = {
  email: string;
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
    allowedEmails: table<AllowedEmail>().key(
      sql.Value.text(),
      (email) => email.email
    ),
    emailOtp: table<EmailOtp>()
      .key(sql.Value.text(), (otp) => otp.id)
      .index("email", sql.Value.text(), (otp) => otp.email)
      .index("otp", sql.Value.text(), (otp) => otp.otp)
      .index("id", sql.Value.text(), (otp) => otp.id)
      .index("otpExpiration", sql.Value.date(), (otp) => otp.otpExpiration),
    practices: table<Practice>().key(
      sql.Value.text(),
      (practice) => practice.id
    ),
    stats: table<Stat>()
      .key(sql.Value.text(), (stat) => stat.id)
      .index("userId", sql.Value.text(), (stat) => stat.userId)
      .index("practiceId", sql.Value.text(), (stat) => stat.practiceId)
      .index("date", sql.Value.date(), (stat) => stat.date),
  },
});
