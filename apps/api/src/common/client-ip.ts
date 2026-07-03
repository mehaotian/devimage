import type { FastifyRequest } from 'fastify';

/**
 * 解析客户端 IP（优先 Nginx X-Real-IP，其次 Fastify req.ip）
 */
export function resolveClientIp(req: FastifyRequest): string {
  const forwarded = req.headers['x-real-ip'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded;
  }
  return req.ip ?? 'unknown';
}
