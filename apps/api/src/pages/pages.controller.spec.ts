import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { I18nService } from '../i18n/i18n.service.js';

import { PagesController } from './pages.controller.js';
import { PagesService } from './pages.service.js';

describe('PagesController (public)', () => {
  let controller: PagesController;
  const pagesService = {
    findAll: vi.fn(),
    findPublishedBySlug: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagesController],
      providers: [
        { provide: PagesService, useValue: pagesService },
        { provide: I18nService, useValue: { resolve: vi.fn().mockResolvedValue({ locale: 'tr', defaultLocale: 'tr', locales: ['tr'] }) } },
      ],
    }).compile();

    controller = module.get(PagesController);
  });

  it('geçerli slug ile servisi çağırır', async () => {
    pagesService.findPublishedBySlug.mockResolvedValue({ slug: 'hakkimizda' });
    await expect(controller.findBySlug('hakkimizda')).resolves.toEqual({
      slug: 'hakkimizda',
    });
  });

  it.each(['../admin', 'A', "x' OR 1=1", 'a'.repeat(151)])(
    'geçersiz slug için DB sorgusu yapmadan 404 döner: %s',
    async (slug) => {
      await expect(controller.findBySlug(slug)).rejects.toThrow(NotFoundException);
      expect(pagesService.findPublishedBySlug).not.toHaveBeenCalled();
    },
  );
});
