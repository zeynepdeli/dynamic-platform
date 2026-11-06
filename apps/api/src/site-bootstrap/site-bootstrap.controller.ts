import { Controller, Get } from '@nestjs/common';

import { SiteBootstrapService } from './site-bootstrap.service.js';

@Controller('site')
export class SiteBootstrapController {
  constructor(private readonly siteBootstrapService: SiteBootstrapService) {}

  @Get('bootstrap')
  getBootstrap() {
    return this.siteBootstrapService.getBootstrap();
  }
}
