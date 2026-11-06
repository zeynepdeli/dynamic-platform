import { Controller, Get } from '@nestjs/common';

import { HeroSlidesService } from './hero-slides.service.js';

@Controller('hero-slides')
export class HeroSlidesController {
  constructor(private readonly heroSlidesService: HeroSlidesService) {}

  @Get()
  findPublic() {
    return this.heroSlidesService.findPublic();
  }
}
