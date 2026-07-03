import { Controller, Get, Header } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { CODE_STYLES_CATALOG } from './code-styles.catalog';

/**
 * 码形占位风格目录（qr + barcode）
 */
@ApiTags('code')
@Controller()
export class CodeStylesController {
  /**
   * 列出伪 QR / 伪条码可用变体与 query 参数
   */
  @Get('code/styles')
  @SkipThrottle()
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: '码形占位风格与参数目录' })
  listStyles() {
    return CODE_STYLES_CATALOG;
  }
}
