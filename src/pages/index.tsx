import { createGssp, PropsMiddleware, TransformMiddleware } from "nextype/server";
import { AuthenticationMiddleware, IsAuthenticatedMiddleware } from "src/server/middlewares/Authentication";

type Props = {};

export const getServerSideProps = createGssp(
  TransformMiddleware(),
  AuthenticationMiddleware(),
  IsAuthenticatedMiddleware(),
  PropsMiddleware<Props>(async () => {
    return {};
  })
);

export default function IndexPage({}: Props): JSX.Element {
  return <div>Hello</div>;
}
