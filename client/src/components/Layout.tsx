import Navbar from './Navbar';
import { t } from '../i18n';
import { ShieldCheck } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  hideFooter?: boolean;
}

export default function Layout({ children, hideFooter }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
