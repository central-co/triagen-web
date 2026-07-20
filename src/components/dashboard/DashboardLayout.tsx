import { useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Settings,
  Menu,
  X,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import useDarkMode from '../../hooks/useDarkMode';

const NAV_ITEMS = [
  { label: 'Visão Geral', path: '/dashboard' },
  { label: 'Vagas', path: '/dashboard/jobs' },
  { label: 'Candidatos', path: '/dashboard/candidates' },
  { label: 'Relatórios', path: '/dashboard/reports' },
];

function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const { darkMode } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActivePath = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-triagen-neutral text-triagen-primary'}`}>

      {/* Top Navigation Bar */}
      <header className={`sticky top-0 z-50 border-b flex h-16 items-center px-6 md:px-12 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-triagen-border-light'}`}>
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">

          {/* Left: Logo & Nav Links */}
          <div className="flex items-center gap-10">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xl font-heading font-semibold tracking-tight"
            >
              TriaGen<span className="text-triagen-secondary-green">.</span>
            </button>

            <nav className="hidden md:flex items-center gap-8" aria-label="Navegação principal">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  aria-current={isActivePath(item.path) ? 'page' : undefined}
                  className={`text-[0.95rem] font-medium transition-colors border-b-2 pb-1 -mb-[3px] ${
                    isActivePath(item.path)
                      ? (darkMode ? 'text-gray-100 border-gray-100' : 'text-triagen-primary border-triagen-primary')
                      : (darkMode ? 'text-gray-500 border-transparent hover:text-gray-300' : 'text-triagen-secondary border-transparent hover:text-triagen-primary')
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard/settings')}
              title="Configurações"
              aria-label="Configurações"
              className={`p-1.5 rounded transition-colors hidden sm:block ${
                location.pathname.startsWith('/dashboard/settings')
                  ? (darkMode ? 'text-gray-100' : 'text-triagen-primary')
                  : (darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-triagen-secondary hover:text-triagen-primary')
              }`}
            >
              <Settings strokeWidth={1.5} className="w-5 h-5" />
            </button>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(prev => !prev)}
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                aria-label="Menu do usuário"
                className={`h-9 w-9 rounded-full flex items-center justify-center border transition-colors ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
                    : 'bg-neutral-100 border-triagen-border-light text-triagen-secondary hover:border-neutral-300'
                }`}
              >
                <UserIcon strokeWidth={1.5} className="w-4 h-4" />
              </button>

              {userMenuOpen && (
                <div className={`absolute right-0 mt-2 w-60 rounded border shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-triagen-border-light'}`}>
                  <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-neutral-100'}`}>
                    <p className={`text-[0.65rem] uppercase tracking-widest font-semibold mb-0.5 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>
                      Conectado como
                    </p>
                    <p className={`text-sm font-medium truncate ${darkMode ? 'text-gray-200' : 'text-triagen-primary'}`}>
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/dashboard/settings')}
                    className={`w-full text-left px-4 py-3 text-sm flex items-center gap-2 transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-700/60' : 'text-triagen-primary hover:bg-neutral-50'}`}
                  >
                    <Settings className="w-4 h-4" /> Configurações
                  </button>
                  <button
                    onClick={handleSignOut}
                    className={`w-full text-left px-4 py-3 text-sm flex items-center gap-2 transition-colors ${darkMode ? 'text-red-400 hover:bg-gray-700/60' : 'text-red-600 hover:bg-neutral-50'}`}
                  >
                    <LogOut className="w-4 h-4" /> Sair
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Nav Toggle */}
            <button
              className={`md:hidden p-1 ${darkMode ? 'text-gray-200' : 'text-triagen-primary'}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {mobileMenuOpen ? <X strokeWidth={1.5} className="w-6 h-6" /> : <Menu strokeWidth={1.5} className="w-6 h-6" />}
            </button>

          </div>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      {mobileMenuOpen && (
        <div className={`md:hidden sticky top-16 left-0 w-full border-b shadow-sm z-40 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-triagen-border-light'}`}>
          <nav className="flex flex-col px-6 py-4 gap-1" aria-label="Navegação principal">
            {[...NAV_ITEMS, { label: 'Configurações', path: '/dashboard/settings' }].map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                aria-current={isActivePath(item.path) ? 'page' : undefined}
                className={`text-left text-sm font-medium py-2.5 px-2 rounded transition-colors ${
                  isActivePath(item.path)
                    ? (darkMode ? 'text-white bg-gray-700/50' : 'text-triagen-primary bg-neutral-100')
                    : (darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-triagen-secondary hover:text-triagen-primary')
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 md:px-12 md:py-10">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
