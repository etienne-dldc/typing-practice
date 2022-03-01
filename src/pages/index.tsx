import { createGssp } from "nextype/server";
import { AuthenticationMiddleware, IsAuthenticatedMiddleware } from "src/server/middlewares/Authentication";

export const getServerSideProps = createGssp(AuthenticationMiddleware(), IsAuthenticatedMiddleware());

export default function IndexPage() {
  return <div>Hello</div>;
}
