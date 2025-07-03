
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import useDarkMode from '../../hooks/useDarkMode';
import Button from '../ui/button';
import Card from '../ui/Card';
import StatusMessage from '../ui/StatusMessage';
import AnimatedBackground from '../ui/AnimatedBackground';
import PageHeader from '../ui/PageHeader';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn } = useAuth();
  const { darkMode } = useDarkMode(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await signIn(email, password);
      // O redirecionamento será feito automaticamente pelo PublicRoute no App.tsx
      // quando o estado de autenticação for atualizado
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-triagen-light-bg'}`}>
      <AnimatedBackground darkMode={darkMode} />
      <PageHeader darkMode={darkMode} />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card darkMode={darkMode} hoverEffect>
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-triagen-dark-bg flex items-center justify-center">
                <Lock className="h-10 w-10 text-white" />
              </div>
              
              <h1 className={`font-heading text-3xl font-bold mb-3 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                Entrar na Plataforma
              </h1>
              
              <p className={`font-sans transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                Acesse sua conta para gerenciar vagas e candidatos
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                    darkMode
                      ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                      : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                  }`}
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                  <Lock className="h-4 w-4 inline mr-2" />
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    className={`font-sans w-full px-4 py-3 pr-12 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                      darkMode
                        ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                        : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                    }`}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                      darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-triagen-text-light hover:text-triagen-text-dark'
                    }`}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
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
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                disabled={!email || !password}
                icon={ArrowRight}
                className="bg-triagen-dark-bg hover:bg-triagen-primary-blue"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-4">
              <Link
                to="/auth/forgot-password"
                className={`font-sans text-sm transition-colors ${
                  darkMode 
                    ? 'text-triagen-secondary-green hover:text-triagen-secondary-green/80' 
                    : 'text-triagen-primary-blue hover:text-triagen-primary-blue/80'
                } underline`}
              >
                Esqueceu sua senha?
              </Link>
              
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                Não tem uma conta?{' '}
                <Link
                  to="/auth/register"
                  className={`font-medium transition-colors ${
                    darkMode 
                      ? 'text-triagen-secondary-green hover:text-triagen-secondary-green/80' 
                      : 'text-triagen-primary-blue hover:text-triagen-primary-blue/80'
                  } underline`}
                >
                  Cadastre-se
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
