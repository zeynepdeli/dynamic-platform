# Uçtan uca testler (Playwright)

Admin ve web'i gerçek tarayıcıda, gerçek API ve veritabanıyla test eder.

## Çalıştırma

1. Servisleri başlatın (ayrı terminallerde): API `:4000`, admin `:3001`, web `:3000`
   (bkz. kök README → "Yerel geliştirme").
2. İlk seferde tarayıcıyı indirin: `pnpm exec playwright install chromium`
3. Test kullanıcısını verin ve çalıştırın:

```bash
E2E_ADMIN_EMAIL=admin@ornek.com E2E_ADMIN_PASSWORD='...' pnpm test:e2e
```

Sonuç raporu: `pnpm exec playwright show-report e2e/report`

> Testler veritabanına benzersiz isimlerle kayıt ekler (SSS sorusu, mesaj vb.).
> **Canlı (production) veritabanında çalıştırmayın**; yerel veya test ortamında çalıştırın.

> Giriş denemesi dakikada 5 ile sınırlı (güvenlik). Testleri art arda çalıştırırken
> hata alırsanız bir dakika bekleyin.

## Ortam değişkenleri

| Değişken | Varsayılan |
|---|---|
| `ADMIN_URL` | http://localhost:3001 |
| `WEB_URL` | http://localhost:3000 |
| `API_URL` | http://localhost:4000 |
| `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` | — (zorunlu) |
| `CHROME_PATH` | Sistemdeki Chrome'u kullanmak için (isteğe bağlı) |
