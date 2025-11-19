import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, FileCheck } from 'lucide-react';
import useDarkMode from '../hooks/useDarkMode';
import AnimatedBackground from './ui/AnimatedBackground';
import Card from './ui/Card';
import StatusMessage from './ui/StatusMessage';
import PageHeader from './ui/PageHeader';
import { getInterviewStatus } from '../api/interview';

function ProcessingPage() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  const [dots, setDots] = useState('');
  const { darkMode } = useDarkMode(true);

  useEffect(() => {
    // Animated dots effect
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(dotsInterval);
  }, []);

  useEffect(() => {
    if (!candidateId) {
      navigate('/');
      return;
    }

    let pollInterval: NodeJS.Timeout;

    const checkReportStatus = async () => {
      try {
        const report = await getInterviewStatus(candidateId);

        if (report.status === 'completed') {
          clearInterval(pollInterval);
          // Small delay for better UX
          setTimeout(() => {
            navigate(`/report/${candidateId}`);
          }, 1000);
        }
      } catch (error) {
        console.error('Error checking report status:', error);
      }
    };

    // Initial check
    checkReportStatus();

    // Poll every 5 seconds
    pollInterval = setInterval(checkReportStatus, 5000);

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [candidateId, navigate]);

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-triagen-light-bg'}`}>
      <AnimatedBackground darkMode={darkMode} />
      <PageHeader darkMode={darkMode} />

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card darkMode={darkMode}>
            {/* Icon */}
            <div className="text-center mb-8">
              <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl bg-triagen-primary-blue flex items-center justify-center transition-transform duration-300`}>
                <div className="relative">
                  <Loader2 className="h-10 w-10 text-white animate-spin" />
                  <FileCheck className="h-5 w-5 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>

              <h1 className={`font-heading text-3xl font-bold mb-3 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                Processando sua entrevista{dots}
              </h1>

              <p className={`font-sans transition-colors duration-300 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                Nossa IA está analisando suas respostas e gerando um relatório detalhado. Isso pode levar alguns minutos.
              </p>
            </div>

            {/* Status indicators */}
            <div className="space-y-4">
              <StatusMessage
                type="info"
                title="O que está acontecendo?"
                message="Estamos transcrevendo o áudio, analisando o conteúdo da conversa e avaliando suas respostas com base nos critérios da vaga."
                darkMode={darkMode}
              />

              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800/30' : 'bg-triagen-light-bg/30'}`}>
                <h3 className={`font-semibold mb-3 text-sm ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                  ⏱️ Tempo estimado
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                  Normalmente leva entre 2 a 5 minutos
                </p>
              </div>

              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800/30' : 'bg-triagen-light-bg/30'}`}>
                <h3 className={`font-semibold mb-3 text-sm ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                  📧 Não feche esta página
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                  Você será redirecionado automaticamente quando o relatório estiver pronto. Também enviaremos uma cópia por e-mail.
                </p>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="mt-8">
              <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-triagen-border-light'}`}>
                <div className="h-full bg-gradient-to-r from-triagen-secondary-green via-triagen-primary-blue to-triagen-highlight-purple animate-pulse"
                     style={{ width: '100%' }}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProcessingPage;
