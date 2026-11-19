import type { Type as ClassType } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsObject, IsOptional, ValidateNested } from 'class-validator';

import { SUPPORTED_LOCALES } from './locales.js';

/**
 * Bir modelin çeviri DTO'sundan (ör. HeroSlideTranslationDto) dil başına alanı olan kapsayıcı üretir:
 * { tr?: HeroSlideTranslationDto, en?: HeroSlideTranslationDto }.
 * Bilinmeyen dil kodu da, çeviri DTO'sunda olmayan alan da (forbidNonWhitelisted) reddedilir.
 */
export function TranslationsDto<T>(
  itemDto: ClassType<T>,
): ClassType<Partial<Record<(typeof SUPPORTED_LOCALES)[number], T>>> {
  class Translations {}
  for (const locale of SUPPORTED_LOCALES) {
    IsOptional()(Translations.prototype, locale);
    IsObject()(Translations.prototype, locale);
    ValidateNested()(Translations.prototype, locale);
    Type(() => itemDto)(Translations.prototype, locale);
  }
  Object.defineProperty(Translations, 'name', { value: `${itemDto.name}s` });
  return Translations as ClassType<
    Partial<Record<(typeof SUPPORTED_LOCALES)[number], T>>
  >;
}
