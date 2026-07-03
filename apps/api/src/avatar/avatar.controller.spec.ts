import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { AvatarController } from './avatar.controller';
import { AvatarStyleService } from './avatar-style.service';
import { AvatarRasterService } from './avatar-raster.service';

const mockReq = { ip: '127.0.0.1', headers: {} } as FastifyRequest;

describe('AvatarController', () => {
  let controller: AvatarController;
  let styleService: jest.Mocked<Pick<AvatarStyleService, 'isKnownStyle' | 'renderSvg' | 'listStyles' | 'listPatterns'>>;
  let rasterService: jest.Mocked<Pick<AvatarRasterService, 'renderRaster'>>;

  beforeEach(() => {
    styleService = {
      isKnownStyle: jest.fn().mockReturnValue(true),
      renderSvg: jest.fn().mockReturnValue('<svg xmlns="http://www.w3.org/2000/svg"></svg>'),
      listStyles: jest.fn().mockReturnValue([]),
      listPatterns: jest.fn().mockReturnValue({ count: 0, groups: [] }),
    };
    rasterService = {
      renderRaster: jest.fn().mockResolvedValue(Buffer.from('png')),
    };
    controller = new AvatarController(
      styleService as unknown as AvatarStyleService,
      rasterService as unknown as AvatarRasterService,
    );
  });

  it('should decode percent-encoded seed', async () => {
    await controller.getStyledAvatar(mockReq, 'devimg', '%E5%BC%A0%E4%B8%89', '128', {});
    expect(styleService.renderSvg).toHaveBeenCalledWith(
      expect.objectContaining({ seed: '张三' }),
    );
  });

  it('should throw NotFoundException for unknown style', () => {
    styleService.isKnownStyle.mockReturnValue(false);
    expect(() => controller['renderSvgAvatar']('unknown', 'Luna', '128', {})).toThrow(
      NotFoundException,
    );
  });

  it('should throw BadRequestException for invalid format', async () => {
    await expect(
      controller.getStyledAvatar(mockReq, 'devimg', 'Luna', '128', { format: 'gif' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should route raster format to raster service with client ip', async () => {
    await controller.getStyledAvatar(mockReq, 'devimg', 'Luna', '128', { format: 'webp' });
    expect(rasterService.renderRaster).toHaveBeenCalledWith(
      expect.objectContaining({ raster: true }),
      'webp',
      '127.0.0.1',
    );
  });
});
