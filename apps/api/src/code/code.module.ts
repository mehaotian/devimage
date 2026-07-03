import { Module } from '@nestjs/common';
import { BarcodeController } from './barcode.controller';
import { BarcodeService } from './barcode.service';
import { CodeStylesController } from './code-styles.controller';
import { PseudoCodeRasterService } from './pseudo-code-raster.service';
import { QrController } from './qr.controller';
import { QrService } from './qr.service';

@Module({
  controllers: [CodeStylesController, QrController, BarcodeController],
  providers: [QrService, BarcodeService, PseudoCodeRasterService],
  exports: [QrService, BarcodeService],
})
export class CodeModule {}
