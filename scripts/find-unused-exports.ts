import analyzeTsConfig from "ts-unused-exports";
import path from "path";
import chalk from "chalk";

const result = analyzeTsConfig(path.resolve(process.cwd(), "tsconfig.json"));

const pagesFolder = path.resolve(process.cwd(), "src/pages");
const pagesApiFolder = path.resolve(process.cwd(), "src/pages/api");
const generatedFolder = path.resolve(process.cwd(), "src/generated");
const databaseFolder = path.resolve(process.cwd(), "src/server/database");

const filtered: typeof result = Object.fromEntries(
  Object.entries(result)
    .map(([file, exportList]) => {
      if (file.startsWith(pagesApiFolder)) {
        return [
          file,
          exportList.filter((exportItem) => {
            return (
              ["default", "config"].includes(exportItem.exportName) === false
            );
          }),
        ];
      }
      if (file.startsWith(pagesFolder)) {
        return [
          file,
          exportList.filter((exportItem) => {
            return (
              ["default", "getServerSideProps"].includes(
                exportItem.exportName
              ) === false
            );
          }),
        ];
      }
      if (file.startsWith(databaseFolder)) {
        if (file.endsWith(".types.ts")) {
          return [file, []];
        }
      }
      if (file.startsWith(generatedFolder)) {
        return [file, []];
      }
      return [file, exportList];
    })
    .filter(([, exportList]) => {
      return exportList.length > 0;
    })
);

Object.entries(filtered).forEach(([file, exportList]) => {
  console.info(chalk.blue(file));
  exportList.forEach((exportItem) => {
    console.info(chalk.gray(`  ${exportItem.exportName}`));
  });
});
