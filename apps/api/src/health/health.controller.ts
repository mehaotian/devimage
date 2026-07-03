import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * 健康检查探针（含 sharp / DiceBear 依赖自检）
   */
  @Get()
  @SkipThrottle()
  async check() {
    const checks = await this.healthService.runChecks();
    const ok = checks.every((item) => item.ok);

    if (!ok) {
      throw new ServiceUnavailableException({
        status: 'degraded',
        service: 'devimage-api',
        version: '0.1.0',
        timestamp: new Date().toISOString(),
        checks,
      });
    }

    return {
      status: 'ok',
      service: 'devimage-api',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      checks,
    };
  }
}
