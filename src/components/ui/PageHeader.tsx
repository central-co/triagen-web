import { useNavigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import Logo from './Logo';

interface PageHeaderProps {
  darkMode: boolean;
  toggleDarkMode?: () => void;
  onLogoClick?: () => void;
  rightContent?: React.ReactNode;
  className?: string;
}

/** Shared header for all public pages: wordmark on the left, quiet actions on the right. */
function PageHeader({
  darkMode,
  toggleDarkMode,
  onLogoClick,
  rightContent,
  className = ''
}: Readonly<PageHeaderProps>) {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    } else {
      navigate('/');
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 h-16 border-b backdrop-blur ${
        darkMode
          ? 'bg-gray-900/90 border-gray-800'
          : 'bg-triagen-neutral/90 border-triagen-border-light'
      } ${className}`}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-8 h-full flex items-center justify-between">
        <Logo darkMode={darkMode} onClick={handleLogoClick} />

        <div className="flex items-center gap-2 sm:gap-3">
          {toggleDarkMode && (
            <button
              onClick={toggleDarkMode}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                darkMode
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  : 'text-triagen-secondary hover:text-triagen-primary hover:bg-neutral-200/60'
              }`}
              title={darkMode ? 'Modo claro' : 'Modo escuro'}
              aria-label={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
            >
              {darkMode ? <Sun className="h-[1.1rem] w-[1.1rem]" /> : <Moon className="h-[1.1rem] w-[1.1rem]" />}
            </button>
          )}
          {rightContent}
        </div>
      </div>
    </header>
  );
}

export default PageHeader;
