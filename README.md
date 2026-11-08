# Dynamic Platform

Her müşteri için tekrar kullanılan site altyapısı. **API ve admin paneli hazırdır;
müşteriye göre yalnızca web sitesinin tasarımı (frontend) değişir.** Sitedeki tüm
içerik (menü, slider, bölümler, sayfalar, SSS, galeri, iletişim, SEO, footer,
sosyal medya, renkler) admin panelinden yönetilir.

| Uygulama | Teknoloji | Yerel port |
|---|---|---|
| `apps/api` | NestJS 12 · Prisma 7 · PostgreSQL | 4000 |
| `apps/admin` | Next.js 16 · React 19 · Tailwind 4 | 3001 |
| `apps/web` | Next.js 16 · React 19 · Tailwind 4 | 3000 |
| `e2e/` | Playwright uçtan uca testler | — |
| `infrastructure/` | Docker Compose (yerel DB + production) | 5433 |

---

## Yerel geliştirme

Gereken: Node 24 (`.nvmrc`), pnpm 10 (`corepack enable`), Docker.

```bash
pnpm install

# 1) Veritabanı
cp infrastructure/.env.example infrastructure/.env       # POSTGRES_* değerlerini girin
docker compose -f infrastructure/compose.yaml --env-file infrastructure/.env up -d

# 2) Ortam dosyaları (hiçbiri commit edilmez)
cp apps/api/.env.example   apps/api/.env                 # DATABASE_URL, JWT_SECRET, WEB_API_SECRET...
cp apps/admin/.env.example apps/admin/.env.local
cp apps/web/.env.example   apps/web/.env.local

# 3) Tablolar, örnek içerik, ilk yönetici
pnpm --filter api db:migrate
pnpm --filter api db:seed                                # yalnızca DB boşsa çalışır
pnpm --filter api create-admin                           # ADMIN_EMAIL / ADMIN_PASSWORD (.env)

# 4) Çalıştırma (ayrı terminallerde)
pnpm dev:api
pnpm dev:admin
pnpm dev:web
```

Admin: http://localhost:3001 · Site: http://localhost:3000

---

## Yeni müşteri kurulumu (kontrol listesi)

Bu repo bir **şablondur**. Her müşteri için GitHub'da "Use this template" ile yeni repo
açın, çekirdek güncellemelerini almak için bu repoyu `upstream` olarak ekleyin.

1. **Admin markası** – `apps/admin/src/brand/`
   - `brand.ts`: panel adı, alt yazı, logo (`public/brand/` altına koyun)
   - `theme.css`: panel renkleri ve yazı tipi (`--brand-*` değişkenleri)
   - `modules.ts`: panodaki modüller (SSS, İletişim, Galeri…). İstemediğinizi silin.
   - `page-templates.ts`: "Yeni sayfa" oluştururken sunulan hazır şablonlar
2. **Web tasarımı** – `apps/web/src/components/` ve `apps/web/src/app/`
   - `src/core/` klasörüne **dokunmayın** (güvenlik ve veri katmanı; bkz. `src/core/README.md`).
   - Bölüm bileşenleri admin'deki bölüm tiplerinin (Kartlar, SSS, Galeri, Harita…) görünümüdür.
3. **Ortam değişkenleri** – her müşteri için yeni gizli anahtarlar üretin
   (`openssl rand -base64 64` → `JWT_SECRET`, `openssl rand -hex 32` → `WEB_API_SECRET`).
4. **Görseller** – Cloudinary önerilir (`MEDIA_STORAGE=cloudinary`, müşteri başına ayrı `CLOUDINARY_FOLDER`).
5. **E-posta** – SMTP bilgileri ("şifremi unuttum" ve yeni mesaj bildirimi için).
   Admin → Mesajlar ekranındaki e-posta kutusundan test e-postası gönderin.
6. **Modüller** – E-ticaret gerekiyorsa `COMMERCE_ENABLED=true` (API ortam değişkeni). Admin'de
   **Mağaza** grubu (Ürün / Kategori Yönetimi) açılır; mağaza API'si `/shop/...` altında yayınlanır.
   Kapalıyken bu uçlar hiç yüklenmez.
7. **Yayın öncesi** – Admin → SEO Yönetimi'nden **arama motoru indekslemeyi açın**
   (örnek içerikle kurulan site kapalı başlar).

---

## Mağaza API'si (COMMERCE_ENABLED=true)

Müşteriye özel frontend bu uçları kullanır (hepsi herkese açık, yalnızca yayındaki kayıtlar):

