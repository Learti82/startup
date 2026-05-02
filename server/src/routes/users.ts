import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { query } from '../config/database';
import { authenticate } from '../middleware/auth';
import { logAction } from '../services/auditService';
import { secureDelete } from '../services/encryptionService';
import path from 'path';
import { env } from '../config/env';
import { z } from 'zod';

const router = Router();

router.get('/me', authenticate, async (req: Request, res: Response) => {
  const result = await query(
    `SELECT u.id, u.email, u.full_name, u.role, u.phone, u.created_at,
            s.plan, s.reports_used, s.reports_limit, s.expires_at
     FROM users u
     LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
     WHERE u.id = $1`,
    [req.user!.userId]
  );
  if (!result.rows.length) {
    res.status(404).json({ success: false, error: 'Përdoruesi nuk u gjet' });
    return;
  }
  res.json({ success: true, data: result.rows[0] });
});

router.put('/me', authenticate, async (req: Request, res: Response) => {
  const schema = z.object({
    full_name: z.string().min(2).optional(),
    phone: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Të dhënat janë të pavlefshme' });
    return;
  }
  const { full_name, phone } = parsed.data;
  await query(
    'UPDATE users SET full_name=COALESCE($1,full_name), phone=COALESCE($2,phone), updated_at=NOW() WHERE id=$3',
    [full_name || null, phone || null, req.user!.userId]
  );
  await logAction(req.user!.userId, 'update_profile', 'user', req.user!.userId, {}, req);
  res.json({ success: true, message: 'Profili u përditësua' });
});

router.post('/me/change-password', authenticate, async (req: Request, res: Response) => {
  const schema = z.object({
    current_password: z.string(),
    new_password: z.string().min(8),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Fjalëkalimi i ri duhet të ketë të paktën 8 karaktere' });
    return;
  }
  const { current_password, new_password } = parsed.data;
  const result = await query('SELECT password_hash FROM users WHERE id=$1', [req.user!.userId]);
  const user = result.rows[0] as Record<string, unknown>;
  const valid = await bcrypt.compare(current_password, user.password_hash as string);
  if (!valid) {
    res.status(401).json({ success: false, error: 'Fjalëkalimi aktual është i gabuar' });
    return;
  }
  const newHash = await bcrypt.hash(new_password, 12);
  await query('UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2', [newHash, req.user!.userId]);
  await logAction(req.user!.userId, 'change_password', 'user', req.user!.userId, {}, req);
  res.json({ success: true, message: 'Fjalëkalimi u ndryshua me sukses' });
});

router.delete('/me', authenticate, async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const docs = await query(
    'SELECT file_path, stored_filename FROM documents d JOIN properties p ON d.property_id=p.id WHERE p.user_id=$1',
    [userId]
  );
  for (const doc of docs.rows as Array<Record<string, unknown>>) {
    const filePath = path.join(env.uploadDir, doc.stored_filename as string);
    secureDelete(filePath);
  }

  await query('DELETE FROM users WHERE id=$1', [userId]);
  await logAction(userId, 'account_deleted', 'user', userId, {}, req);
  res.json({ success: true, message: 'Llogaria dhe të gjitha të dhënat u fshiën me sukses' });
});

router.get('/me/export', authenticate, async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const user = await query('SELECT id, email, full_name, role, phone, created_at FROM users WHERE id=$1', [userId]);
  const properties = await query('SELECT * FROM properties WHERE user_id=$1', [userId]);
  const docs = await query(
    'SELECT id, document_type, original_filename, upload_date FROM documents d JOIN properties p ON d.property_id=p.id WHERE p.user_id=$1',
    [userId]
  );
  const reports = await query(
    'SELECT r.overall_score, r.overall_status, r.ai_summary, r.created_at FROM risk_reports r JOIN properties p ON r.property_id=p.id WHERE p.user_id=$1',
    [userId]
  );

  await logAction(userId, 'export_data', 'user', userId, {}, req);
  res.json({
    success: true,
    data: {
      exported_at: new Date().toISOString(),
      user: user.rows[0],
      properties: properties.rows,
      documents: docs.rows,
      reports: reports.rows,
    },
  });
});

export default router;
