import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bot, Lock, ArrowRight } from 'lucide-react';
import InterviewRoom from './InterviewRoom';
import useDarkMode from '../hooks/useDarkMode';
import { useAppConfig } from '../hooks/useAppConfig';
import AnimatedBackground from './ui/AnimatedBackground';
import Button from './ui/button';
import Card from './ui/Card';
import StatusMessage from './ui/StatusMessage';
import PageHeader from './ui/PageHeader';
import {
  getCandidateByShortCode,
  startInterviewSession,
  getInterviewStatus,
  planInterview,
} from '../api/interview';

function InterviewPage() {
  const { token: urlToken } = useParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(urlToken || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [jwtToken, setJwtToken] = useState('');
  const [candidateId, setCandidateId] = useState('');
  const { darkMode } = useDarkMode(true);
  const { config, loading: configLoading, error: configError } = useAppConfig();

  useEffect(() => {
    // Auto-authenticate if token is in URL and config is loaded
    if (urlToken && config && !configLoading) {
      handleAuthentication(urlToken);
    }
  }, [urlToken, config, configLoading]);

  const handleAuthentication = async (shortCode: string) => {
    if (!shortCode.trim()) {
      setError('Por favor, insira o código da entrevista');
      return;
    }

    if (configLoading) {
      setError('Aguardando configuração...');
      return;
    }

    if (configError || !config) {
      setError('Erro ao carregar configuração. Recarregue a página.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔍 Starting authentication with shortCode:', shortCode);
      console.log('🌐 API URL:', config.apiUrl);

      // 1. Get candidate ID from short code
      const candidateData = await getCandidateByShortCode(shortCode, config.apiUrl);
      console.log('✅ Candidate data received:', candidateData);
      const candidateIdValue = candidateData.candidate_id;
      setCandidateId(candidateIdValue);

      // 2. Check if report already exists (interview completed)
      const report = await getInterviewStatus(candidateIdValue, config.apiUrl);
      if (report.status === 'completed') {
        console.log('✅ Interview already completed, redirecting to report');
        navigate(`/report/${candidateIdValue}`);
        return;
      }

      // 3. Generate interview plan (backend should handle idempotency/caching)
      console.log('📋 Ensuring interview plan exists...');
      await planInterview(candidateIdValue, config.apiUrl);

      // 4. Start LiveKit session
      const session = await startInterviewSession(candidateIdValue, config.apiUrl);
      console.log('✅ Session started:', session);
      setJwtToken(session.token);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('❌ Authentication error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao validar código');
    } finally {
      setIsLoading(false);
    }
  }; const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAuthentication(token);
  };

  if (isAuthenticated) {
    return (
      <InterviewRoom
        jwtToken={jwtToken}
        candidateId={candidateId}
        onLeave={() => {
          setIsAuthenticated(false);
          setJwtToken('');
          navigate(`/interview/${candidateId}/finished`);
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-triagen-light-bg'}`}>
      {/* Animated Background */}
      <AnimatedBackground darkMode={darkMode} />

      {/* Header */}
      <PageHeader darkMode={darkMode} />

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card darkMode={darkMode} hoverEffect>
            {/* Header */}
            <div className="text-center mb-8">
              <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl bg-triagen-dark-bg flex items-center justify-center transition-transform duration-300`}>
                <Bot className="h-10 w-10 text-white" />
              </div>

              <h1 className={`font-heading text-3xl font-bold mb-3 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                Entrevista com IA
              </h1>

              <p className={`font-sans transition-colors duration-300 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                Insira o código da sua entrevista para começar a conversa com nossa IA especializada
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="token" className={`block text-sm font-medium mb-3 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                  <Lock className="h-4 w-4 inline mr-2" />
                  Código da Entrevista
                </label>
                <input
                  type="text"
                  id="token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Digite o código recebido por email"
                  className={`font-sans w-full px-4 py-4 rounded-2xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${darkMode
                      ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                      : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                    }`}
                  disabled={isLoading}
                />
              </div>

              {error && (
                <StatusMessage
                  type="error"
                  message={error}
                  darkMode={darkMode}
                />
              )}

              <Button
                type="submit"
                variant="primary-solid"
                size="lg"
                fullWidth
                isLoading={isLoading}
                disabled={!token.trim()}
                icon={ArrowRight}
              >
                {isLoading ? 'Validando código...' : 'Iniciar Entrevista'}
              </Button>
            </form>

            {/* Info */}
            <StatusMessage
              type="info"
              title="Dicas para uma boa entrevista:"
              message={
                <ul className="list-disc list-inside space-y-1">
                  <li>Certifique-se de estar em um ambiente silencioso</li>
                  <li>Teste seu microfone antes de começar</li>
                  <li>Fale de forma clara e natural</li>
                  <li>A entrevista dura aproximadamente 15-20 minutos</li>
                </ul>
              }
              darkMode={darkMode}
              className="mt-8"
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default InterviewPage;