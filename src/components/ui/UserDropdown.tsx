import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import useDarkMode from '../../hooks/useDarkMode';

interface DropdownItem {
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
}

const dropdownItems: DropdownItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Briefcase, label: 'Vagas', path: '/dashboard/jobs' },
  { icon: Users, label: 'Candidatos', path: '/dashboard/candidates' },
  { icon: BarChart3, label: 'Relatórios', path: '/dashboard/reports' },
  { icon: Settings, label: 'Configurações', path: '/dashboard/settings' },
];

function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const { darkMode } = useDarkMode(true);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate('/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105 ${
          darkMode 
            ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-triagen-border-dark' 
            : 'bg-triagen-light-bg/50 text-triagen-dark-bg hover:bg-triagen-light-bg/70 border border-triagen-border-light'
        }`}
        title="Menu do usuário"
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          darkMode ? 'bg-triagen-secondary-green' : 'bg-triagen-dark-bg'
        }`}>
          <User className="h-4 w-4 text-white" />
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl border backdrop-blur-xl z-50 ${
          darkMode 
            ? 'bg-gray-800/90 border-triagen-border-dark' 
            : 'bg-white/90 border-triagen-border-light'
        }`}>
          {/* User Info */}
          <div className={`px-4 py-3 border-b ${
            darkMode ? 'border-triagen-border-dark' : 'border-triagen-border-light'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                darkMode ? 'bg-triagen-secondary-green' : 'bg-triagen-dark-bg'
              }`}>
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                  Usuário
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="py-2">
            {dropdownItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-all duration-200 ${
                    darkMode
                      ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                      : 'text-triagen-text-light hover:bg-triagen-border-light hover:text-triagen-text-dark'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Logout */}
          <div className={`border-t ${
            darkMode ? 'border-triagen-border-dark' : 'border-triagen-border-light'
          }`}>
            <button
              onClick={handleSignOut}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-all duration-200 ${
                darkMode
                  ? 'text-triagen-error hover:bg-triagen-error/10'
                  : 'text-red-600 hover:bg-red-50'
              }`}
            >
              <LogOut className="h-4 w-4" />
              <span className="font-medium text-sm">Sair</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDropdown;