import { z } from "zod";

function isHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

const socialUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || isHttpsUrl(v), "https:// ile başlayan bir adres girin.");

export const footerSchema = z.object({
  enabled: z.boolean(),
  description: z.string().trim().max(1000),
  copyright: z.string().trim().max(255),
  email: z.union([
    z.literal(""),
    z.email("Geçerli bir e-posta girin.").max(255),
  ]),
  phone: z
    .string()
    .trim()
    .max(50)
    .regex(/^[0-9+()\s-]*$/, "Telefon yalnızca rakam, boşluk ve + ( ) - içerebilir."),
  address: z.string().trim().max(500),
  facebookUrl: socialUrl,
  instagramUrl: socialUrl,
  linkedinUrl: socialUrl,
  youtubeUrl: socialUrl,
  githubUrl: socialUrl,
});

export type FooterFormValues = z.infer<typeof footerSchema>;
