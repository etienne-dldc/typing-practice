import Sendgrid from "@sendgrid/mail";
import { loginOtpEmail } from "./MailTemplate";
import { ServerEnvs } from "./ServerEnvs";

Sendgrid.setApiKey(ServerEnvs.SENDGRID_API_KEY);

export const Mailer = {
  sendLoginOtp,
};

function sendLoginOtp(name: string, email: string, otp: string): Promise<void> {
  return sendMail(email, {
    subject: `[typing.etienne.tech] code de connexion`,
    text: `Ton code de connexion à typing.etienne.tech est ${otp}`,
    html: loginOtpEmail(name, otp),
  });
}

export type EmailObject = {
  subject: string;
  text: string;
  html: string;
};

async function sendMail(to: string, email: EmailObject) {
  const msg: Sendgrid.MailDataRequired = {
    to,
    from: {
      email: ServerEnvs.SENDGRID_SENDER,
      name: ServerEnvs.SENDGRID_SENDER_NAME,
    },
    subject: email.subject,
    text: email.text,
    html: email.html,
  };

  if (ServerEnvs.MAIL_TEST_MODE) {
    console.info(`Mail Test Mode is ON`);
    console.info(`======`);
    console.info(`= Mail to: ${msg.to}`);
    console.info(`======`);
    console.info(msg.html);
    console.info(`======`);
    console.info(msg.text);
    console.info(`<======>`);
    return;
  }

  await Sendgrid.send(msg);
}
