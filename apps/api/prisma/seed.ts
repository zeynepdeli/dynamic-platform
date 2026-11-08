/**
 * Örnek içerik: yeni müşteri kurulumunda boş bir site yerine düzenlenebilir
 * bir başlangıç verir. Yalnızca VERİTABANI BOŞSA çalışır (mevcut içeriğe
 * dokunmaz). Çalıştırma: pnpm --filter api db:seed
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/generated/prisma/client.js';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL zorunludur.');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
const siteName = process.env.SEED_SITE_NAME?.trim() || 'Firma Adı';

try {
  const [sections, menu, pages] = await Promise.all([
    prisma.section.count(),
    prisma.menuItem.count(),
    prisma.page.count(),
  ]);
  if (sections + menu + pages > 0) {
    console.log('Veritabanında içerik var; örnek içerik eklenmedi (mevcut veriye dokunulmaz).');
    process.exit(0);
  }

  await prisma.$transaction(async (tx) => {
    await tx.siteSettings.upsert({
      where: { id: 'main' },
      update: {},
      create: {
        siteName,
        description: `${siteName} — kısa tanıtım cümlesi.`,
        metaTitle: siteName,
        metaDescription: `${siteName} resmi web sitesi.`,
        // Kurulumda site arama motorlarına kapalı; yayına hazır olunca
        // admin → SEO Yönetimi → Robots'tan açın.
        allowIndexing: false,
      },
    });

    await tx.footerSettings.upsert({
      where: { id: 'main' },
      update: {},
      create: {
        description: `${siteName}, müşterilerine güvenilir hizmet sunar.`,
        email: 'info@ornek.com',
        phone: '+90 212 000 00 00',
        copyright: `© ${new Date().getFullYear()} ${siteName}. Tüm hakları saklıdır.`,
      },
    });

    await tx.menuItem.createMany({
      data: [
        { label: 'Ana Sayfa', href: '/', icon: 'home', order: 0 },
        { label: 'Hakkımızda', href: '/hakkimizda', icon: 'info', order: 1 },
      ],
    });

    const services = await tx.section.create({
      data: {
        key: 'hizmetler',
        type: 'CARDS',
        title: 'Hizmetlerimiz',
        subtitle: 'Neler yapıyoruz',
        body: 'Hizmetlerinizi buradan anlatın. Kartları admin → Ana Sayfa Yönetimi → Hizmetlerimiz bölümünden düzenleyebilirsiniz.',
        columns: 3,
        order: 0,
      },
    });
    await tx.sectionItem.createMany({
      data: [
        { sectionId: services.id, title: 'Birinci hizmet', description: 'Kısa açıklama.', icon: 'package', order: 0 },
        { sectionId: services.id, title: 'İkinci hizmet', description: 'Kısa açıklama.', icon: 'truck', order: 1 },
        { sectionId: services.id, title: 'Üçüncü hizmet', description: 'Kısa açıklama.', icon: 'users', order: 2 },
      ],
    });

    const stats = await tx.section.create({
      data: { key: 'rakamlar', type: 'STATS', title: 'Rakamlarla Biz', columns: 3, order: 1 },
    });
    await tx.sectionItem.createMany({
      data: [
        { sectionId: stats.id, title: '10+', description: 'Yıllık deneyim', order: 0 },
        { sectionId: stats.id, title: '500+', description: 'Mutlu müşteri', order: 1 },
        { sectionId: stats.id, title: '7/24', description: 'Destek', order: 2 },
      ],
    });

    await tx.section.create({
      data: {
        key: 'cagri',
        type: 'CTA',
        title: 'Projenizi konuşalım',
        body: 'Size en uygun çözümü birlikte bulalım.',
        buttonText: 'İletişime Geç',
        buttonHref: '/iletisim',
        order: 2,
      },
    });

    const about = await tx.page.create({
      data: { title: 'Hakkımızda', slug: 'hakkimizda', published: true },
    });
    await tx.section.create({
      data: {
        pageId: about.id,
        key: 'hikayemiz',
        type: 'TEXT',
        title: 'Hikayemiz',
        body: 'Firmanızın hikayesini buraya yazın.',
        order: 0,
      },
    });

    // Mağaza modülü açıksa örnek kategori ve ürün
    if (process.env.COMMERCE_ENABLED === 'true') {
      const category = await tx.productCategory.create({
        data: { name: 'Örnek Kategori', slug: 'ornek-kategori', order: 0 },
      });
      await tx.product.create({
        data: {
          name: 'Örnek Ürün',
          slug: 'ornek-urun',
          summary: 'Kısa ürün açıklaması.',
          description: 'Ürün açıklamasını admin → Mağaza → Ürün Yönetimi ekranından düzenleyin.',
          price: '199.90',
          unit: 'Adet',
          stock: 10,
          categoryId: category.id,
          tabs: { create: [{ title: 'Özellikler', body: 'Ürün özelliklerini buraya yazın.', order: 0 }] },
        },
      });
    }
  });

  console.log(`Örnek içerik eklendi (${siteName}). Site arama motorlarına KAPALI başlar; yayına alınca admin → SEO Yönetimi'nden açın.`);
} finally {
  await prisma.$disconnect();
}
