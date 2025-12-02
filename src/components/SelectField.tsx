import React, { type CSSProperties } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

const containerStyle: CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  textAlign: "start",
};

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: 14,
  marginBottom: 6,
};

const selectStyle: CSSProperties = {
  padding: 8,
  fontSize: 14,
  border: "1px solid #ccc",
  borderRadius: 4,
  flex: 1,
};

export type SelectFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label?: React.ReactNode;
  options: { value: string; label: string }[];
  containerStyle?: CSSProperties;
  labelStyle?: CSSProperties;
  selectStyle?: CSSProperties;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

export function FormSelectField<T extends FieldValues>({
  name,
  control,
  label,
  options,
  onChange,
  ...props
}: SelectFieldProps<T>) {
  return (
    <div style={containerStyle}>
      {label && <label style={labelStyle}>{label}</label>}

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <select
            {...field}
            onChange={(...props) => {
              onChange?.(...props);
              field.onChange(...props);
            }}
            {...props}
            style={selectStyle}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      />
    </div>
  );
}

export function SelectField<T extends FieldValues>({
  label,
  options,
  onChange,
  ...props
}: Omit<SelectFieldProps<T>, "control" | "name" | "onChange"> & {
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
}) {
  return (
    <div style={containerStyle}>
      {label && <label style={labelStyle}>{label}</label>}

      <select
        onChange={(...props) => onChange?.(...props)}
        {...props}
        style={selectStyle}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
