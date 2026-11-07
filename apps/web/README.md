# apps/web — Ziyaretçi sitesi (başlangıç kiti)

İçeriğin tamamı admin panelinden gelir. Her müşteri projesinde sadece
**görünüm** değişir; veri çekme ve güvenlik katmanı hazırdır.

```bash
cp .env.example .env.local
pnpm dev            # http://localhost:3000
```

## Klasör yapısı

```
src/
├─ core/            🔒 ÇEKİRDEK — müşteri projesinde değiştirmeyin
│  ├─ api.ts        API isteği (timeout, önbellek, yönlendirme yok)
│  ├─ site.ts       getSite(), getPage(slug), getHome(), buildMenuTree()
│  ├─ safe.ts       renk / görsel / bağlantı doğrulayıcıları
│  ├─ theme.ts      admin renkleri → CSS değişkenleri
│  └─ types.ts
├─ components/      ✏️ MÜŞTERİYE ÖZEL — tasarımı burada değiştirin
│  ├─ site/         Header, MobileMenu, Footer, HeroSlider, SmartLink
│  └─ sections/     CardsSection, TextSection, ImageTextSection, CtaSection,
│                   icons.tsx (kart ikonları), SectionRenderer
└─ app/             ✏️ Sayfalar
   ├─ page.tsx      Ana sayfa
   ├─ [slug]/       Genel sayfa şablonu (admin'deki her sayfa)
   └─ layout.tsx    Fontlar, header/footer yerleşimi
```

## Tema renkleri

Admin → Görünüm'deki renkler otomatik olarak CSS değişkeni olur.
Bileşenlerde sabit renk yerine şunları kullanın:

| Sınıf | Kaynak |
|---|---|
| `bg-primary`, `text-primary` | Ana renk |
| `bg-secondary`, `text-secondary` | İkincil renk (butonlar) |
| `text-on-primary`, `text-on-secondary` | Bu renklerin üstünde okunur yazı rengi (otomatik) |
| `bg-site`, `text-foreground` | Sayfa arka planı ve yazı rengi |

## Bir sayfaya özel tasarım

Admin'de bölüme bir **anahtar** verin (ör. `vizyon`) — ya da
`apps/admin/src/brand/page-templates.ts` içinde şablon tanımlayın.
Sonra:

```tsx
// src/app/hakkimizda/page.tsx   ([slug]'dan önce eşleşir)
import { notFound } from "next/navigation";
import { getPage } from "@/core/site";

export default async function About() {
  const data = await getPage("hakkimizda");
  if (!data) notFound();

  const vizyon = data.section("vizyon");
  const degerler = data.section("degerler");

  return (
    <>
      <MyVisionHero title={vizyon?.title} body={vizyon?.body} />
      <MyValuesGrid cards={degerler?.items ?? []} />
    </>
  );
}
```

Ana sayfa için: `const home = await getHome(); home.section("hizmetler")`.

## 🔐 Güvenlik kuralları (bozmayın)

1. Admin'den gelen değeri **doğrulamadan** `style`, `href`, `src`'ye yazmayın:
   `safeColor()`, `safeImageSrc()`, `safeInternalHref()`, `safeHttpsUrl()` kullanın.
   Site içi linkler için `<SmartLink>` ve `<SectionButton>` hazır.
2. **`dangerouslySetInnerHTML` kullanmayın.** Metinler düz metindir;
   satır sonları `whitespace-pre-line` ile korunur.
3. Görseller CSS `url(...)` ile değil, `<img>` ile verilir (CSS injection yok).
4. Harici linklerde `target="_blank"` varsa `rel="noopener noreferrer"` zorunlu.
5. İstemci bileşenlerine (`"use client"`) yalnızca sunucuda doğrulanmış
   değerler gönderin (bkz. `app/page.tsx` → `HeroSlider`).
6. Kart ikonları yalnızca `components/sections/icons.tsx` listesinden seçilir;
   admin'den SVG/HTML gelmez.
