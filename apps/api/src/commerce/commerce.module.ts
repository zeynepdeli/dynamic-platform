import { Module } from '@nestjs/common';

import { CatalogModule } from './catalog/catalog.module.js';

/**
 * E-ticaret modülü. AppModule yalnızca COMMERCE_ENABLED=true ise yükler.
 * Alt modüller: katalog (şimdi), müşteri, sepet, sipariş, ödeme (sonraki adımlar).
 */
@Module({ imports: [CatalogModule] })
export class CommerceModule {}
