import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  BarChart3,
  Settings,
  LogOut,
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
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);

            return (
              <Button
                key={item.path}
                variant={isActive ? 'green-test' : 'ghost'}
                size="md"
                fullWidth
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                icon={Icon}
                iconPosition="left"
                darkMode={darkMode}
                contentAlignment="left"
              >
                {item.label}
              </Button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-inherit">
          <Button
            variant="danger"
            size="md"
            fullWidth
            onClick={handleSignOut}
            icon={LogOut}
            iconPosition="left"
            darkMode={darkMode}
            contentAlignment="left"
          >
            Sair
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}


        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
