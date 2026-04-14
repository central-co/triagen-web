import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Bell,
  Settings,
  Menu,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import useDarkMode from '../../hooks/useDarkMode';

function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { signOut } = useAuth();
  const { darkMode } = useDarkMode(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { label: 'Talent', path: '/dashboard' },
    { label: 'Jobs', path: '/dashboard/jobs' },
    { label: 'Candidates', path: '/dashboard/candidates' },
    { label: 'Insights', path: '/dashboard/reports' },
  ];

  const isActivePath = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${darkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-triagen-neutral text-triagen-primary'}`}>
      
      {/* Top Navigation Bar */}
      <header className={`sticky top-0 z-50 border-b flex h-16 items-center px-6 md:px-12 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-neutral-200'}`}>
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          
          {/* Left: Logo & Nav Links */}
          <div className="flex items-center gap-10">
            <h1 
              onClick={() => navigate('/')} 
              className="text-xl font-heading font-semibold tracking-tight cursor-pointer"
            >
              TriaGen
            </h1>
            
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
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
          <div className="flex items-center gap-5">
            <button className={`p-1 transition-colors ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-triagen-secondary hover:text-triagen-primary'}`}>
              <Bell strokeWidth={1.5} className="w-5 h-5" />
            </button>
            <button 
               onClick={() => navigate('/dashboard/settings')}
               className={`p-1 transition-colors hidden sm:block ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-triagen-secondary hover:text-triagen-primary'}`}>
              <Settings strokeWidth={1.5} className="w-5 h-5" />
            </button>
            
            {/* Simple User / Profile Avatar */}
            <div className="relative group cursor-pointer ml-2">
              <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 border border-neutral-200 flex items-center justify-center">
                 <UserIcon strokeWidth={1.5} className="w-4 h-4 text-gray-500" />
              </div>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded shadow-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                 <button onClick={handleSignOut} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-neutral-50 flex items-center gap-2">
                   <LogOut className="w-4 h-4" /> Sign Out
                 </button>
              </div>
            </div>

            {/* Mobile Nav Toggle */}
            <button 
              className="md:hidden p-1 text-triagen-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu strokeWidth={1.5} className="w-6 h-6" />
            </button>

          </div>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      {mobileMenuOpen && (
        <div className={`md:hidden absolute top-16 left-0 w-full border-b shadow-sm z-40 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-neutral-200'}`}>
          <div className="flex flex-col px-6 py-4 gap-4">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                className={`text-left text-sm font-medium ${isActivePath(item.path) ? 'text-triagen-primary' : 'text-triagen-secondary'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-12">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
