import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useDarkMode from '../hooks/useDarkMode';
import PageHeader from './ui/PageHeader';
import Button from './ui/Button';

function NotFoundPage() {
  const { darkMode } = useDarkMode();
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen font-sans ${darkMode ? 'bg-gray-900' : 'bg-triagen-neutral'}`}>
      <PageHeader darkMode={darkMode} />

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-12">
        <div className="max-w-md w-full text-center rise-in">
          <p className={`font-heading text-7xl mb-6 ${darkMode ? 'text-gray-700' : 'text-neutral-300'}`}>
            404
          </p>
          <h1 className={`font-heading font-normal tracking-tight text-3xl mb-3 ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>
            Página não encontrada
          </h1>
          <p className={`text-base leading-relaxed mb-8 ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
            O endereço que você acessou não existe ou foi movido.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/')}
            icon={ArrowLeft}
            iconPosition="left"
          >
            Voltar para o início
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
