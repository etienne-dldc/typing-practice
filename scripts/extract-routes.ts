import * as glob from "glob";
import * as path from "path";
import * as fse from "fs-extra";
import * as prettier from "prettier";

const PARAM_REG = /^\[(.+)\]$/;
const PARAMS_REG = /^\[\.\.\.(.+)\]$/;
const EXTENSION_REG = /\.tsx?$/;

type PathItem = { type: "static" | "param" | "params"; name: string };
type Route = {
  file: string;
  path: Array<PathItem>;
  pathname: string;
  fn: string;
};
type Routes = Array<Route>;

main().catch((err) => {
  console.error(err);
});

async function main() {
  const base = process.cwd();
  const pagesDir = path.resolve(base, "src/pages");
  const generatedDir = path.resolve(base, "src/generated");
  const routesFile = path.resolve(generatedDir, "routes.ts");

  const files = glob
    .sync("**/*", {
      cwd: pagesDir,
      nodir: true,
    })
    .filter((file) => {
      if (file === "_app.tsx" || file === "_document.tsx") {
        return false;
      }
      if (!EXTENSION_REG.test(file)) {
        return false;
      }
      return true;
    })
    .map((page) => page.replace(EXTENSION_REG, ""));

  const routes: Routes = files.map((file): Route => {
    const parts = file.split("/");
    const path: Array<PathItem> = parts
      .map((part, index): PathItem | false => {
        const isParam = part.match(PARAM_REG);
        const isParams = part.match(PARAMS_REG);
        const isIndex = index === parts.length - 1 && part === "index";
        if (isIndex) {
          return false;
        }
        if (isParams) {
          return { type: "params", name: isParams[1] };
        }
        if (isParam) {
          return { type: "param", name: isParam[1] };
        }
        return { type: "static", name: part };
      })
      .filter((item): item is PathItem => item !== false);
    const pathname =
      "/" +
      path
        .map((item) => {
          if (item.type === "param") {
            return `[${item.name}]`;
          }
          if (item.type === "params") {
            return `[...${item.name}]`;
          }
          return item.name;
        })
        .join("/");
    const paramsItems = path
      .map((item): string | null => {
        if (item.type === "static") {
          return null;
        }
        if (item.type === "param") {
          return `"${snakeToCamel(item.name)}": string`;
        }
        if (item.type === "params") {
          return `"${snakeToCamel(item.name)}": string[]`;
        }
        throw new Error("Unknown path item type");
      })
      .filter((v): v is string => v !== null);
    const params =
      paramsItems.length === 0 ? null : `{ ${paramsItems.join("; ")} }`;
    const pathCompute =
      "/" +
      path
        .map((item) => {
          if (item.type === "static") {
            return item.name;
          }
          if (item.type === "param") {
            return "${" + `params.${snakeToCamel(item.name)}` + "}";
          }
          if (item.type === "params") {
            return "${" + `params.${snakeToCamel(item.name)}.join('/')` + "}";
          }
          throw new Error("Unknown path item type");
        })
        .join("/");
    const fn = `(${
      params === null ? "" : `params: ${params}`
    }) => \`${pathCompute}\``;
    return { file, path, pathname, fn };
  });

  const content = [
    `export const routes = {`,
    ...routes.map((route) => {
      return `  "${route.pathname}": ${route.fn},`;
    }),
    `} as const`,
    ``,
    `export type Routes = typeof routes;`,
    `export type RoutePathname = keyof Routes;`,
    `export type RouteParams = {[K in keyof Routes]: Parameters<Routes[K]>[0] };`,
    `export type Route = { pathname: RoutePathname; href: string };`,
    ``,
    `export function route<K extends RoutePathname>(pathname: K, ...args: RouteParams[K] extends undefined ? [] : [params: RouteParams[K]]): Route {`,
    `  return { pathname, href: routes[pathname]((args[0] || {}) as any) };`,
    `}`,
  ].join("\n");
  const contentFormatted = prettier.format(content, { filepath: routesFile });

  await fse.ensureDir(generatedDir);
  await fse.writeFile(routesFile, contentFormatted, { encoding: "utf-8" });
}

function snakeToCamel(str: string): string {
  return str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace("-", "").replace("_", "")
  );
}
