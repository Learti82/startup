import Navbar from './Navbar';
import { t } from '../i18n';
import { ShieldCheck, FlaskConical } from 'lucide-react';
import { IS_DEMO } from '../services/api';

interface Props {
  children: React.ReactNode;
  hideFooter?: boolean;
}

export default function Layout({ children, hideFooter }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {IS_DEMO && (
        <div className="bg-amber-400 text-amber-900 text-xs font-semibold text-center py-1.5 px-4 flex items-center justify-center gap-2">
          <FlaskConical className="w-3.5 h-3.5" />
          DEMO MODE — Të dhënat janë simuluese. Për version të plotë ekzekutoni: docker compose up
        </div>
      )}
      <Navbar />
      <main className="flex-1">{children}</main>
      {!hideFooter && (
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-brand-700 font-semibold">
                <ShieldCheck className="w-5 h-5" />
                <span>PronA</span>
              </div>
              <p className="text-sm text-gray-500 text-center">{t.legalDisclaimer}</p>
              <p className="text-xs text-gray-400">{t.copyrightText}</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
