import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Building } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import useDarkMode from '../../hooks/useDarkMode';
import AnimatedBackground from '../ui/AnimatedBackground';
import Button from '../ui/button';
import Card from '../ui/card';
import StatusMessage from '../ui/StatusMessage';
import PageHeader from '../ui/PageHeader';

function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const { darkMode } = useDarkMode(true);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.companyName) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error } = await signUp(formData.email, formData.password);
      if (error) {
        setError(error.message);
      } else {
        // Store company name in localStorage to use after email confirmation
        localStorage.setItem('pendingCompanyName', formData.companyName);
        navigate('/auth/verify-email');
      }
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-triagen-light-bg'}`}>
      <AnimatedBackground darkMode={darkMode} />
      <PageHeader darkMode={darkMode} />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-md w-full">
          <Card darkMode={darkMode} hoverEffect>
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-triagen-dark-bg flex items-center justify-center">
                <Building className="h-10 w-10 text-white" />
              </div>
              
              <h1 className={`font-heading text-3xl font-bold mb-3 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                Criar Conta
              </h1>
              
              <p className={`font-sans transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                Comece a usar nossa plataforma de entrevistas com IA
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="companyName" className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                  <Building className="h-4 w-4 inline mr-2" />
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Nome da sua empresa"
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
                <label htmlFor="email" className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
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
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Mínimo 6 caracteres"
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

              <div>
                <label htmlFor="confirmPassword" className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                  <Lock className="h-4 w-4 inline mr-2" />
                  Confirmar Senha
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Digite a senha novamente"
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                      darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-triagen-text-light hover:text-triagen-text-dark'
                    }`}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
                disabled={!formData.email || !formData.password || !formData.confirmPassword || !formData.companyName}
                icon={ArrowRight}
                className="bg-triagen-dark-bg hover:bg-triagen-primary-blue"
              >
                {isLoading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                Já tem uma conta?{' '}
                <Link
                  to="/auth/login"
                  className={`font-medium transition-colors ${
                    darkMode 
                      ? 'text-triagen-secondary-green hover:text-triagen-secondary-green/80' 
                      : 'text-triagen-primary-blue hover:text-triagen-primary-blue/80'
                  } underline`}
                >
                  Faça login
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;