import { query } from '../config/database';
import { Request } from 'express';

export async function logAction(
  userId: string | null,
  action: string,
  resourceType?: string,
  resourceId?: string,
  metadata?: Record<string, unknown>,
  req?: Request
): Promise<void> {
  try {
    const ip = req
      ? (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress
      : null;
    const userAgent = req?.headers['user-agent'] || null;

    await query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent, metadata)
       VALUES ($1, $2, $3, $4, $5::inet, $6, $7)`,
      [
        userId || null,
        action,
        resourceType || null,
        resourceId || null,
        ip || null,
        userAgent || null,
        metadata ? JSON.stringify(metadata) : null,
      ]
    );
  } catch (err) {
    console.error('Audit log failed:', err);
  }
}

export async function getAuditLogs(
  filters: { userId?: string; action?: string; limit?: number; offset?: number } = {}
) {
  const { userId, action, limit = 50, offset = 0 } = filters;
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (userId) {
    params.push(userId);
    conditions.push(`al.user_id = $${params.length}`);
  }
  if (action) {
    params.push(`%${action}%`);
    conditions.push(`al.action ILIKE $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(limit, offset);

  const result = await query(
    `SELECT al.*, u.email, u.full_name
     FROM audit_logs al
     LEFT JOIN users u ON al.user_id = u.id
     ${where}
     ORDER BY al.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return result.rows;
}
