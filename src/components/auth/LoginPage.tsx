import { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import useDarkMode from '../../hooks/useDarkMode';
import Button from '../ui/Button';
import Card from '../ui/Card';
import StatusMessage from '../ui/StatusMessage';
import AnimatedBackground from '../ui/AnimatedBackground';
import PageHeader from '../ui/PageHeader';
import { Input } from '../ui/Field';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuth();
  const { darkMode } = useDarkMode();

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
      // Redirect happens automatically via PublicRoute once auth state updates
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-triagen-light-bg'}`}>
      <AnimatedBackground darkMode={darkMode} />
      <PageHeader darkMode={darkMode} />

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full relative">
          <Card darkMode={darkMode} padding="lg">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-3xl bg-triagen-dark-bg flex items-center justify-center">
                <Lock className="h-8 w-8 text-white" aria-hidden="true" />
              </div>

              <h1 className={`font-heading text-3xl font-semibold mb-3 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                Entrar na plataforma
              </h1>

              <p className={`font-sans ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                Acesse sua conta para gerenciar vagas e candidatos
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="E-mail"
                id="email"
                type="email"
                darkMode={darkMode}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                disabled={isLoading}
                required
              />

              <div>
                <label htmlFor="password" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-primary'}`}>
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    autoComplete="current-password"
                    className={`font-sans w-full px-4 py-2.5 pr-12 rounded border text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-triagen-secondary/30 focus:border-triagen-secondary ${
                      darkMode
                        ? 'bg-gray-800/60 border-gray-700 text-white placeholder-gray-500'
                        : 'bg-white border-neutral-200 text-triagen-primary placeholder-gray-400'
                    }`}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${
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
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
