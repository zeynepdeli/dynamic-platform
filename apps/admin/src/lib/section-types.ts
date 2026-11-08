import type { FieldConfig, ItemField, SectionField } from "@/brand/page-templates";
import type { SectionType } from "@/lib/validations/section.schema";

/** Öğe (kart/soru/görsel/sayı) listesi olan bölüm türleri */
export const ITEM_TYPES: readonly SectionType[] = ["CARDS", "FAQ", "GALLERY", "STATS"];
export const hasItems = (type: SectionType) => ITEM_TYPES.includes(type);

/**
 * Yalnızca modüllerde (SSS, İletişim, Galeri) kullanılan türler: "Yeni bölüm"
 * seçicisinde gösterilmez (karışıklık olmasın). Şablonlarda kullanılabilir.
 */
export const MODULE_ONLY_TYPES: readonly SectionType[] = ["FAQ", "GALLERY", "MAP", "CONTACT_FORM"];

/** Izgara sütunu seçilebilen türler */
export const hasColumns = (type: SectionType) => ["CARDS", "GALLERY", "STATS"].includes(type);

const NONE = false as const;

/** Tür başına öğe adı ve alanları (şablon tanımı varsa o kazanır) */
export const ITEM_CONFIG: Partial<Record<SectionType, { label: string; fields?: FieldConfig<ItemField> }>> = {
  CARDS: { label: "Kart" },
  FAQ: {
    label: "Soru",
    fields: { title: "Soru", description: "Cevap", imageUrl: NONE, icon: NONE, buttonText: NONE, buttonHref: NONE, backgroundColor: NONE, backgroundImage: NONE },
  },
  GALLERY: {
    label: "Görsel",
    fields: { title: "Alt Yazı (isteğe bağlı)", imageUrl: "Görsel", description: NONE, icon: NONE, buttonText: NONE, buttonHref: NONE, backgroundColor: NONE, backgroundImage: NONE },
  },
  STATS: {
    label: "Sayı",
    fields: { title: "Sayı (ör. 500+)", description: "Açıklama (ör. Mutlu müşteri)", icon: "İkon", imageUrl: NONE, buttonText: NONE, buttonHref: NONE, backgroundImage: NONE },
  },
};

/** Tür başına bölüm formunda gizlenecek alanlar */
export const SECTION_FIELDS_BY_TYPE: Partial<Record<SectionType, FieldConfig<SectionField>>> = {
  VIDEO: { backgroundImage: NONE, columns: NONE },
  MAP: { backgroundImage: NONE, columns: NONE, body: "Açıklama (ör. çalışma saatleri)" },
  CONTACT_FORM: { columns: NONE, buttonText: NONE, buttonHref: NONE, body: "Formun üstündeki metin" },
  FAQ: { columns: NONE, body: "Giriş Metni" },
  GALLERY: { body: "Giriş Metni" },
  STATS: { body: "Giriş Metni" },
};
