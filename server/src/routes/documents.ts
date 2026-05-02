import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { query } from '../config/database';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { logAction } from '../services/auditService';
import { encryptFile, decryptFile, secureDelete } from '../services/encryptionService';
import { env } from '../config/env';

const router = Router({ mergeParams: true });

router.post('/', authenticate, upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ success: false, error: 'Asnjë skedar nuk u ngarkua' });
    return;
  }

  const propCheck = await query(
    'SELECT id FROM properties WHERE id=$1 AND user_id=$2',
    [req.params.propertyId, req.user!.userId]
  );
  if (!propCheck.rows.length) {
    fs.unlinkSync(req.file.path);
    res.status(404).json({ success: false, error: 'Prona nuk u gjet' });
    return;
  }

  const documentType = req.body.document_type || 'other';
  const allowedTypes = ['cadastral_extract','construction_permit','ownership_contract','mortgage_certificate','id_document','use_permit','property_tax','court_order','other'];
  if (!allowedTypes.includes(documentType)) {
    fs.unlinkSync(req.file.path);
    res.status(400).json({ success: false, error: 'Lloji i dokumentit nuk njihet' });
    return;
  }

  const encryptedPath = req.file.path + '.enc';
  let iv: string;
  try {
    iv = encryptFile(req.file.path, encryptedPath);
    fs.unlinkSync(req.file.path);
  } catch {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, error: 'Enkriptimi i skedarit dështoi' });
    return;
  }

  const result = await query(
    `INSERT INTO documents
      (property_id, user_id, document_type, original_filename, stored_filename,
       file_path, file_size_bytes, mime_type, encryption_iv, is_encrypted)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true)
     RETURNING *`,
    [
      req.params.propertyId, req.user!.userId, documentType,
      req.file.originalname, path.basename(encryptedPath),
      encryptedPath, req.file.size, req.file.mimetype, iv,
    ]
  );

  await query(
    "UPDATE properties SET status='pending', updated_at=NOW() WHERE id=$1",
    [req.params.propertyId]
  );

  await logAction(req.user!.userId, 'upload_document', 'document',
    (result.rows[0] as Record<string, unknown>).id as string,
    { type: documentType, filename: req.file.originalname }, req);

  res.status(201).json({ success: true, data: result.rows[0] });
});

router.get('/', authenticate, async (req: Request, res: Response) => {
  const propCheck = await query(
    'SELECT id FROM properties WHERE id=$1 AND user_id=$2',
    [req.params.propertyId, req.user!.userId]
  );
  if (!propCheck.rows.length) {
    res.status(404).json({ success: false, error: 'Prona nuk u gjet' });
    return;
  }

  const result = await query(
    `SELECT id, document_type, original_filename, file_size_bytes, mime_type,
            ocr_status, upload_date, created_at
     FROM documents WHERE property_id=$1 ORDER BY created_at DESC`,
    [req.params.propertyId]
  );
  res.json({ success: true, data: result.rows });
});

router.get('/:docId/download', authenticate, async (req: Request, res: Response) => {
  const result = await query(
    `SELECT d.* FROM documents d
     JOIN properties p ON d.property_id=p.id
     WHERE d.id=$1 AND p.user_id=$2`,
    [req.params.docId, req.user!.userId]
  );
  if (!result.rows.length) {
    res.status(404).json({ success: false, error: 'Dokumenti nuk u gjet' });
    return;
  }
  const doc = result.rows[0] as Record<string, unknown>;
  if (!doc.is_encrypted || !doc.encryption_iv) {
    res.status(500).json({ success: false, error: 'Gabim në konfigurimin e enkriptimit' });
    return;
  }

  try {
    const decrypted = decryptFile(doc.file_path as string, doc.encryption_iv as string);
    await logAction(req.user!.userId, 'download_document', 'document', doc.id as string, {}, req);
    res.set({
      'Content-Type': doc.mime_type as string || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${doc.original_filename}"`,
      'Content-Length': decrypted.length.toString(),
    });
    res.send(decrypted);
  } catch {
    res.status(500).json({ success: false, error: 'Deshifrimi i skedarit dështoi' });
  }
});

router.delete('/:docId', authenticate, async (req: Request, res: Response) => {
  const result = await query(
    `SELECT d.* FROM documents d
     JOIN properties p ON d.property_id=p.id
     WHERE d.id=$1 AND p.user_id=$2`,
    [req.params.docId, req.user!.userId]
  );
  if (!result.rows.length) {
    res.status(404).json({ success: false, error: 'Dokumenti nuk u gjet' });
    return;
  }
  const doc = result.rows[0] as Record<string, unknown>;
  secureDelete(doc.file_path as string);
  await query('DELETE FROM documents WHERE id=$1', [req.params.docId]);
  await logAction(req.user!.userId, 'delete_document', 'document', req.params.docId, {}, req);
  res.json({ success: true, message: 'Dokumenti u fshi me sukses' });
});

export default router;
