import { forwardRef, memo } from "react";
import styled from "styled-components";
import React from "react";
import { fontHeightGrid, grid, Fonts, Colors } from "@src/logic/Design";
import { FieldValue, FormPath, useField, FieldError } from "react-formi";

type Props = {
  type?: "text" | "password";
  error?: boolean | string | FieldError | undefined;
  placeholder?: string;
  disabled?: boolean;
  prefix?: string;
  readOnly?: boolean;
  value?: string;
  onChange?: (val: string) => void;
  onKeyPress?: React.KeyboardEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  name?: string;
};

export const TextInput = memo(
  forwardRef<HTMLInputElement, Props>(
    (
      {
        error,
        disabled = false,
        placeholder,
        prefix,
        type = "text",
        name,
        onBlur,
        onChange,
        value,
        onKeyPress,
        readOnly,
        onFocus,
      },
      ref
    ) => {
      const hasError = Boolean(error);
      const errorMsg = !error ? null : error === true ? null : typeof error === "string" ? error : error.message;

      return (
        <Wrapper>
          <InputWrapper>
            {prefix && <Prefix>{prefix}</Prefix>}
            <Input
              {...{ name, onBlur, type, placeholder, value, onKeyPress, readOnly, onFocus }}
              hasError={hasError === true}
              disabled={disabled}
              isDisabled={disabled}
              onChange={(e) => {
                if (onChange) {
                  onChange(e.currentTarget.value);
                }
              }}
              ref={ref}
            />
          </InputWrapper>
          {errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}
        </Wrapper>
      );
    }
  )
);

type FormProps = {
  formPath: FormPath<FieldValue<string, string>>;
  type?: "text" | "password";
  placeholder?: string;
  disabled?: boolean;
  prefix?: string;
};

export const FormTextInput = memo<FormProps>(({ formPath, placeholder, type = "text", disabled = false, prefix }) => {
  const [state, actions] = useField(formPath);

  const error = state.isTouched && state.error?.message;

  return (
    <TextInput
      value={state.value}
      onBlur={actions.onBlur}
      onChange={actions.setValue}
      name={formPath.path.join(".")}
      {...{ error, placeholder, type, disabled, prefix }}
    />
  );
});

const Prefix = styled.span({
  ...fontHeightGrid(1, 0, 1),
  paddingRight: grid(0, 1),
});

const InputWrapper = styled.div({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
});

const Wrapper = styled.div({
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
});

const Input = styled.input<{ hasError: boolean; isDisabled: boolean }>(
  {
    margin: 0,
    width: 1,
    flex: 1,
    ...fontHeightGrid(1),
    ...Fonts.JetBrainsMono.Regular.Normal,
    paddingLeft: grid(0, 0, 1),
    paddingTop: grid(0, 0, 1),
    paddingBottom: grid(0, 0, 1),
    paddingRight: grid(0, 0, 1),
    borderWidth: 2,
    borderStyle: "solid",
    borderRadius: grid(0, 0, 0, 1),
    backgroundColor: Colors.indigo(50),
  },
  ({ hasError, isDisabled }) => ({
    borderColor: hasError ? Colors.red(500) : isDisabled ? Colors.grey(500) : Colors.blue(300),
    cursor: isDisabled ? "not-allowed" : "default",
  })
);

const ErrorMessage = styled.p({
  ...fontHeightGrid(1),
  color: Colors.red(500),
  paddingLeft: grid(0, 0, 1),
  paddingRight: grid(0, 0, 1),
});
