import { Module } from '@nestjs/common';
import { PhotoModule } from '../photo/photo.module';
import { MockController } from './mock.controller';
import { MockService } from './mock.service';

@Module({
  imports: [PhotoModule],
  controllers: [MockController],
  providers: [MockService],
})
export class MockModule {}
