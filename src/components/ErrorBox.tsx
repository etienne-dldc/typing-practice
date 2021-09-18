import React from "react";
import { memo } from "react";
import { HTTPError } from "ky";
import styled from "styled-components";
import { Colors, fontHeightGrid, grid } from "@src/logic/Design";

type Props = {
  error: unknown;
};

export const ErrorBox = memo<Props>(({ error }) => {
  if (error === null || error === undefined) {
    return <ErrorWrapper>Error</ErrorWrapper>;
  }
  if (typeof error === "string") {
    if (error.length > 40) {
      return (
        <ErrorWrapper>
          <ErrorTitle>Error</ErrorTitle>
          <ErrorDetails>{error}</ErrorDetails>
        </ErrorWrapper>
      );
    }
    return (
      <ErrorWrapper>
        <ErrorTitle>{error}</ErrorTitle>
      </ErrorWrapper>
    );
  }
  if (error instanceof HTTPError) {
    console.error(error.response);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsed = (error.response as any).parsed;
    const message = parsed && parsed.message;
    return (
      <ErrorWrapper>
        <ErrorTitle>{error.message}</ErrorTitle>
        {message && <ErrorDetails>{message}</ErrorDetails>}
      </ErrorWrapper>
    );
  }
  if (error instanceof Error) {
    return (
      <ErrorWrapper>
        <ErrorTitle>{error.message}</ErrorTitle>
      </ErrorWrapper>
    );
  }
  return (
    <ErrorWrapper>
      <ErrorTitle>error</ErrorTitle>
    </ErrorWrapper>
  );
});

const ErrorWrapper = styled.div({
  color: Colors.white,
  backgroundColor: Colors.red(500),
  ...fontHeightGrid(0, 1, 1),
  paddingLeft: grid(0, 1),
  paddingRight: grid(0, 1),
  paddingTop: grid(0, 1),
  paddingBottom: grid(0, 1),
  borderRadius: grid(0, 0, 1),
});

const ErrorTitle = styled.h2({
  ...fontHeightGrid(1, 0, 1),
  margin: 0,
});

const ErrorDetails = styled.p({
  ...fontHeightGrid(1),
  margin: 0,
});
