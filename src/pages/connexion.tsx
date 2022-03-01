import { GetServerSideProps } from "next";
import { createGssp, PropsMiddleware } from "nextype/server";
import { AuthenticationMiddleware, IsAnonymousMiddleware } from "src/server/middlewares/Authentication";
import { ServerEnvs } from "src/server/ServerEnvs";

type Props = {
  connectUrl: string;
};

export const getServerSideProps = createGssp(
  AuthenticationMiddleware(),
  IsAnonymousMiddleware(),
  PropsMiddleware<Props>(async () => {
    return { connectUrl: `${ServerEnvs.UMBRELLA_URL}/connect/${ServerEnvs.UMBRELLA_APP}` };
  })
);

export default function LoginPage({ connectUrl }: Props): JSX.Element {
  return (
    <div>
      <a href={connectUrl}>Se connecter avec Umbrella</a>
    </div>
  );
}
