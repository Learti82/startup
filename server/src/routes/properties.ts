import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { authenticate } from '../middleware/auth';
import { logAction } from '../services/auditService';
import { z } from 'zod';

const router = Router();

const propertySchema = z.object({
  title: z.string().min(5),
  address: z.string().min(5),
  municipality: z.string().optional(),
  parcel_number: z.string().optional(),
  property_type: z.enum(['apartment', 'house', 'land', 'commercial']).optional(),
  area_sqm: z.number().positive().optional(),
  asking_price_eur: z.number().positive().optional(),
  seller_name: z.string().optional(),
  developer_name: z.string().optional(),
  coordinates_lat: z.number().optional(),
  coordinates_lng: z.number().optional(),
  notes: z.string().optional(),
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  const parsed = propertySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Të dhënat janë të pavlefshme', details: parsed.error.flatten() });
    return;
  }

  const sub = await query(
    "SELECT reports_used, reports_limit FROM subscriptions WHERE user_id=$1 AND status='active'",
    [req.user!.userId]
  );
  const subscription = sub.rows[0] as Record<string, unknown> | undefined;
  if (subscription && Number(subscription.reports_used) >= Number(subscription.reports_limit)) {
    const totalProps = await query('SELECT COUNT(*) FROM properties WHERE user_id=$1', [req.user!.userId]);
    const count = parseInt((totalProps.rows[0] as Record<string, unknown>).count as string, 10);
    if (count >= Number(subscription.reports_limit)) {
      res.status(402).json({
        success: false,
        error: 'Keni arritur limitin e raporteve falas. Zgjidhni një plan për të vazhduar.',
      });
      return;
    }
  }

  const data = parsed.data;
  const result = await query(
    `INSERT INTO properties
      (user_id, title, address, municipality, parcel_number, property_type,
       area_sqm, asking_price_eur, seller_name, developer_name,
       coordinates_lat, coordinates_lng, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING *`,
    [
      req.user!.userId, data.title, data.address, data.municipality || null,
      data.parcel_number || null, data.property_type || null,
      data.area_sqm || null, data.asking_price_eur || null,
      data.seller_name || null, data.developer_name || null,
      data.coordinates_lat || null, data.coordinates_lng || null,
      data.notes || null,
    ]
  );

  const prop = result.rows[0] as Record<string, unknown>;
  await logAction(req.user!.userId, 'create_property', 'property', prop.id as string, { title: data.title }, req);
  res.status(201).json({ success: true, data: prop });
});

router.get('/', authenticate, async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string || '20', 10), 100);
  const offset = parseInt(req.query.offset as string || '0', 10);

  const result = await query(
    `SELECT p.*, r.overall_status, r.overall_score,
            (SELECT COUNT(*) FROM documents WHERE property_id = p.id) as doc_count
     FROM properties p
     LEFT JOIN risk_reports r ON p.id = r.property_id
     WHERE p.user_id = $1
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [req.user!.userId, limit, offset]
  );

  const total = await query('SELECT COUNT(*) FROM properties WHERE user_id=$1', [req.user!.userId]);
  const count = parseInt((total.rows[0] as Record<string, unknown>).count as string, 10);

  res.json({ success: true, data: result.rows, total: count, limit, offset });
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  const result = await query(
    `SELECT p.*,
            (SELECT COUNT(*) FROM documents WHERE property_id=p.id) as doc_count
     FROM properties p WHERE p.id=$1 AND p.user_id=$2`,
    [req.params.id, req.user!.userId]
  );
  if (!result.rows.length) {
    res.status(404).json({ success: false, error: 'Prona nuk u gjet' });
    return;
  }
  res.json({ success: true, data: result.rows[0] });
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  const parsed = propertySchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Të dhënat janë të pavlefshme' });
    return;
  }
  const existing = await query(
    'SELECT id FROM properties WHERE id=$1 AND user_id=$2',
    [req.params.id, req.user!.userId]
  );
  if (!existing.rows.length) {
    res.status(404).json({ success: false, error: 'Prona nuk u gjet' });
    return;
  }

  const d = parsed.data;
  await query(
    `UPDATE properties SET
      title=COALESCE($1,title), address=COALESCE($2,address),
      municipality=COALESCE($3,municipality), parcel_number=COALESCE($4,parcel_number),
      property_type=COALESCE($5,property_type), area_sqm=COALESCE($6,area_sqm),
      asking_price_eur=COALESCE($7,asking_price_eur), seller_name=COALESCE($8,seller_name),
      developer_name=COALESCE($9,developer_name), notes=COALESCE($10,notes),
      updated_at=NOW()
     WHERE id=$11`,
    [d.title,d.address,d.municipality,d.parcel_number,d.property_type,
     d.area_sqm,d.asking_price_eur,d.seller_name,d.developer_name,d.notes,
     req.params.id]
  );

  await logAction(req.user!.userId, 'update_property', 'property', req.params.id, {}, req);
  res.json({ success: true, message: 'Prona u përditësua me sukses' });
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  const existing = await query(
    'SELECT id FROM properties WHERE id=$1 AND user_id=$2',
    [req.params.id, req.user!.userId]
  );
  if (!existing.rows.length) {
    res.status(404).json({ success: false, error: 'Prona nuk u gjet' });
    return;
  }
  await query('DELETE FROM properties WHERE id=$1', [req.params.id]);
  await logAction(req.user!.userId, 'delete_property', 'property', req.params.id, {}, req);
  res.json({ success: true, message: 'Prona u fshi me sukses' });
});

export default router;
