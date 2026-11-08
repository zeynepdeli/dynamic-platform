import "./zod-locale";
import { z } from "zod";

export const newAdminSchema = z
  .object({
    email: z.email("Geçerli bir e-posta girin.").max(254),
    password: z.string().min(12, "Şifre en az 12 karakter olmalı.").max(128),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: "Şifreler eşleşmiyor." });

export type NewAdminValues = z.infer<typeof newAdminSchema>;
