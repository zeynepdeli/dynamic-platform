"use client";

import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import {
  Field,
  FieldDescription,
  FieldError as FieldErrorMessage,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { HEX_COLOR_REGEX } from "@/lib/validations/common";

type ColorFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  control: Control<T>;
  description?: string;
  /** Boş bırakılabilir mi? (boş = tema/otomatik renk) */
  allowEmpty?: boolean;
};

// Renk seçici + elle yazılabilen #RRGGBB alanı (ikisi senkron)
export function ColorField<T extends FieldValues>({
  name,
  label,
  control,
  description,
  allowEmpty = false,
}: ColorFieldProps<T>) {
  const id = String(name).replace(/\./g, "-");
  const errorId = `${id}-error`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const value = typeof field.value === "string" ? field.value : "";
        const isValid = HEX_COLOR_REGEX.test(value);

        return (
          <Field data-invalid={!!fieldState.error}>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>

            <div className="flex items-center gap-3">
              {allowEmpty && value === "" ? (
                // Boş = tema/otomatik renk. Siyah göstermek yanıltıcı olurdu.
                <button
                  type="button"
                  onClick={() => field.onChange("#ffffff")}
                  aria-label={`${label} için renk seç`}
                  className="flex h-11 w-14 shrink-0 items-center justify-center rounded-lg border border-dashed border-border text-lg text-muted-foreground hover:bg-surface-muted"
                >
                  +
                </button>
              ) : (
                <input
                  type="color"
                  aria-label={`${label} seçici`}
                  // Geçersiz değer yazılırken seçici bozulmasın
                  value={isValid ? value.toLowerCase() : "#000000"}
                  onChange={(event) => field.onChange(event.target.value)}
                  className="h-11 w-14 shrink-0 cursor-pointer rounded-lg border border-border bg-transparent p-1"
                />
              )}

              <Input
                id={id}
                ref={field.ref}
                name={field.name}
                value={value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                maxLength={7}
                placeholder={allowEmpty ? "Otomatik" : "#183350"}
                spellCheck={false}
                autoComplete="off"
                aria-invalid={!!fieldState.error}
                aria-describedby={fieldState.error ? errorId : undefined}
                className="font-mono uppercase placeholder:normal-case"
              />

              {allowEmpty && value !== "" && (
                <button
                  type="button"
                  onClick={() => field.onChange("")}
                  aria-label={`${label} temizle`}
                  title="Temizle (otomatik renge dön)"
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                >
                  ×
                </button>
              )}
            </div>

            {description && !fieldState.error && (
              <FieldDescription>{description}</FieldDescription>
            )}

            {fieldState.error?.message && (
              <FieldErrorMessage id={errorId}>
                {fieldState.error.message}
              </FieldErrorMessage>
            )}
          </Field>
        );
      }}
    />
  );
}
