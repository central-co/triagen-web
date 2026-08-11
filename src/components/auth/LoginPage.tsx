import { useState } from 'react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import useDarkMode from '../../hooks/useDarkMode';
import Button from '../ui/Button';
import Card from '../ui/Card';
import StatusMessage from '../ui/StatusMessage';
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
      setError('Preencha e-mail e senha para entrar.');
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
    <div className={`min-h-screen font-sans ${darkMode ? 'bg-gray-900' : 'bg-triagen-neutral'}`}>
      <PageHeader darkMode={darkMode} />

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-12">
        <div className="max-w-md w-full rise-in">
          <div className="mb-8">
            <h1 className={`font-heading font-normal tracking-tight text-4xl mb-3 ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>
              Entrar
            </h1>
            <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
              Acesse o painel para gerenciar vagas, candidatos e relatórios.
            </p>
          </div>

          <Card darkMode={darkMode} padding="lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="E-mail"
                id="email"
                type="email"
                darkMode={darkMode}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@empresa.com"
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
                        : 'bg-white border-triagen-border-light text-triagen-primary placeholder-gray-400'
                    }`}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                      darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-triagen-primary'
                    }`}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <StatusMessage type="error" message={error} darkMode={darkMode} />
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

          <p className={`mt-6 text-center text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            O acesso é liberado para empresas do programa de acesso antecipado.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
