import { Controller, Get } from '@nestjs/common';

import { SocialLinksService } from './social-links.service.js';

@Controller('social-links')
export class SocialLinksController {
  constructor(private readonly service: SocialLinksService) {}

  @Get()
  findPublic() {
    return this.service.findPublic();
  }
}
