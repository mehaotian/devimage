import { BadRequestException, StreamableFile } from '@nestjs/common';
import {
  runPseudoCodeHandler,
  runPseudoCodeHandlerAsync,
  toPseudoCodeStreamableFile,
} from './pseudo-code-http';

describe('pseudo-code-http', () => {
  it('should wrap sync errors as BadRequestException', () => {
    expect(() =>
      runPseudoCodeHandler(() => {
        throw new Error('Invalid variant. Use: matrix, minimal, dots');
      }),
    ).toThrow(BadRequestException);
  });

  it('should pass through sync success', () => {
    expect(runPseudoCodeHandler(() => '<svg></svg>')).toBe('<svg></svg>');
  });

  it('should wrap async errors as BadRequestException', async () => {
    await expect(
      runPseudoCodeHandlerAsync(async () => {
        throw new Error('Invalid width');
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should build streamable file for webp and png', () => {
    const buffer = Buffer.from('mock');
    expect(toPseudoCodeStreamableFile('webp', buffer)).toBeInstanceOf(StreamableFile);
    expect(toPseudoCodeStreamableFile('png', buffer)).toBeInstanceOf(StreamableFile);
  });
});
