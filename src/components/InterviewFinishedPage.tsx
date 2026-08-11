import { CheckCircle2 } from 'lucide-react';
import useDarkMode from '../hooks/useDarkMode';
import Card from './ui/Card';
import PageHeader from './ui/PageHeader';

function InterviewFinishedPage() {
  const { darkMode } = useDarkMode();

  return (
    <div className={`min-h-screen font-sans ${darkMode ? 'bg-gray-900' : 'bg-triagen-neutral'}`}>
      <PageHeader darkMode={darkMode} />

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-12">
        <div className="max-w-md w-full rise-in">
          <Card darkMode={darkMode} padding="lg">
            <div className="text-center py-4">
              <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${darkMode ? 'bg-triagen-secondary-green/20' : 'bg-triagen-sage-tint'}`}>
                <CheckCircle2 className={`h-8 w-8 ${darkMode ? 'text-emerald-400' : 'text-triagen-secondary-green'}`} aria-hidden="true" />
              </div>

              <h1 className={`font-heading font-normal tracking-tight text-3xl mb-4 ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>
                Entrevista concluída
              </h1>

              <p className={`text-sm leading-relaxed mb-8 ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
                Obrigado pela conversa. Suas respostas foram registradas e a empresa
                responsável pela vaga entrará em contato com os próximos passos.
              </p>

              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Você já pode fechar esta página.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default InterviewFinishedPage;
