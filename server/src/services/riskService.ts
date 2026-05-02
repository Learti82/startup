import { query } from '../config/database';
import { RiskLevel, DocumentType } from '../types';
import { runAIAnalysis } from './aiService';

const REQUIRED_DOCUMENTS: { type: DocumentType; label: string; weight: number }[] = [
  { type: 'cadastral_extract', label: 'Ekstrakt Kadastral', weight: 30 },
  { type: 'construction_permit', label: 'Leje Ndërtimi', weight: 25 },
  { type: 'ownership_contract', label: 'Kontratë Pronësie / Shitblerjeje', weight: 25 },
  { type: 'mortgage_certificate', label: 'Certifikatë për Hipotekë', weight: 10 },
  { type: 'use_permit', label: 'Leje Përdorimi', weight: 10 },
];

function scoreToStatus(score: number): RiskLevel {
  if (score >= 70) return 'green';
  if (score >= 40) return 'yellow';
  return 'red';
}

export async function generateReport(propertyId: string, userId: string): Promise<string> {
  const property = await query(
    'SELECT * FROM properties WHERE id = $1 AND user_id = $2',
    [propertyId, userId]
  );
  if (!property.rows.length) throw new Error('Prona nuk u gjet');

  const prop = property.rows[0] as Record<string, unknown>;

  const docs = await query(
    'SELECT * FROM documents WHERE property_id = $1',
    [propertyId]
  );
  const documents = docs.rows as Array<Record<string, unknown>>;

  const existingDocTypes = new Set(documents.map((d) => d.document_type as string));

  const missingDocuments: string[] = REQUIRED_DOCUMENTS
    .filter((rd) => !existingDocTypes.has(rd.type))
    .map((rd) => rd.label);

  let baseScore = 0;
  let maxScore = 0;
  for (const rd of REQUIRED_DOCUMENTS) {
    maxScore += rd.weight;
    if (existingDocTypes.has(rd.type)) baseScore += rd.weight;
  }

  const presenceScore = maxScore > 0 ? Math.round((baseScore / maxScore) * 100) : 0;

  const ocrTexts = documents
    .filter((d) => d.ocr_text)
    .map((d) => ({ type: d.document_type as string, text: d.ocr_text as string }));

  const aiResult = await runAIAnalysis({
    propertyAddress: prop.address as string,
    parcelNumber: prop.parcel_number as string | undefined,
    municipality: prop.municipality as string | undefined,
    sellerName: prop.seller_name as string | undefined,
    developerName: prop.developer_name as string | undefined,
    documentTypes: Array.from(existingDocTypes),
    ocrTexts,
    missingDocuments,
    presenceScore,
  });

  const overallScore = Math.round((presenceScore * 0.4) + (aiResult.consistencyScore * 0.6));
  const overallStatus = scoreToStatus(overallScore);

  const existingReport = await query(
    'SELECT id FROM risk_reports WHERE property_id = $1',
    [propertyId]
  );

  let reportId: string;
  if (existingReport.rows.length) {
    const existing = existingReport.rows[0] as Record<string, unknown>;
    reportId = existing.id as string;
    const currentVersion = existing.version as number || 1;
    await query(
      `UPDATE risk_reports SET
        overall_score=$1, overall_status=$2,
        cadastral_status=$3, permit_status=$4, ownership_status=$5,
        mortgage_status=$6, developer_status=$7,
        ai_summary=$8, questions_for_seller=$9, questions_for_notary=$10,
        missing_documents=$11, version=$12, updated_at=NOW()
       WHERE id=$13`,
      [
        overallScore, overallStatus,
        aiResult.cadastralStatus, aiResult.permitStatus,
        aiResult.ownershipStatus, aiResult.mortgageStatus,
        aiResult.developerStatus,
        aiResult.summary,
        aiResult.questionsForSeller,
        aiResult.questionsForNotary,
        missingDocuments,
        currentVersion + 1,
        reportId,
      ]
    );
    await query('DELETE FROM risk_items WHERE report_id = $1', [reportId]);
  } else {
    const inserted = await query(
      `INSERT INTO risk_reports
        (property_id, overall_score, overall_status, cadastral_status, permit_status,
         ownership_status, mortgage_status, developer_status, ai_summary,
         questions_for_seller, questions_for_notary, missing_documents, disclaimer)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING id`,
      [
        propertyId, overallScore, overallStatus,
        aiResult.cadastralStatus, aiResult.permitStatus,
        aiResult.ownershipStatus, aiResult.mortgageStatus,
        aiResult.developerStatus, aiResult.summary,
        aiResult.questionsForSeller, aiResult.questionsForNotary,
        missingDocuments,
        'PARALAJMËRIM LIGJOR: Ky raport është informativ dhe nuk përbën këshillë ligjore. Konsultohuni me noter ose avokat të licencuar para çdo transaksioni.'
      ]
    );
    reportId = (inserted.rows[0] as Record<string, unknown>).id as string;
  }

  for (const item of aiResult.riskItems) {
    await query(
      `INSERT INTO risk_items (report_id, category, severity, title, description, recommendation)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [reportId, item.category, item.severity, item.title, item.description, item.recommendation]
    );
  }

  await query(
    "UPDATE properties SET status='complete', updated_at=NOW() WHERE id=$1",
    [propertyId]
  );

  return reportId;
}

export async function getFullReport(propertyId: string) {
  const report = await query(
    'SELECT * FROM risk_reports WHERE property_id = $1 ORDER BY version DESC LIMIT 1',
    [propertyId]
  );
  if (!report.rows.length) return null;

  const rep = report.rows[0] as Record<string, unknown>;
  const items = await query(
    'SELECT * FROM risk_items WHERE report_id = $1 ORDER BY severity, category',
    [rep.id]
  );

  return { ...rep, risk_items: items.rows };
}
