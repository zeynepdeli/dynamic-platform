# src/core — ÇEKİRDEK (dokunma)

Bu klasör dynamic-platform çekirdeğine aittir. Müşteri projelerinde
**değiştirmeyin**; böylece `git merge upstream/main` ile gelen güvenlik
düzeltmeleri çakışmadan uygulanır.

| Dosya | Görevi |
|---|---|
| `types.ts` | API'den gelen verilerin tipleri |
| `api.ts` | API'ye güvenli istek (timeout, önbellek, yönlendirme yok) |
| `site.ts` | `getSite()`, `getPage(slug)`, `page.section("anahtar")` |
| `safe.ts` | Renk / görsel / bağlantı doğrulayıcıları (XSS & CSS injection koruması) |
| `theme.ts` | Admin'deki renkleri CSS değişkenlerine çevirir |

Tasarımı değiştirmek için `src/components/` ve `src/app/` klasörlerini düzenleyin.
