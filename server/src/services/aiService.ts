import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import { RiskLevel } from '../types';

interface AIAnalysisInput {
  propertyAddress: string;
  parcelNumber?: string;
  municipality?: string;
  sellerName?: string;
  developerName?: string;
  documentTypes: string[];
  ocrTexts: Array<{ type: string; text: string }>;
  missingDocuments: string[];
  presenceScore: number;
}

export interface AIAnalysisResult {
  consistencyScore: number;
  cadastralStatus: RiskLevel;
  permitStatus: RiskLevel;
  ownershipStatus: RiskLevel;
  mortgageStatus: RiskLevel;
  developerStatus: RiskLevel;
  summary: string;
  questionsForSeller: string[];
  questionsForNotary: string[];
  riskItems: Array<{
    category: string;
    severity: RiskLevel | 'info';
    title: string;
    description: string;
    recommendation: string;
  }>;
}

const MOCK_ANALYSES: Record<string, AIAnalysisResult> = {
  low_docs: {
    consistencyScore: 25,
    cadastralStatus: 'red',
    permitStatus: 'red',
    ownershipStatus: 'red',
    mortgageStatus: 'yellow',
    developerStatus: 'yellow',
    summary: 'Skedarët e ngarkuar janë të pamjaftueshëm për të bërë një analizë të plotë. Mungojnë dokumente kyçe si ekstrakt kadastral, leje ndërtimi dhe kontratë pronësie.',
    questionsForSeller: [
      'A mund të siguroni ekstraktin kadastral nga Agjencia Kadastrale e Kosovës (AKK)?',
      'A ka leje ndërtimi të vlefshme kjo pronë? Kur është lëshuar dhe nga cila komunë?',
      'A ka hipotekë ose barrë tjetër mbi këtë pronë?',
      'Kush e ka ndërtuar këtë objekt dhe a janë paguar të gjitha detyrimet ndaj ndërtuesit?',
      'A ka ndonjë mosmarrëveshje gjyqësore mbi këtë pronë?',
    ],
    questionsForNotary: [
      'A është prona e lirë nga çdo hipotekë ose barrë?',
      'A konfirmon ekstrakti kadastral se shitësi është pronari i regjistruar?',
      'A ka vendime gjyqësore që kufizojnë shitjen e kësaj prone?',
      'A janë paguar të gjitha taksat e pronës deri në datën e sotme?',
    ],
    riskItems: [
      {
        category: 'cadastral',
        severity: 'red',
        title: 'Ekstrakt Kadastral Mungon',
        description: 'Ekstrakt kadastral nuk është ngarkuar. Pa këtë dokument, nuk mund të verifikohet pronësia ligjore.',
        recommendation: 'Kërkoni ekstrakt kadastral nga AKK (Agjencia Kadastrale e Kosovës) ose nga zyra komunale kadastrale.',
      },
      {
        category: 'permits',
        severity: 'red',
        title: 'Leje Ndërtimi Mungon',
        description: 'Nuk është ngarkuar leje ndërtimi. Ndërtimi pa leje është shkelje e ligjit dhe mund të rezultojë në rrënim.',
        recommendation: 'Kërkoni lejen origjinale të ndërtimit nga komuna. Kontrolloni nëse ndërtimi është legalizuar.',
      },
      {
        category: 'ownership',
        severity: 'red',
        title: 'Kontratë Pronësie Mungon',
        description: 'Nuk ka kontratë pronësie të ngarkuar. Nuk mund të verifikohet zinxhiri i pronësisë.',
        recommendation: 'Kërkoni kontratën e shitblerjes së mëparshme ose aktin e pronësisë nga noteri.',
      },
    ],
  },
  medium_docs: {
    consistencyScore: 60,
    cadastralStatus: 'green',
    permitStatus: 'yellow',
    ownershipStatus: 'green',
    mortgageStatus: 'green',
    developerStatus: 'yellow',
    summary: 'Dokumentet bazë janë prezente. Gjenden disa mospërputhje të vogla që kërkojnë sqarim. Leja e ndërtimit kërkon verifikim të mëtejshëm.',
    questionsForSeller: [
      'A ka leje përdorimi (kolaudim) kjo pronë, veç lejes së ndërtimit?',
      'A janë paguar të gjitha detyrimet ndaj ndërtuesit?',
      'A ka ndonjë modifikim të ndërtesës pas lejes fillestare?',
    ],
    questionsForNotary: [
      'A konfirmon të dhënat e ekstraktit kadastral me numrin e parcelës?',
      'A ka ndonjë procedurë trashëgimie të pafinalizuar mbi këtë pronë?',
    ],
    riskItems: [
      {
        category: 'permits',
        severity: 'yellow',
        title: 'Leje Përdorimi (Kolaudim) Mungon',
        description: 'Leja e ndërtimit është prezente por nuk ka leje përdorimi. Kjo tregon se ndërtesa mund të mos jetë kolauduar zyrtarisht.',
        recommendation: 'Kërkoni lejen e përdorimit nga komuna ose konfirmoni nëse procesi i kolaudimit është duke u zhvilluar.',
      },
      {
        category: 'developer',
        severity: 'yellow',
        title: 'Profil Zhvilluesi i Papërcaktuar',
        description: 'Nuk janë gjetur informacione të mjaftueshme mbi ndërtuesin/zhvilluesin e pronës.',
        recommendation: 'Kontrolloni regjistrin tregtar të ndërtuesit dhe historikun e projekteve të kaluara.',
      },
    ],
  },
  full_docs: {
    consistencyScore: 88,
    cadastralStatus: 'green',
    permitStatus: 'green',
    ownershipStatus: 'green',
    mortgageStatus: 'green',
    developerStatus: 'green',
    summary: 'Dokumentet janë të plota dhe të qëndrueshme. Prona duket e pastër nga perspektiva e dokumentacionit. Rekomandohet verifikim final nga noteri para nënshkrimit.',
    questionsForSeller: [
      'A janë paguar të gjitha faturat e komunaleve deri në datën e sotme?',
      'A ka ndonjë marrëveshje goje me palë të treta lidhur me këtë pronë?',
    ],
    questionsForNotary: [
      'A konfirmoni se të gjitha dokumentet e ngarkuara janë autentike?',
      'A ka ndryshuar pronësia pas datës së ekstraktit kadastral?',
    ],
    riskItems: [
      {
        category: 'compliance',
        severity: 'info',
        title: 'Verifikim Final i Rekomanduar',
        description: 'Të gjitha dokumentet janë prezente dhe konsistente. Rekomandohet verifikim final online ose fizik në AKK.',
        recommendation: 'Vizitoni AKK online (kk.rks-gov.net) ose zyren komunale për konfirmim të fundit para nënshkrimit.',
      },
    ],
  },
};

