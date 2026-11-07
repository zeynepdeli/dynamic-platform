"use client";

import { useId, useRef, useState } from "react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { ImageIcon, Link2, Loader2, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError as FieldErrorMessage,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { uploadImageAction } from "@/app/actions/media";
import { imageUrlSchema } from "@/lib/validations/common";
import { IMAGE_ACCEPT, validateImageFile } from "@/lib/validations/media";

type ImageUploadFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  control: Control<T>;
  mediaBaseUrl: string;
  description?: string;
  required?: boolean;
  /** Önizleme kutusunun oranı (logo için geniş, favicon için kare) */
  previewClassName?: string;
};

// Doğrulanmış adresi tarayıcıda gösterilebilir hale getirir
function toPreviewSrc(value: string, mediaBaseUrl: string): string | null {
  if (!value || !imageUrlSchema.safeParse(value).success) {
    return null;
  }

  return value.startsWith("/media/") ? `${mediaBaseUrl}${value}` : value;
}

export function ImageUploadField<T extends FieldValues>({
  name,
  label,
  control,
  mediaBaseUrl,
  description = "JPG, PNG veya WEBP — en fazla 5 MB.",
  required = false,
  previewClassName = "aspect-video",
}: ImageUploadFieldProps<T>) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const value = typeof field.value === "string" ? field.value : "";
        const previewSrc = toPreviewSrc(value, mediaBaseUrl);
        const errorMessage = uploadError ?? fieldState.error?.message;

        async function handleFileChange(
          event: React.ChangeEvent<HTMLInputElement>,
        ) {
          const file = event.target.files?.[0];
          // Aynı dosya tekrar seçilebilsin
          event.target.value = "";

          if (!file) return;

          setUploadError(null);

          // Hızlı geri bildirim için tarayıcıda ön kontrol
          const clientError = validateImageFile(file);
          if (clientError) {
            setUploadError(clientError);
            return;
          }

          setUploading(true);

          const formData = new FormData();
          formData.append("file", file);

          const result = await uploadImageAction(formData);

          setUploading(false);

          if (!result.success) {
            setUploadError(result.error);
            return;
          }

          field.onChange(result.url);
        }

        return (
          <Field data-invalid={!!errorMessage}>
            <FieldLabel htmlFor={inputId}>
              {label}
              {required && (
                <span className="ml-1 text-destructive" aria-hidden="true">
                  *
                </span>
              )}
            </FieldLabel>

            <div className="@container">
            <div className="flex flex-col gap-4 @md:flex-row @md:items-start">
              {/* Önizleme */}
              <div
                className={`relative flex w-full max-w-60 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-surface-muted @md:w-48 ${previewClassName}`}
              >
                {uploading ? (
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                ) : previewSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewSrc}
                    alt={`${label} önizlemesi`}
                    referrerPolicy="no-referrer"
                    className="size-full object-contain"
                  />
                ) : (
                  <ImageIcon className="size-6 text-muted-foreground" />
                )}
              </div>

              {/* İşlemler */}
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <input
                  ref={fileInputRef}
                  id={inputId}
                  type="file"
                  accept={IMAGE_ACCEPT}
                  className="sr-only"
                  onChange={handleFileChange}
                  disabled={uploading}
                />

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="size-4" />
                    {value ? "Değiştir" : "Görsel Yükle"}
                  </Button>

                  {value && (
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2 text-destructive"
                      disabled={uploading}
                      onClick={() => {
                        setUploadError(null);
                        field.onChange("");
                      }}
                    >
                      <Trash2 className="size-4" />
                      Kaldır
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    className="gap-2"
                    aria-expanded={showUrlInput}
                    onClick={() => setShowUrlInput((open) => !open)}
                  >
                    <Link2 className="size-4" />
                    URL ile
                  </Button>
                </div>

                {showUrlInput && (
                  <Input
                    ref={field.ref}
                    name={field.name}
                    value={value}
                    onChange={(event) => {
                      setUploadError(null);
                      field.onChange(event.target.value);
                    }}
                    onBlur={field.onBlur}
                    placeholder="https://..."
                    spellCheck={false}
                    autoComplete="off"
                    aria-label={`${label} adresi`}
                    aria-invalid={!!errorMessage}
                  />
                )}

                {errorMessage ? (
                  <FieldErrorMessage>{errorMessage}</FieldErrorMessage>
                ) : (
                  <FieldDescription>{description}</FieldDescription>
                )}
              </div>
            </div>
            </div>
          </Field>
        );
      }}
    />
  );
}
