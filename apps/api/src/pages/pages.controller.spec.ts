import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

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
      providers: [{ provide: PagesService, useValue: pagesService }],
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
    (slug) => {
      expect(() => controller.findBySlug(slug)).toThrow(NotFoundException);
      expect(pagesService.findPublishedBySlug).not.toHaveBeenCalled();
    },
  );
});
