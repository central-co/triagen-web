import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import useDarkMode from '../../hooks/useDarkMode';
import Logo from '../ui/Logo';
import Button from '../ui/button';

interface SidebarItem {
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
}

const sidebarItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Briefcase, label: 'Vagas', path: '/dashboard/jobs' },
  { icon: Users, label: 'Candidatos', path: '/dashboard/candidates' },
  { icon: BarChart3, label: 'Relatórios', path: '/dashboard/reports' },
  { icon: Settings, label: 'Configurações', path: '/dashboard/settings' },
];

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut } = useAuth();
  const { darkMode } = useDarkMode(true);
  const navigate = useNavigate();
  const location = useLocation();

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
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-triagen-light-bg'}`}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${darkMode ? 'bg-gray-800 border-triagen-border-dark' : 'bg-white border-triagen-border-light'} border-r`}>
        
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-6 border-b border-inherit">
          <Logo darkMode={darkMode} onClick={() => navigate('/')} />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? darkMode
                      ? 'bg-triagen-secondary-green/20 text-triagen-secondary-green border border-triagen-secondary-green/30'
                      : 'bg-triagen-primary-blue/20 text-triagen-primary-blue border border-triagen-primary-blue/30'
                    : darkMode
                      ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                      : 'text-triagen-text-light hover:bg-triagen-border-light hover:text-triagen-text-dark'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-inherit">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={handleSignOut}
            icon={LogOut}
            iconPosition="left"
            darkMode={darkMode}
            className={darkMode ? 'border-triagen-error/50 text-triagen-error hover:bg-triagen-error/10' : 'border-red-300 text-red-600 hover:bg-red-50'}
          >
            Sair
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className={`sticky top-0 z-30 border-b transition-all duration-300 ${
          darkMode 
            ? 'bg-gray-900/80 border-triagen-border-dark backdrop-blur-xl' 
            : 'bg-triagen-light-bg/80 border-triagen-border-light backdrop-blur-xl'
        }`}>
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                Bem-vindo à plataforma TriaGen
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;