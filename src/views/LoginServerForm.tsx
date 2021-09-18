import React from "react";
import styled from "styled-components";
import { Spacer } from "@src/components/Spacer";
import * as z from "zod";
import { Colors, fontHeightGrid, Fonts, grid } from "@src/logic/Design";
import { ErrorBox } from "@src/components/ErrorBox";
import { FormTextInput } from "@src/components/TextInput";
import { useMutation } from "react-query";
import { jarvisApiHealthcheck } from "@src/logic/JarvisApi";
import { field, useForm } from "react-formi";

type Props = {
  onConnected: (server: string) => void;
};

export function LoginServerForm({ onConnected }: Props): React.ReactElement {
  const [form] = useForm({
    initialFields: field.value(z.string().nonempty(), ""),
    onSubmit: (server) => {
      mutate(server);
    },
  });

  const { isLoading, mutate, error } = useMutation(jarvisApiHealthcheck, {
    onSuccess: (_data, server) => {
      onConnected(server);
    },
  });

  return (
    <Form onSubmit={form.submit}>
      <Title>Login</Title>
      <Spacer vertical={grid(1)} />
      {error && (
        <>
          <ErrorBox error={error} />
          <Spacer vertical={grid(1)} />
        </>
      )}
      <FormTextInput formPath={form.getPath()} placeholder="server" />
      <Spacer vertical={grid(0, 1)} />
      <Button disabled={isLoading} type="submit">
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
