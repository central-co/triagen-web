
import { Link } from 'react-router-dom';
import useDarkMode from '../hooks/useDarkMode';
import AnimatedBackground from './ui/AnimatedBackground';
import PageHeader from './ui/PageHeader';
import Button from './ui/button';
import Card from './ui/Card';

function NotFoundPage() {
  const { darkMode } = useDarkMode(true);

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-triagen-light-bg'}`}>
      <AnimatedBackground darkMode={darkMode} />
      
      {/* Header */}
      <PageHeader darkMode={darkMode} />
      
      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card darkMode={darkMode} hoverEffect>
            <div className="text-center">
              <h1 className={`font-heading text-6xl font-bold mb-4 text-triagen-primary-blue`}>
                404
              </h1>
              <h2 className={`font-heading text-2xl font-bold mb-4 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                Página não encontrada
              </h2>
              <p className={`font-sans mb-8 transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                A página que você está procurando não existe ou foi movida.
              </p>
              <Link to="/">
                <Button 
                  variant="primary" 
                  size="lg" 
                  fullWidth
                  className="bg-triagen-dark-bg hover:bg-triagen-primary-blue"
                >
                  Voltar para a Home
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
