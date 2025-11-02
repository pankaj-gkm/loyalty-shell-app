import React from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

type CheckboxFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label: React.ReactNode;
  style?: React.CSSProperties;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function CheckboxField<T extends FieldValues>({
  name,
  control,
  label,
  onChange,
  ...props
}: CheckboxFieldProps<T>) {
  return (
    <div>
      <label
        style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}
      >
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <input
              type="checkbox"
              checked={!!field.value}
              onChange={(...props) => {
                onChange?.(...props);
                field.onChange(...props);
              }}
              onBlur={field.onBlur}
              ref={field.ref}
              name={field.name}
              {...props}
            />
          )}
        />
        {label}
      </label>
    </div>
  );
}
