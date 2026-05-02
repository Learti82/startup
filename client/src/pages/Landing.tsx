import { Link } from 'react-router-dom';
import { ShieldCheck, FileSearch, AlertTriangle, CheckCircle, ChevronRight, Star, Building2, Scale, Landmark } from 'lucide-react';
import Layout from '../components/Layout';
import { t } from '../i18n';

const featureIcons = [
  <FileSearch className="w-6 h-6" />,
  <Building2 className="w-6 h-6" />,
  <Scale className="w-6 h-6" />,
  <Landmark className="w-6 h-6" />,
  <ShieldCheck className="w-6 h-6" />,
  <CheckCircle className="w-6 h-6" />,
];

export default function Landing() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
              <AlertTriangle className="w-4 h-4 text-amber-300" />
              <span>60% e transaksioneve kanë probleme dokumentacioni</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              {t.heroTitle}
            </h1>
            <p className="text-xl text-brand-100 mb-8 leading-relaxed max-w-2xl">
              {t.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-brand-50 transition-colors shadow-lg"
              >
                {t.heroCtaMain}
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-colors"
              >
                {t.heroCtaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '2,400+', label: 'Prona të Analizuara' },
              { value: '€4.2M', label: 'Vlera e Mbrojtur' },
              { value: '340+', label: 'Blerës të Kënaqur' },
              { value: '96%', label: 'Saktësi Raporti' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-brand-700">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">{t.howItWorks}</h2>
            <p className="text-gray-500 mt-3 text-lg">Tre hapa të thjeshtë për pronë të sigurt</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {t.steps.map((step, i) => (
              <div key={i} className="relative">
                {i < t.steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-brand-100 z-0" style={{ width: 'calc(100% - 2rem)' }} />
                )}
                <div className="bg-white rounded-2xl p-8 border border-gray-200 relative z-10 text-center">
                  <div className="w-14 h-14 rounded-full bg-brand-600 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">
                    {i + 1}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">{t.featuresTitle}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.features.map((feature, i) => (
              <div key={i} className="flex gap-4 p-6 rounded-xl border border-gray-100 hover:border-brand-200 hover:shadow-sm transition-all">
                <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                  {featureIcons[i]}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Çfarë thonë përdoruesit tanë</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {t.testimonials.map((testimonial, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <p className="text-sm font-semibold text-gray-900">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-700 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-brand-200" />
          <h2 className="text-3xl font-bold mb-4">Filloni Falas Sot</h2>
          <p className="text-brand-200 text-lg mb-8">
            Një raport falas për pronën tuaj të parë. Asnjë kartë krediti e nevojshme.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-brand-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-brand-50 transition-colors"
          >
            Krijo Llogari Falas
            <ChevronRight className="w-5 h-5" />
          </Link>
          <p className="text-brand-300 text-sm mt-4">{t.legalDisclaimer}</p>
        </div>
      </section>
    </Layout>
  );
}
