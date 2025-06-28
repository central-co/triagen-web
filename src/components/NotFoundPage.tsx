
import { Link } from 'react-router-dom';
import useDarkMode from '../hooks/useDarkMode';
import AnimatedBackground from './ui/AnimatedBackground';
import PageHeader from './ui/PageHeader';
import Button from './ui/button';
import Card from './ui/card';

function NotFoundPage() {
  const { darkMode } = useDarkMode(true);

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
      <AnimatedBackground darkMode={darkMode} />
      
      {/* Header */}
      <PageHeader darkMode={darkMode} />
      
      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card darkMode={darkMode} hoverEffect>
            <div className="text-center">
              <h1 className={`text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                404
              </h1>
              <h2 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Página não encontrada
              </h2>
              <p className={`mb-8 transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                A página que você está procurando não existe ou foi movida.
              </p>
              <Link to="/">
                <Button variant="primary" size="lg" fullWidth>
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
