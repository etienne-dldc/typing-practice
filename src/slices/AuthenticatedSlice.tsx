import React from "react";
import { createFactory, useChildren, useMemo } from "democrat";
import { useSliceQuery } from "@src/hooks/useSliceQuery";
import { execIfNotTrue, execIfTruthy, FactoryState, firstNotNullWithDefault } from "@src/logic/Utils";
import { AppSlice } from "./AppSlice";
import { IdentitySlice } from "./IdentitySlice";
import { AuthCtx } from "@src/logic/AuthCtx";
import { createJarvisQuery } from "@src/logic/JarvisApi";
import { AuthUser } from "@src/hooks/useAuth";
import { APP_SCHEMA } from "@src/logic/TypingJarvisApi";
import { Schema } from "@src/logic/JarvisApi.types";

type Props = {
  account: AuthUser;
};

export type SchemaValidationResult =
  | { valid: false; schema: Schema | undefined; errors: Array<string> }
  | { valid: true; schema: Schema };

export type AuthenticatedSliceState = FactoryState<typeof AuthenticatedSlice>;

export const AuthenticatedSlice = createFactory(({ account }: Props): JSX.Element => {
  const schemaRes = useSliceQuery(createJarvisQuery(account, "schema", null));

  const schema = schemaRes.data;

  const schemaValid = useMemo((): SchemaValidationResult => {
    if (!schema) {
      return { valid: false, schema, errors: [] };
    }
    const errors: Array<string> = [];
    APP_SCHEMA.forEach((table) => {
      const sTable = schema.find((t) => t.name === table.name);
      if (!sTable) {
        errors.push(`Table "${table.name}" is missing, create it with "${table.sql}"`);
        return;
      }
      if (sTable.sql !== table.sql) {
        errors.push(`Table "${table.name}" has invalid sql, replace it with "${sTable.sql}"`);
      }
      sTable.columns.forEach((sCol) => {
        const col = table.columns.find((c) => c.name === sCol.name);
        if (!col) {
          errors.push(`On table "${table.name}", the column "${sCol.name}" is missing !`);
          return;
        }
      });
      table.columns.forEach((col) => {
        const sCol = sTable.columns.find((c) => c.name === col.name);
        if (!sCol) {
          errors.push(`On table "${table.name}", the column "${col.name}" is missing !`);
          return;
        }
        if (col.type !== sCol.type) {
          errors.push(`"${table.name}"."${col.name}" has an invalid type value`);
        }
        if (col.defaultValue !== sCol.defaultValue) {
          errors.push(`"${table.name}"."${col.name}" has an invalid defaultValue`);
        }
        if (col.notNull !== sCol.notNull) {
          errors.push(`"${table.name}"."${col.name}" has an invalid notNull value`);
        }
        if (col.primary !== sCol.primary) {
          errors.push(`"${table.name}"."${col.name}" has an invalid primary value`);
        }
      });
    });
    if (errors.length === 0) {
      return { valid: true, schema };
    }
    return { valid: false, schema, errors };
  }, [schema]);

  const emptyProject = useMemo(() => schema && schema.length === 0, [schema]);

  const current = useMemo(() => {
    return firstNotNullWithDefault(
      execIfTruthy(emptyProject, () => IdentitySlice.createElement({ children: <div>Empty Database</div> })),
      execIfNotTrue(schemaValid.valid, () =>
        IdentitySlice.createElement({
          children: (
            <div>
              Invalid Scheme
              <pre>{schemaValid.valid === false && JSON.stringify(schemaValid.errors, null, 2)}</pre>
            </div>
          ),
        })
      ),
      AppSlice.createElement({ account })
    );
  }, [account, emptyProject, schemaValid]);

  const content = useChildren(current);

  const wrappedContent = useMemo(() => {
    return <AuthCtx.Provider value={account}>{content}</AuthCtx.Provider>;
  }, [account, content]);

  return wrappedContent;
});
