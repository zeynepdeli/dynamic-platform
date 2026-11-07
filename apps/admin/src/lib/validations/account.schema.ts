import { z } from "zod";

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mevcut şifrenizi girin.").max(128),
    newPassword: z.string().min(12, "Yeni şifre en az 12 karakter olmalı.").max(128),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Şifreler eşleşmiyor.",
  });

export type PasswordFormValues = z.infer<typeof passwordSchema>;