| Uç | Açıklama |
|---|---|
| `GET /features` | Açık modüller (`{ "commerce": true }`) |
| `GET /shop/categories` | Aktif kategoriler ve ürün sayıları |
| `GET /shop/categories/:slug` | Kategori bilgisi (SEO alanlarıyla) |
| `GET /shop/products?category=&q=&sort=new\|price-asc\|price-desc\|name&featured=true&page=&limit=` | Sayfalı ürün listesi (limit ≤ 48) |
| `GET /shop/products/:slug` | Ürün detayı: görseller, sekmeler, SEO |

Fiyatlar `"249.90"` biçiminde metin döner (kuruş hatası olmasın diye). Kesin stok adedi
paylaşılmaz; yalnızca `inStock` döner. Gizli kategorideki ürünler de gizlidir.

---

## Yayına alma (tek sunucu, Docker)

Tüm sistem (PostgreSQL, API, admin, web, otomatik HTTPS) tek komutla kalkar.
Gereken: Docker yüklü bir Linux sunucu, 80/443 portları açık, üç alan adı
(ör. `siteadi.com`, `admin.siteadi.com`, `api.siteadi.com`) için sunucuyu gösteren DNS A kayıtları.

```bash
git clone <repo> && cd <repo>/infrastructure
cp .env.prod.example .env.prod          # doldurun — ASLA commit etmeyin, sohbetlerde paylaşmayın
chmod 600 .env.prod

docker compose -f compose.prod.yaml --env-file .env.prod up -d --build

# İlk kurulumda bir kez:
docker compose -f compose.prod.yaml --env-file .env.prod run --rm api node_modules/.bin/tsx prisma/seed.ts
docker compose -f compose.prod.yaml --env-file .env.prod run --rm api node_modules/.bin/tsx scripts/create-admin.ts
```

Ardından `.env.prod` içindeki `ADMIN_PASSWORD` satırını silebilirsiniz.

- **HTTPS**: Caddy, Let's Encrypt sertifikalarını otomatik alır ve yeniler.
- **Migration**: Her `up` sırasında `migrate` servisi bekleyen migration'ları uygular, sonra API başlar.
- **Güncelleme**: `git pull && docker compose -f compose.prod.yaml --env-file .env.prod up -d --build`
- **Yedek**: Veritabanı → `docker compose ... exec postgres pg_dump -U <kullanıcı> <db> > yedek.sql`.
  `MEDIA_STORAGE=local` ise `media` volume'ünü de yedekleyin.
- Veritabanı dışarıya port açmaz; API, admin ve web yalnızca Caddy üzerinden erişilir.

> Docker kullanmadan (ör. Railway/Render + Supabase) yayınlamak da mümkündür: her uygulama
> `Dockerfile` içindeki ilgili hedefle (`--target api|admin|web`) imaj olarak çalışır.
> Önünde X-Forwarded-For başlığını **üzerine yazan** bir reverse proxy olmalı ve
> `TRUST_PROXY_HOPS` buna göre ayarlanmalıdır.

---

## Güvenlik (OWASP Top 10 özeti)

- **Kimlik doğrulama**: argon2 şifre özeti, kısa ömürlü JWT + dönen yenileme oturumu
  (yeniden kullanımda tüm oturumlar iptal), şifre değişince eski token'lar geçersiz,
  token'lar yalnızca httpOnly/secure/sameSite çerezlerde.
- **Hız sınırı**: giriş, şifre sıfırlama ve iletişim formu ziyaretçi IP'si bazında sınırlı
  (web/admin sunucusu gerçek IP'yi yalnızca `WEB_API_SECRET` ile imzalı başlıkla iletir).
- **Girdi doğrulama**: tüm DTO'larda beyaz liste (bilinmeyen alan reddedilir), renk/URL/görsel/
  video bağlantısı doğrulayıcıları, tek satır alanlarda satır sonu engeli (e-posta başlık enjeksiyonu).
- **Çıktı**: içerik React ile kaçışlanır; HTML enjekte edilmez; e-postalar düz metindir;
  video yalnızca YouTube/Vimeo'dan gömülür.
- **Yüklemeler**: tür ve boyut kontrolü, imza (magic byte) doğrulaması, Cloudinary imzalı yükleme.
- **Başlıklar**: Helmet, CSP taban kuralları, HSTS (production), admin `noindex`.
- **Sırlar**: `.env*` dosyaları commit edilmez; production değerleri yalnızca sunucuda tutulur.

---

## Testler ve kontroller

```bash
pnpm typecheck        # tüm uygulamalar
pnpm lint
pnpm test             # API birim testleri (vitest)
pnpm build
pnpm test:e2e         # Playwright — servisler çalışıyor olmalı (bkz. e2e/README.md)
```

GitHub Actions (`.github/workflows/ci.yml`) her PR'da typecheck, lint, birim testleri ve build'i çalıştırır.
