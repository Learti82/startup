import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { env } from '../config/env';
import { logAction } from '../services/auditService';
import { createError } from '../middleware/errorHandler';
import { z } from 'zod';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(2),
  role: z.enum(['buyer', 'lawyer', 'bank', 'developer']).default('buyer'),
  phone: z.string().optional(),
  consent_gdpr: z.literal(true),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post('/register', async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Të dhënat janë të pavlefshme', details: parsed.error.flatten() });
    return;
  }
  const { email, password, full_name, role, phone, consent_gdpr } = parsed.data;

  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length) {
    res.status(409).json({ success: false, error: 'Email-i është tashmë i regjistruar' });
    return;
  }

  const password_hash = await bcrypt.hash(password, 12);
  const result = await query(
    `INSERT INTO users (email, password_hash, full_name, role, phone, consent_gdpr, consent_date)
     VALUES ($1,$2,$3,$4,$5,$6,NOW()) RETURNING id, email, full_name, role`,
    [email, password_hash, full_name, role, phone || null, consent_gdpr]
  );
  const user = result.rows[0] as Record<string, unknown>;

  await query(
    `INSERT INTO subscriptions (user_id, plan, reports_limit, price_eur)
     VALUES ($1, 'free', 999, 0)`,
    [user.id]
  );

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: '7d' }
  );

  await logAction(user.id as string, 'register', 'user', user.id as string, { role }, req);

  res.status(201).json({
    success: true,
    data: { token, user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role } },
  });
});

router.post('/login', async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Email ose fjalëkalim i pavlefshëm' });
    return;
  }
  const { email, password } = parsed.data;

  const result = await query(
    'SELECT id, email, password_hash, full_name, role, is_active FROM users WHERE email = $1',
    [email]
  );
  if (!result.rows.length) {
    res.status(401).json({ success: false, error: 'Email ose fjalëkalim i gabuar' });
    return;
  }
  const user = result.rows[0] as Record<string, unknown>;
  if (!user.is_active) {
    res.status(403).json({ success: false, error: 'Llogaria është e çaktivizuar' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password_hash as string);
  if (!valid) {
    await logAction(user.id as string, 'login_failed', 'user', user.id as string, {}, req);
    res.status(401).json({ success: false, error: 'Email ose fjalëkalim i gabuar' });
    return;
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: '7d' }
  );

  await logAction(user.id as string, 'login', 'user', user.id as string, {}, req);

  res.json({
    success: true,
    data: { token, user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role } },
  });
});

router.post('/logout', async (req: Request, res: Response) => {
  if (req.user) {
    await logAction(req.user.userId, 'logout', 'user', req.user.userId, {}, req);
  }
  res.json({ success: true, message: 'Dolët nga sistemi me sukses' });
});

export default router;
