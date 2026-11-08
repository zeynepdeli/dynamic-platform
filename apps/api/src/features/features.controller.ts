import { Controller, Get } from '@nestjs/common';

import { readFeatures } from './features.js';

/** Admin ve web hangi ekranları/sayfaları göstereceğini buradan öğrenir. */
@Controller('features')
export class FeaturesController {
  @Get()
  get() {
    return readFeatures();
  }
}
