import { z } from "zod";

import { imageUrlSchema, optionalHexColorSchema } from "./common";

export const footerSchema = z.object({
  enabled: z.boolean(),
  backgroundColor: optionalHexColorSchema,
  backgroundImage: imageUrlSchema,
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
});

export type FooterFormValues = z.infer<typeof footerSchema>;
