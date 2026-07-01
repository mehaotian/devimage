import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  /**
   * 健康检查探针
   */
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'devimage-api',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    };
  }
}
