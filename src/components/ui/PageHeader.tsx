import { useNavigate } from 'react-router-dom';
import { Moon, Sun, UserPlus } from 'lucide-react';
import Logo from './Logo';
import Button from './button';

export interface PageHeaderProps {
  darkMode: boolean;
  toggleDarkMode?: () => void;
  onLogoClick?: () => void;
  showAuthButtons?: boolean;
  onJoinWaitlist?: () => void;
  onStartInterview?: () => void;
  rightContent?: React.ReactNode;
  className?: string;
}

function PageHeader({
  darkMode,
  toggleDarkMode,
  onLogoClick,
  showAuthButtons = false,
  onJoinWaitlist,
  onStartInterview,
  rightContent,
  className = ''
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    } else {
      // Always navigate to home by default
      navigate('/');
    }
  };

  return (
    <header className={`backdrop-blur-xl border-b transition-all duration-300 sticky top-0 z-40 h-20 ${
      darkMode 
        ? 'bg-gray-900/80 border-triagen-border-dark' 
        : 'bg-triagen-light-bg/80 border-triagen-border-light'
    } ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Left side - Logo with fixed positioning */}
          <div className="flex items-center min-w-0 flex-shrink-0">
            <Logo darkMode={darkMode} onClick={handleLogoClick} />
          </div>
          
          {/* Right side - Actions */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* Custom right content */}
            {rightContent}
            
            {/* Dark mode toggle */}
            {toggleDarkMode && (
              <button
                onClick={toggleDarkMode}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 flex-shrink-0 ${
                  darkMode 
                    ? 'bg-gray-800/50 text-triagen-secondary-green hover:bg-gray-700/50' 
                    : 'bg-triagen-light-bg/50 text-triagen-dark-bg hover:bg-triagen-light-bg/70'
                }`}
                title={darkMode ? 'Modo claro' : 'Modo escuro'}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            )}

            {/* Auth buttons - Fixed size */}
            {showAuthButtons && (
              <>
                <Button 
                  variant="secondary"
                  size="sm"
                  darkMode={darkMode}
                  onClick={onJoinWaitlist}
                  icon={UserPlus}
                  iconPosition="left"
                  className={`h-10 px-4 text-sm whitespace-nowrap flex-shrink-0 ${
                    darkMode 
                      ? 'bg-triagen-secondary-green/10 border-triagen-secondary-green/30 text-triagen-secondary-green hover:bg-triagen-secondary-green/20' 
                      : 'bg-triagen-highlight-purple/10 border-triagen-highlight-purple/30 text-triagen-highlight-purple hover:bg-triagen-highlight-purple/20'
                  }`}
                >
                  Teste Grátis
                </Button>
                
                <Button 
                  variant="primary"
                  size="sm"
                  onClick={onStartInterview}
                  className="h-10 px-4 text-sm whitespace-nowrap flex-shrink-0 bg-triagen-dark-bg hover:bg-triagen-primary-blue"
                >
                  Entrevista Demo
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default PageHeader;