async function callClaudeAI(input: AIAnalysisInput): Promise<AIAnalysisResult> {
  const client = new Anthropic({ apiKey: env.anthropicApiKey });

  const ocrSummary = input.ocrTexts.length > 0
    ? input.ocrTexts.map((d) => `[${d.type}]: ${d.text.substring(0, 500)}`).join('\n\n')
    : 'Nuk ka tekst të ekstraktuar nga dokumentet.';

  const prompt = `Ti je një analist ligjor i specializuar për pronën e paluajtshme në Kosovë.
Analizo dokumentet e mëposhtme të pronës dhe gjeneroj një raport rreziku.

INFORMACION PËR PRONËN:
- Adresa: ${input.propertyAddress}
- Numri Parcelës: ${input.parcelNumber || 'I papërcaktuar'}
- Komuna: ${input.municipality || 'E papërcaktuar'}
- Emri i Shitësit: ${input.sellerName || 'I papërcaktuar'}
- Emri i Zhvilluesit: ${input.developerName || 'I papërcaktuar'}

DOKUMENTET E NGARKUARA: ${input.documentTypes.join(', ') || 'Asnjë'}
DOKUMENTET QUE MUNGOJNË: ${input.missingDocuments.join(', ') || 'Asnjë'}
REZULTATI I PRANISË SË DOKUMENTEVE: ${input.presenceScore}%

TEKSTI I EKSTRAKTUAR NGA DOKUMENTET (OCR):
${ocrSummary}

Bazuar në analizën tënde, kthe një objekt JSON me strukturën e mëposhtme:
{
  "consistencyScore": number (0-100),
  "cadastralStatus": "red"|"yellow"|"green",
  "permitStatus": "red"|"yellow"|"green",
  "ownershipStatus": "red"|"yellow"|"green",
  "mortgageStatus": "red"|"yellow"|"green",
  "developerStatus": "red"|"yellow"|"green",
  "summary": "string (2-3 fjali në shqip)",
  "questionsForSeller": ["string", ...] (3-5 pyetje),
  "questionsForNotary": ["string", ...] (3-4 pyetje),
  "riskItems": [
    {
      "category": "cadastral"|"permits"|"ownership"|"mortgage"|"developer"|"compliance",
      "severity": "red"|"yellow"|"green"|"info",
      "title": "string",
      "description": "string",
      "recommendation": "string"
    }
  ]
}

Kthe VETËM JSON-in, asnjë tekst tjetër.`;

  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('AI nuk ktheu tekst');

  const jsonText = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(jsonText) as AIAnalysisResult;
}

function getMockAnalysis(input: AIAnalysisInput): AIAnalysisResult {
  const docCount = input.documentTypes.length;
  if (docCount >= 4) return MOCK_ANALYSES.full_docs;
  if (docCount >= 2) return MOCK_ANALYSES.medium_docs;
  return MOCK_ANALYSES.low_docs;
}

export async function runAIAnalysis(input: AIAnalysisInput): Promise<AIAnalysisResult> {
  if (!env.anthropicApiKey) {
    console.log('ANTHROPIC_API_KEY not set — using mock analysis');
    return getMockAnalysis(input);
  }
  try {
    return await callClaudeAI(input);
  } catch (err) {
    console.error('Claude AI analysis failed, falling back to mock:', err);
    return getMockAnalysis(input);
  }
}
