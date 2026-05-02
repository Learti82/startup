-- PronA Analyzer — Seed / Demo Data
-- Passwords are bcrypt hashes of: Admin@2024!, Buyer@2024!, Lawyer@2024!

-- ─────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────
INSERT INTO users (id, email, password_hash, full_name, role, phone, consent_gdpr, consent_date) VALUES
  ('00000000-0000-0000-0000-000000000001',
   'admin@prona.ks',
   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uOeq',
   'Admin PronA',
   'admin', '+383 44 111 222', true, NOW()),

  ('00000000-0000-0000-0000-000000000002',
   'arbeni@demo.ks',
   '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC4J0e12WgNRBB.fG5va',
   'Arben Gashi',
   'buyer', '+383 44 222 333', true, NOW()),

  ('00000000-0000-0000-0000-000000000003',
   'avokati@demo.ks',
   '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC4J0e12WgNRBB.fG5va',
   'Blerta Krasniqi',
   'lawyer', '+383 45 333 444', true, NOW()),

  ('00000000-0000-0000-0000-000000000004',
   'banka@demo.ks',
   '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC4J0e12WgNRBB.fG5va',
   'Valon Berisha – Pro Credit Bank',
   'bank', '+383 38 555 666', true, NOW());

-- ─────────────────────────────────────────────
-- SUBSCRIPTIONS
-- ─────────────────────────────────────────────
INSERT INTO subscriptions (user_id, plan, status, reports_limit, price_eur) VALUES
  ('00000000-0000-0000-0000-000000000001', 'enterprise', 'active', 9999, 0),
  ('00000000-0000-0000-0000-000000000002', 'free', 'active', 1, 0),
  ('00000000-0000-0000-0000-000000000003', 'professional', 'active', 50, 99),
  ('00000000-0000-0000-0000-000000000004', 'enterprise', 'active', 500, 299);

-- ─────────────────────────────────────────────
-- DEMO PROPERTIES
-- ─────────────────────────────────────────────
INSERT INTO properties (id, user_id, title, address, municipality, parcel_number, property_type, area_sqm, asking_price_eur, seller_name, developer_name, status, coordinates_lat, coordinates_lng) VALUES

  ('10000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000002',
   'Apartament 2+1 — Rruga Fehmi Agani, Prishtinë',
   'Rruga Fehmi Agani Nr.45, Kati 3, Ap.12, Prishtinë',
   'Prishtinë', 'P-10234-22', 'apartment', 72.5, 89000,
   'Shpend Morina', 'Graniti Invest SH.P.K.',
   'complete', 42.6629, 21.1655),

  ('10000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000002',
   'Shtëpi me Parcelë — Fushë Kosovë',
   'Rr. Dardania Nr.8, Fushë Kosovë',
   'Fushë Kosovë', 'FK-5521-01', 'house', 180.0, 65000,
   'Agim Ramadani', NULL,
   'pending', 42.6500, 21.0900),

  ('10000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000002',
   'Parcelë Toke — Gjilan',
   'Fshati Bresalc, Gjilan',
   'Gjilan', 'GJ-8834-15', 'land', 500.0, 28000,
   'Fatmire Osmani', NULL,
   'complete', 42.4638, 21.4692);

-- ─────────────────────────────────────────────
-- DEMO RISK REPORTS (for complete properties)
-- ─────────────────────────────────────────────
INSERT INTO risk_reports (id, property_id, overall_score, overall_status, cadastral_status, permit_status, ownership_status, mortgage_status, developer_status, ai_summary, questions_for_seller, questions_for_notary, missing_documents) VALUES

  ('20000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001',
   72, 'green', 'green', 'yellow', 'green', 'green', 'yellow',
   'Dokumentet kryesore janë prezente dhe konsistente. Ekstrakt kadastral konfirmon pronësinë. Leja e ndërtimit është e vlefshme por mungon leja e përdorimit (kolaudimi). Zhvilluesi ka 2 projekte të suksesshme në Prishtinë.',
   ARRAY[
     'A ka leje përdorimi (kolaudim) ky apartament?',
     'A janë paguar të gjitha faturat e komunaleve?',
     'A ka ndonjë modifikim pas lejes së ndërtimit?'
   ],
   ARRAY[
     'A konfirmon ekstrakt kadastral numrin e parcelës P-10234-22?',
     'A ka barrë ose hipotekë aktive mbi këtë pronë?',
     'A ka procedura trashëgimie të hapur?'
   ],
   ARRAY['Leje Përdorimi (Kolaudim)']),

  ('20000000-0000-0000-0000-000000000002',
   '10000000-0000-0000-0000-000000000003',
   35, 'red', 'yellow', 'red', 'red', 'yellow', 'green',
   'Mungojnë dokumente kritike. Nuk ka leje ndërtimi dhe kontrata e pronësisë ka mospërputhje me numrin e parcelës. Kërkohet verifikim urgjent para çdo pagese.',
   ARRAY[
     'Cili është numri i saktë i parcelës sipas AKK?',
     'A ka ndonjë mosmarrëveshje mbi kufijtë e parcelës?',
     'A ekziston ndonjë vendim gjyqësor për këtë tokë?',
     'A janë paguar të gjitha taksat e pronës?'
   ],
   ARRAY[
     'A konfirmon dokumentacioni se shitësi është pronari i vetëm?',
     'A ka vendime gjyqësore mbi këtë parcelë?',
     'A ka procedura eksproprijimi nga shteti?'
   ],
   ARRAY['Leje Ndërtimi', 'Kontratë Pronësie', 'Certifikatë Hipoteke']);

