import React, { type CSSProperties } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

type TextFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label?: React.ReactNode;
  containerStyle?: CSSProperties;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function TextField<T extends FieldValues>({
  name,
  control,
  label,
  containerStyle,
  ...props
}: TextFieldProps<T>) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        textAlign: "start",
        ...(containerStyle || {}),
      }}
    >
      {label && (
        <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>
          {label}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({
          field,
        }: {
          field: {
            value: string;
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
            onBlur: () => void;
            ref: React.Ref<HTMLInputElement>;
            name: string;
          };
        }) => (
          <input
            type="text"
            {...field}
            {...props}
            style={{
              padding: 8,
              fontSize: 14,
              border: "1px solid #ccc",
              borderRadius: 4,
              flex: 1,
              ...props.style,
            }}
          />
        )}
      />
    </div>
  );
}
