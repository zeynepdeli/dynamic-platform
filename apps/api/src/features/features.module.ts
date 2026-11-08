import { Module } from '@nestjs/common';

import { FeaturesController } from './features.controller.js';

@Module({ controllers: [FeaturesController] })
export class FeaturesModule {}
