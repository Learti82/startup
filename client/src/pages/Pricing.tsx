import { Link } from 'react-router-dom';
import { Check, Zap } from 'lucide-react';
import Layout from '../components/Layout';
import { t } from '../i18n';
import { useAuth } from '../context/AuthContext';

const PLANS = [
  { key: 'free', color: 'border-gray-200', highlight: false },
  { key: 'basic', color: 'border-gray-200', highlight: false },
  { key: 'professional', color: 'border-brand-400', highlight: true },
  { key: 'enterprise', color: 'border-gray-200', highlight: false },
] as const;

export default function Pricing() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t.pricingTitle}</h1>
          <p className="text-xl text-gray-500">{t.pricingSubtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {PLANS.map(({ key, highlight }) => {
            const plan = t.plans[key];
            const isCurrentPlan = user?.plan === key;
            return (
              <div
                key={key}
                className={`relative bg-white rounded-2xl border-2 p-6 flex flex-col ${
                  highlight ? 'border-brand-500 shadow-xl shadow-brand-100' : 'border-gray-200'
                }`}
              >
                {highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-brand-600 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                      {t.mostPopular}
                    </span>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                      {t.currentPlan}
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-sm text-gray-400">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {user ? (
                  isCurrentPlan ? (
                    <button disabled className="w-full py-3 rounded-xl bg-gray-100 text-gray-400 font-semibold text-sm cursor-default">
                      {t.currentPlan}
                    </button>
                  ) : (
                    <button className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
                      highlight
                        ? 'bg-brand-600 text-white hover:bg-brand-700'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}>
                      {key === 'enterprise' ? 'Na Kontaktoni' : t.choosePlan}
                    </button>
                  )
                ) : (
                  <Link
                    to="/register"
                    className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                      highlight
                        ? 'bg-brand-600 text-white hover:bg-brand-700'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {key === 'free' ? 'Fillo Falas' : key === 'enterprise' ? 'Na Kontaktoni' : t.choosePlan}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Pyetje të Shpeshta</h2>
          <div className="space-y-6">
            {[
              {
                q: 'A është PronA zëvendësim për avokatin?',
                a: 'Jo. PronA është mjet ndihmës për identifikimin e rreziqeve dhe dokumenteve të munguara. Gjithmonë konsultohuni me avokat ose noter të licencuar para nënshkrimit.'
              },
              {
                q: 'Si sigurohen dokumentet e mia?',
                a: 'Të gjitha dokumentet enkriptohen me AES-256 para ruajtjes. Ju mund të fshini llogarinë dhe të gjitha të dhënat tuaja në çdo moment.'
              },
              {
                q: 'A mund të integrohet me sistemet e bankës?',
                a: 'Po. Plani Enterprise ofron API akses dhe integrim të personalizuar me sistemet e bankës dhe institucioneve financiare.'
              },
              {
                q: 'Sa kohë duhet për të gjeneruar raportin?',
                a: 'Raporti AI gjenerohet brenda 30-60 sekondash pasi ngarkohen dokumentet.'
              },
            ].map((item) => (
              <div key={item.q} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex gap-3">
                  <Zap className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">{item.q}</p>
                    <p className="text-sm text-gray-600">{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">{t.legalDisclaimer}</p>
        </div>
      </div>
    </Layout>
  );
}
