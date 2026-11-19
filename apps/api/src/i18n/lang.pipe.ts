import { Injectable, type PipeTransform } from '@nestjs/common';

/**
 * ?lang= sorgusu: yalnızca iki küçük harf kabul edilir, gerisi yok sayılır (ana dil kullanılır).
 * Hangi dillerin açık olduğuna servis karar verir (resolveLocale).
 */
@Injectable()
export class LangPipe implements PipeTransform<unknown, string | undefined> {
  transform(value: unknown): string | undefined {
    return typeof value === 'string' && /^[a-z]{2}$/.test(value)
      ? value
      : undefined;
  }
}
