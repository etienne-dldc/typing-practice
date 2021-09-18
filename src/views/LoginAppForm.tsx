import React from "react";
import styled from "styled-components";
import { Spacer } from "@src/components/Spacer";
import * as z from "zod";
import { Colors, fontHeightGrid, Fonts, grid } from "@src/logic/Design";
import { ErrorBox } from "@src/components/ErrorBox";
import { FormTextInput, TextInput } from "@src/components/TextInput";
import { useMutation } from "react-query";
import { Auth, MaybeAuth } from "@src/logic/AuthStorage";
import { createJarvisMutation } from "@src/logic/JarvisApi";
import { notNil } from "@src/logic/Utils";
import { field, useForm } from "react-formi";

type FormData = z.infer<typeof FormSchema>;

const FormSchema = z.object({
  app: z.string().nonempty(),
  username: z.string().nonempty(),
  password: z.string().nonempty(),
});

type Props = {
  server: string;
  clerServer: () => void;
  onSuccess: (account: Auth) => void;
  auth: MaybeAuth;
};

export function LoginAppForm({ server, onSuccess, clerServer, auth }: Props): React.ReactElement {
  const [form] = useForm({
    initialFields: field.object({
      app: field.value(z.string().nonempty(), auth?.app ?? ""),
      username: field.value(z.string().nonempty(), ""),
      password: field.value(z.string().nonempty(), ""),
    }),
    onSubmit: (data) => {
      loginMut.mutate(data);
    },
  });

  const loginMut = useMutation({
    mutationFn: ({ app, password, username }: FormData) => {
      const mutationFn = notNil(createJarvisMutation({ app, server }, "login").mutationFn);
      return mutationFn({ password, username });
    },
    onSuccess: (_data, { app }) => {
      onSuccess({ app, server });
    },
  });

  return (
    <Form onSubmit={form.submit}>
      <Button type="button" onClick={clerServer}>
        Back
      </Button>
      <Title>Login</Title>
      <Spacer vertical={grid(1)} />
      {loginMut.error && (
        <>
          <ErrorBox error={loginMut.error} />
          <Spacer vertical={grid(1)} />
        </>
      )}
      <TextInput value={server} disabled name="server" />
      <Spacer vertical={grid(0, 1)} />
      <FormTextInput formPath={form.getPath("app")} placeholder="app" />
      <Spacer vertical={grid(0, 1)} />
      <FormTextInput formPath={form.getPath("username")} placeholder="username" />
      <Spacer vertical={grid(0, 1)} />
      <FormTextInput formPath={form.getPath("password")} placeholder="password" type="password" />
      <Spacer vertical={grid(0, 1)} />
      <Button disabled={loginMut.isLoading} type="submit">
        Login
      </Button>
    </Form>
  );
}

const Form = styled.form({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  justifyContent: "center",
  alignSelf: "center",
  maxWidth: 300,
  width: "100%",
});

const Button = styled.button({
  ...fontHeightGrid(1),
  textTransform: "none",
  textDecoration: "none",
  margin: 0,
  paddingLeft: grid(0, 1),
  paddingRight: grid(0, 1),
  paddingTop: grid(0, 0, 1),
  paddingBottom: grid(0, 0, 1),
  border: "none",
  borderRadius: grid(0, 0, 0, 1),
  color: Colors.white,
  ...Fonts.JetBrainsMono.SemiBold.Normal,
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  borderWidth: 2,
  borderStyle: "solid",
  background: Colors.blue(500),
  borderColor: Colors.blue(500),
  "&:hover": {
    background: Colors.blue(600),
  },
});

const Title = styled.h2({
  ...Fonts.JetBrainsMono.Regular.Normal,
  textAlign: "center",
});
