import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { authenticate } from '../middleware/auth';
import { generateReport, getFullReport } from '../services/riskService';
import { logAction } from '../services/auditService';

const router = Router({ mergeParams: true });

router.post('/analyze', authenticate, async (req: Request, res: Response) => {
  const propCheck = await query(
    'SELECT id, status FROM properties WHERE id=$1 AND user_id=$2',
    [req.params.propertyId, req.user!.userId]
  );
  if (!propCheck.rows.length) {
    res.status(404).json({ success: false, error: 'Prona nuk u gjet' });
    return;
  }

  const docCount = await query(
    'SELECT COUNT(*) FROM documents WHERE property_id=$1',
    [req.params.propertyId]
  );
  const count = parseInt((docCount.rows[0] as Record<string, unknown>).count as string, 10);
  if (count === 0) {
    res.status(400).json({ success: false, error: 'Ngarkoni të paktën një dokument para analizës' });
    return;
  }

  await query(
    "UPDATE properties SET status='analyzing', updated_at=NOW() WHERE id=$1",
    [req.params.propertyId]
  );

  try {
    const reportId = await generateReport(req.params.propertyId, req.user!.userId);
    await logAction(req.user!.userId, 'generate_report', 'report', reportId, {}, req);
    res.json({ success: true, data: { report_id: reportId, message: 'Raporti u gjenerua me sukses' } });
  } catch (err) {
    await query(
      "UPDATE properties SET status='pending', updated_at=NOW() WHERE id=$1",
      [req.params.propertyId]
    );
    throw err;
  }
});

router.get('/report', authenticate, async (req: Request, res: Response) => {
  const propCheck = await query(
    'SELECT id FROM properties WHERE id=$1 AND user_id=$2',
    [req.params.propertyId, req.user!.userId]
  );
  if (!propCheck.rows.length) {
    res.status(404).json({ success: false, error: 'Prona nuk u gjet' });
    return;
  }

  const report = await getFullReport(req.params.propertyId);
  if (!report) {
    res.status(404).json({ success: false, error: 'Raporti nuk u gjet. Kryeni analizën fillimisht.' });
    return;
  }
  res.json({ success: true, data: report });
});

router.get('/report/pdf', authenticate, async (req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    error: 'Eksporti PDF do të jetë i disponueshëm së shpejti',
  });
});

export default router;
