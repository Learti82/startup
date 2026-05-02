/**
 * Demo API — used when running on GitHub Pages (no backend available).
 * Mirrors the exact same interface as api.ts so the rest of the app
 * doesn't need to know which one is active.
 */
import type { Property, Document, RiskReport, User } from '../types';
import {
  DEMO_USERS, DEMO_PROPERTIES, DEMO_REPORTS, DEMO_ADMIN_STATS,
} from './demoData';

const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

let sessionUser: (User & { password: string }) | null = null;
let sessionProperties: Property[] = [];
let demoDocuments: Record<string, Document[]> = {};
let demoReports: Record<string, RiskReport> = { ...DEMO_REPORTS };
let nextPropId = 10;

function getUser(): User & { password: string } {
  if (!sessionUser) throw new Error('Nuk jeni autentikuar');
  return sessionUser;
}

function makeToken(userId: string) {
  return `demo-token-${userId}-${Date.now()}`;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export const demoAuthApi = {
  register: async (data: {
    email: string; password: string; full_name: string;
    role: string; phone?: string; consent_gdpr: boolean;
  }) => {
    await delay();
    if (DEMO_USERS[data.email]) throw new Error('Email-i është tashmë i regjistruar');
    const newUser: User & { password: string } = {
      id: `demo-user-${Date.now()}`,
      email: data.email,
      full_name: data.full_name,
      role: data.role as User['role'],
      phone: data.phone,
      plan: 'free',
      reports_used: 0,
      reports_limit: 999,
      created_at: new Date().toISOString(),
      password: data.password,
    };
    DEMO_USERS[data.email] = newUser;
    sessionUser = newUser;
    sessionProperties = [];
    return { success: true, data: { token: makeToken(newUser.id), user: newUser } };
  },

  login: async (email: string, password: string) => {
    await delay();
    const user = DEMO_USERS[email];
    if (!user || user.password !== password) {
      throw new Error('Email ose fjalëkalim i gabuar');
    }
    sessionUser = user;
    sessionProperties = email === 'arbeni@demo.ks' || email === 'admin@prona.ks'
      ? [...DEMO_PROPERTIES]
      : [];
    return { success: true, data: { token: makeToken(user.id), user } };
  },
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const demoUserApi = {
  getMe: async (): Promise<User> => {
    await delay(200);
    return getUser();
  },
  updateMe: async (data: { full_name?: string; phone?: string }) => {
    await delay();
    const u = getUser();
    if (data.full_name) u.full_name = data.full_name;
    if (data.phone) u.phone = data.phone;
    return { success: true };
  },
  exportData: async () => {
    await delay();
    return { exported_at: new Date().toISOString(), user: getUser(), properties: sessionProperties, documents: [], reports: [] };
  },
  deleteAccount: async () => {
    await delay();
    sessionUser = null;
    sessionProperties = [];
    return { success: true };
  },
};

// ─── Properties ──────────────────────────────────────────────────────────────
export const demoPropertyApi = {
  list: async () => {
    await delay(400);
    return { success: true, data: sessionProperties, total: sessionProperties.length };
  },
  get: async (id: string) => {
    await delay(300);
    const p = sessionProperties.find((p) => p.id === id);
    if (!p) throw new Error('Prona nuk u gjet');
    return p;
  },
  create: async (data: Partial<Property>) => {
    await delay(500);
    const newProp: Property = {
      id: `demo-prop-new-${nextPropId++}`,
      user_id: getUser().id,
      title: data.title || '',
      address: data.address || '',
      municipality: data.municipality,
      parcel_number: data.parcel_number,
      property_type: data.property_type,
      area_sqm: data.area_sqm,
      asking_price_eur: data.asking_price_eur,
      seller_name: data.seller_name,
      developer_name: data.developer_name,
      notes: data.notes,
      status: 'pending',
      doc_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    sessionProperties = [newProp, ...sessionProperties];
    return newProp;
  },
  update: async (id: string, data: Partial<Property>) => {
    await delay();
    sessionProperties = sessionProperties.map((p) =>
      p.id === id ? { ...p, ...data, updated_at: new Date().toISOString() } : p
    );
    return { success: true };
  },
  delete: async (id: string) => {
    await delay();
    sessionProperties = sessionProperties.filter((p) => p.id !== id);
    delete demoDocuments[id];
    delete demoReports[id];
    return { success: true };
  },
};

// ─── Documents ───────────────────────────────────────────────────────────────
let nextDocId = 1;
export const demoDocumentApi = {
  list: async (propertyId: string): Promise<Document[]> => {
    await delay(300);
    return demoDocuments[propertyId] || [];
  },
  upload: async (
    propertyId: string,
    file: File,
    documentType: string,
    onProgress?: (p: number) => void
  ): Promise<Document> => {
    // Simulate upload progress
    for (const pct of [20, 50, 80, 100]) {
      await delay(200);
      onProgress?.(pct);
    }
    const doc: Document = {
      id: `demo-doc-${nextDocId++}`,
      property_id: propertyId,
      document_type: documentType,
      original_filename: file.name,
      file_size_bytes: file.size,
      mime_type: file.type,
      ocr_status: 'complete',
      upload_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    demoDocuments[propertyId] = [...(demoDocuments[propertyId] || []), doc];
    sessionProperties = sessionProperties.map((p) =>
      p.id === propertyId ? { ...p, doc_count: (p.doc_count || 0) + 1, status: 'pending' } : p
    );
    return doc;
  },
  delete: async (propertyId: string, docId: string) => {
    await delay();
    demoDocuments[propertyId] = (demoDocuments[propertyId] || []).filter((d) => d.id !== docId);
    sessionProperties = sessionProperties.map((p) =>
      p.id === propertyId ? { ...p, doc_count: Math.max(0, (p.doc_count || 1) - 1) } : p
    );
    return { success: true };
  },
  download: (_propertyId: string, _docId: string) => '#',
};

// ─── Reports ─────────────────────────────────────────────────────────────────
export const demoReportApi = {
  analyze: async (propertyId: string) => {
    await delay(1800); // feel like real AI
    const docs = demoDocuments[propertyId] || [];
    const score = Math.min(40 + docs.length * 15, 95);
    const status = score >= 70 ? 'green' : score >= 40 ? 'yellow' : 'red';
    const report: RiskReport = {
      id: `demo-report-new-${propertyId}`,
      property_id: propertyId,
      overall_score: score,
      overall_status: status as RiskReport['overall_status'],
      cadastral_status: docs.length >= 1 ? 'green' : 'red',
      permit_status: docs.length >= 2 ? 'green' : 'yellow',
      ownership_status: docs.length >= 3 ? 'green' : 'yellow',
      mortgage_status: 'green',
      developer_status: 'yellow',
      ai_summary: docs.length === 0
        ? 'Asnjë dokument nuk është ngarkuar. Ngarkoni të paktën ekstraktin kadastral dhe lejen e ndërtimit.'
        : `${docs.length} dokument(e) u analizuan. Rezultati i pranisë: ${score}%. Rekomandohet verifikim nga noteri para nënshkrimit.`,
      questions_for_seller: [
        'A ka leje ndërtimi dhe leje përdorimi kjo pronë?',
        'A janë paguar të gjitha faturat dhe taksat?',
        'A ka hipotekë ose barrë aktive?',
      ],
      questions_for_notary: [
        'A konfirmon ekstrakti kadastral pronësinë e shitësit?',
        'A ka vendime gjyqësore aktive mbi këtë pronë?',
      ],
      missing_documents: docs.length < 3
        ? ['Ekstrakt Kadastral', 'Leje Ndërtimi', 'Kontratë Pronësie'].slice(docs.length)
        : [],
      disclaimer: 'PARALAJMËRIM LIGJOR: Ky raport është informativ dhe nuk përbën këshillë ligjore.',
      version: 1,
      risk_items: docs.length < 2
        ? [{
            id: 'ri-demo-1', report_id: `demo-report-new-${propertyId}`,
            category: 'cadastral', severity: 'yellow' as const,
            title: 'Dokumente të Kufizuara',
            description: 'Numër i vogël dokumentesh të ngarkuara. Analiza mund të jetë jo e plotë.',
            recommendation: 'Ngarkoni të paktën 3-4 dokumente për analizë të plotë.',
            is_resolved: false, created_at: new Date().toISOString(),
          }]
        : [{
            id: 'ri-demo-2', report_id: `demo-report-new-${propertyId}`,
            category: 'compliance', severity: 'info' as const,
            title: 'Verifikim Final i Rekomanduar',
            description: 'Dokumentet janë prezente. Vizitoni AKK për konfirmim final.',
            recommendation: 'Verifikoni të dhënat online në kk.rks-gov.net',
            is_resolved: false, created_at: new Date().toISOString(),
          }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    demoReports[propertyId] = report;
    sessionProperties = sessionProperties.map((p) =>
      p.id === propertyId
        ? { ...p, status: 'complete', overall_status: report.overall_status, overall_score: score }
        : p
    );
    return { success: true, data: { report_id: report.id } };
  },

  get: async (propertyId: string): Promise<RiskReport | undefined> => {
    await delay(300);
    return demoReports[propertyId];
  },
};

// ─── Admin ───────────────────────────────────────────────────────────────────
export const demoAdminApi = {
  getStats: async () => { await delay(400); return DEMO_ADMIN_STATS; },
  getUsers: async () => ({
    success: true,
    data: Object.values(DEMO_USERS).map(({ password: _pw, ...u }) => u),
    total: Object.keys(DEMO_USERS).length,
  }),
  toggleUserActive: async () => ({ success: true }),
  getReports: async () => ({ success: true, data: [] }),
  getAuditLogs: async () => ({
    success: true,
    data: [
      { id: '1', action: 'login', full_name: 'Arben Gashi', email: 'arbeni@demo.ks', resource_type: 'user', created_at: new Date().toISOString() },
      { id: '2', action: 'generate_report', full_name: 'Arben Gashi', email: 'arbeni@demo.ks', resource_type: 'report', created_at: new Date().toISOString() },
    ],
  }),
};
