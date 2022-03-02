import { createGssp, PropsMiddleware, TransformMiddleware } from "nextype/server";
import { useMeUserOrThrow } from "src/hooks/useMeUser";
import { useRpcQuery } from "src/logic/RpcClient";
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
  const practicesRes = useRpcQuery(["practices"]);
  const me = useMeUserOrThrow();

  console.log({
    me,
    practices: practicesRes.data,
  });

  return <div>Hello</div>;
}
