import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService],
    }).compile();
    service = module.get(HealthService);
  });

  it('should pass sharp check', async () => {
    const result = await service.checkSharp();
    expect(result.ok).toBe(true);
  });

  it('should pass dicebear check', () => {
    const result = service.checkDicebear();
    expect(result.ok).toBe(true);
  });

  it('should pass pseudo-code golden check', () => {
    const result = service.checkPseudoCode();
    expect(result.ok).toBe(true);
  });

  it('should run all checks', async () => {
    const checks = await service.runChecks();
    expect(checks).toHaveLength(4);
    expect(checks.every((item) => item.ok)).toBe(true);
  });
});
