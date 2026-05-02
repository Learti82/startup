import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { authenticate, requireRole } from '../middleware/auth';
import { getAuditLogs } from '../services/auditService';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/stats', async (_req: Request, res: Response) => {
  const [users, properties, reports, docs] = await Promise.all([
    query('SELECT COUNT(*) FROM users WHERE role != $1', ['admin']),
    query('SELECT COUNT(*) FROM properties'),
    query('SELECT COUNT(*) FROM risk_reports'),
    query('SELECT COUNT(*) FROM documents'),
  ]);

  const recentActivity = await query(
    `SELECT u.full_name, u.email, COUNT(p.id) as property_count,
            MAX(p.created_at) as last_activity
     FROM users u
     LEFT JOIN properties p ON u.id = p.user_id
     WHERE u.role != 'admin'
     GROUP BY u.id, u.full_name, u.email
     ORDER BY last_activity DESC NULLS LAST
     LIMIT 10`
  );

  const riskDistribution = await query(
    `SELECT overall_status, COUNT(*) as count
     FROM risk_reports GROUP BY overall_status`
  );

  const dailySignups = await query(
    `SELECT DATE(created_at) as date, COUNT(*) as count
     FROM users WHERE created_at > NOW() - INTERVAL '30 days'
     GROUP BY DATE(created_at) ORDER BY date`
  );

  res.json({
    success: true,
    data: {
      totals: {
        users: parseInt((users.rows[0] as Record<string, unknown>).count as string, 10),
        properties: parseInt((properties.rows[0] as Record<string, unknown>).count as string, 10),
        reports: parseInt((reports.rows[0] as Record<string, unknown>).count as string, 10),
        documents: parseInt((docs.rows[0] as Record<string, unknown>).count as string, 10),
      },
      recent_activity: recentActivity.rows,
      risk_distribution: riskDistribution.rows,
      daily_signups: dailySignups.rows,
    },
  });
});

router.get('/users', async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string || '50', 10), 200);
  const offset = parseInt(req.query.offset as string || '0', 10);
  const search = req.query.search as string || '';

  const params: unknown[] = [];
  let whereClause = "WHERE role != 'admin'";
  if (search) {
    params.push(`%${search}%`);
    whereClause += ` AND (email ILIKE $${params.length} OR full_name ILIKE $${params.length})`;
  }
  params.push(limit, offset);

  const result = await query(
    `SELECT id, email, full_name, role, phone, is_active, created_at,
            (SELECT COUNT(*) FROM properties WHERE user_id=users.id) as property_count
     FROM users ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  const total = await query(`SELECT COUNT(*) FROM users ${whereClause}`, params.slice(0, -2));
  res.json({
    success: true,
    data: result.rows,
    total: parseInt((total.rows[0] as Record<string, unknown>).count as string, 10),
  });
});

router.put('/users/:id/toggle-active', async (req: Request, res: Response) => {
  const result = await query(
    "UPDATE users SET is_active = NOT is_active, updated_at=NOW() WHERE id=$1 AND role != 'admin' RETURNING id, is_active",
    [req.params.id]
  );
  if (!result.rows.length) {
    res.status(404).json({ success: false, error: 'Përdoruesi nuk u gjet' });
    return;
  }
  res.json({ success: true, data: result.rows[0] });
});

router.get('/reports', async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string || '50', 10), 200);
  const offset = parseInt(req.query.offset as string || '0', 10);

  const result = await query(
    `SELECT r.*, p.title as property_title, p.address, p.municipality,
            u.email as user_email, u.full_name as user_name
     FROM risk_reports r
     JOIN properties p ON r.property_id = p.id
     JOIN users u ON p.user_id = u.id
     ORDER BY r.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  res.json({ success: true, data: result.rows });
});

router.get('/audit-logs', async (req: Request, res: Response) => {
  const logs = await getAuditLogs({
    userId: req.query.user_id as string,
    action: req.query.action as string,
    limit: parseInt(req.query.limit as string || '100', 10),
    offset: parseInt(req.query.offset as string || '0', 10),
  });
  res.json({ success: true, data: logs });
});

router.get('/developers', async (_req: Request, res: Response) => {
  const result = await query(
    'SELECT * FROM developer_profiles ORDER BY risk_score ASC'
  );
  res.json({ success: true, data: result.rows });
});

export default router;
