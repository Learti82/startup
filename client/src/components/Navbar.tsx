import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ShieldCheck, LogOut, User, LayoutDashboard, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) =>
    location.pathname === path ? 'text-brand-600 font-semibold' : 'text-gray-600 hover:text-brand-600';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-brand-700 text-xl">
            <ShieldCheck className="w-7 h-7" />
            <span>PronA</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {!user ? (
              <>
                <Link to="/pricing" className={`${isActive('/pricing')} transition-colors`}>{t.pricing}</Link>
                <Link to="/login" className="text-gray-600 hover:text-brand-600 transition-colors">{t.login}</Link>
                <Link to="/register" className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors font-medium">
                  {t.register}
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className={`${isActive('/dashboard')} transition-colors`}>{t.dashboard}</Link>
                <Link to="/properties/new" className={`${isActive('/properties/new')} transition-colors`}>{t.newProperty}</Link>
                <Link to="/pricing" className={`${isActive('/pricing')} transition-colors`}>{t.pricing}</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className={`${isActive('/admin')} transition-colors`}>{t.admin}</Link>
                )}
                <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200">
                  <Link to="/profile" className="flex items-center gap-1.5 text-gray-600 hover:text-brand-600 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                      <span className="text-brand-700 font-semibold text-sm">
                        {user.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{user.full_name.split(' ')[0]}</span>
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors text-sm">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-brand-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-3">
            {!user ? (
              <>
                <Link to="/pricing" className="block px-2 py-2 text-gray-600" onClick={() => setMenuOpen(false)}>{t.pricing}</Link>
                <Link to="/login" className="block px-2 py-2 text-gray-600" onClick={() => setMenuOpen(false)}>{t.login}</Link>
                <Link to="/register" className="block px-2 py-2 bg-brand-600 text-white rounded-lg text-center" onClick={() => setMenuOpen(false)}>{t.register}</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="flex items-center gap-2 px-2 py-2 text-gray-600" onClick={() => setMenuOpen(false)}>
                  <LayoutDashboard className="w-4 h-4" />{t.dashboard}
                </Link>
                <Link to="/properties/new" className="flex items-center gap-2 px-2 py-2 text-gray-600" onClick={() => setMenuOpen(false)}>
                  <Plus className="w-4 h-4" />{t.newProperty}
                </Link>
                <Link to="/profile" className="flex items-center gap-2 px-2 py-2 text-gray-600" onClick={() => setMenuOpen(false)}>
                  <User className="w-4 h-4" />{t.profile}
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="block px-2 py-2 text-gray-600" onClick={() => setMenuOpen(false)}>{t.admin}</Link>
                )}
                <button onClick={handleLogout} className="flex items-center gap-2 px-2 py-2 text-red-600 w-full">
                  <LogOut className="w-4 h-4" />{t.logout}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
