import { Controller, Get } from '@nestjs/common';

import { FooterSettingsService } from './footer-settings.service.js';

@Controller('footer-settings')
export class FooterSettingsController {
  constructor(private readonly footerSettingsService: FooterSettingsService) {}

  // Herkese açık footer bilgilerini getir.
  @Get()
  findPublic() {
    return this.footerSettingsService.findPublic();
  }
}