-- ─────────────────────────────────────────────
-- DEMO RISK ITEMS
-- ─────────────────────────────────────────────
INSERT INTO risk_items (report_id, category, severity, title, description, recommendation) VALUES

  -- Report 1 (green overall)
  ('20000000-0000-0000-0000-000000000001',
   'permits', 'yellow',
   'Leje Përdorimi (Kolaudim) Mungon',
   'Leja e ndërtimit është prezente dhe e vlefshme, por dokumenti i kolaudimit nuk është ngarkuar. Ndërtesa mund të mos jetë inspektuar zyrtarisht.',
   'Kërkoni dokumentin e kolaudimit nga zhvilluesi ose komuna e Prishtinës.'),

  ('20000000-0000-0000-0000-000000000001',
   'developer', 'yellow',
   'Profil i Kufizuar i Zhvilluesit',
   'Graniti Invest SH.P.K. ka 2 projekte të regjistruara por vetëm 1 të përfunduar. Kompania është e re në treg (2020).',
   'Kontrolloni historikun e plotë të kompanisë në regjistrin tregtar: arbk.rks-gov.net'),

  ('20000000-0000-0000-0000-000000000001',
   'compliance', 'info',
   'Verifikim Final i Rekomanduar',
   'Gjithçka duket në rregull. Rekomandohet vizita fizike në AKK për konfirmim final.',
   'Vizitoni AKK online ose zyren komunale para nënshkrimit të kontratës finale.'),

  -- Report 2 (red overall)
  ('20000000-0000-0000-0000-000000000002',
   'permits', 'red',
   'Leje Ndërtimi Mungon Plotësisht',
   'Nuk ka asnjë leje ndërtimi të ngarkuar. Toka mund të jetë pa leje ndërtimi të vlefshme ose ndërtimi mund të jetë ilegal.',
   'MOS procedoni me blerjen pa siguruar dokumentin e lejes të ndërtimit nga komuna e Gjilanit.'),

  ('20000000-0000-0000-0000-000000000002',
   'ownership', 'red',
   'Mospërputhje në Numrin e Parcelës',
   'Numri i parcelës në dokumentet e ngarkuara (GJ-8834-15) nuk përputhet me numrin në kontratën e shitblerjes. Kjo tregon rrezik të lartë mashtrimesh.',
   'Verifikoni numrin e saktë të parcelës direkt me AKK dhe sigurohuni që kontrata e re të ketë numrin e saktë.'),

  ('20000000-0000-0000-0000-000000000002',
   'cadastral', 'yellow',
   'Ekstrakt Kadastral i Vjetëruar',
   'Ekstrakt kadastral i ngarkuar është mbi 6 muaj i vjetër. Të dhënat mund të jenë ndryshuar.',
   'Kërkoni ekstrakt kadastral të ri (jo më të vjetër se 30 ditë) para çdo pagese.');

-- ─────────────────────────────────────────────
-- DEVELOPER PROFILES (mock database)
-- ─────────────────────────────────────────────
INSERT INTO developer_profiles (name, registration_number, municipality, risk_score, completed_projects, pending_projects, legal_issues_count, notes, source) VALUES
  ('Graniti Invest SH.P.K.', 'K-70123456', 'Prishtinë', 25, 2, 1, 0, 'Ndërtues i ri, projektet e para janë duke u bërë. Asnjë çështje ligjore e regjistruar.', 'mock'),
  ('Alkos Construction', 'K-70234567', 'Prizren', 15, 8, 2, 0, 'Ndërtues me reputacion të mirë në Prizren. 8 projekte të suksesshme.', 'mock'),
  ('Unitex Group', 'K-70345678', 'Prishtinë', 60, 3, 4, 2, 'Dy çështje gjyqësore aktive lidhur me garancinë e ndërtimit. Kujdes i shtuar.', 'mock'),
  ('ABC Invest', 'K-70456789', 'Mitrovicë', 80, 1, 6, 3, 'Tre çështje gjyqësore aktive. Projekt i pabërë plot 2 vjet. Rrezik i lartë.', 'mock'),
  ('Kosova Bau GmbH', 'K-70567890', 'Gjakovë', 10, 12, 1, 0, 'Kompani me kapital gjerman, reputacion shumë i mirë, 12 projekte të suksesshme.', 'mock'),
  ('Meridian Homes', 'K-70678901', 'Ferizaj', 45, 4, 3, 1, 'Një çështje gjyqësore të mbyllur lidhur me vonesën e dorëzimit.', 'mock'),
  ('Premier Property', 'K-70789012', 'Gjilan', 30, 5, 2, 0, 'Kompani me historik solid, fokus në apartamente luksoze.', 'mock');

-- ─────────────────────────────────────────────
-- AUDIT LOG SAMPLES
-- ─────────────────────────────────────────────
INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata) VALUES
  ('00000000-0000-0000-0000-000000000002', 'register', 'user', '00000000-0000-0000-0000-000000000002', '{"role":"buyer"}'),
  ('00000000-0000-0000-0000-000000000002', 'login', 'user', '00000000-0000-0000-0000-000000000002', '{}'),
  ('00000000-0000-0000-0000-000000000002', 'create_property', 'property', '10000000-0000-0000-0000-000000000001', '{"title":"Apartament 2+1"}'),
  ('00000000-0000-0000-0000-000000000002', 'generate_report', 'report', '20000000-0000-0000-0000-000000000001', '{}');
