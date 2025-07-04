
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Lock, User, Building, Phone } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import useDarkMode from '../../hooks/useDarkMode';
import AnimatedBackground from '../ui/AnimatedBackground';
import Button from '../ui/button';
import Card from '../ui/Card';
import StatusMessage from '../ui/StatusMessage';
import PageHeader from '../ui/PageHeader';

function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    companyName: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const { darkMode } = useDarkMode(true);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      const result = await signUp(formData.email, formData.password, {
        name: formData.name,
        companyName: formData.companyName,
        phone: formData.phone
      });
      
      if (result?.error) {
        throw new Error(result.error);
      }
      
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-triagen-light-bg'}`}>
      <AnimatedBackground darkMode={darkMode} />
      
      <PageHeader darkMode={darkMode} />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card darkMode={darkMode} hoverEffect>
            <div className="text-center mb-8">
              <h1 className={`font-heading text-3xl font-bold mb-3 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                Criar Conta
              </h1>
              <p className={`font-sans transition-colors duration-300 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                Junte-se à revolução das entrevistas com IA
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className={`block text-sm font-medium mb-3 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                  <User className="h-4 w-4 inline mr-2" />
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Seu nome completo"
                  className={`font-sans w-full px-4 py-4 rounded-2xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                    darkMode
                      ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                      : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                  }`}
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className={`block text-sm font-medium mb-3 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  className={`font-sans w-full px-4 py-4 rounded-2xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                    darkMode
                      ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                      : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                  }`}
                  required
                />
              </div>

              <div>
                <label htmlFor="companyName" className={`block text-sm font-medium mb-3 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                  <Building className="h-4 w-4 inline mr-2" />
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Sua empresa"
                  className={`font-sans w-full px-4 py-4 rounded-2xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                    darkMode
                      ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                      : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                  }`}
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className={`block text-sm font-medium mb-3 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                  <Phone className="h-4 w-4 inline mr-2" />
                  Telefone (Opcional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(11) 99999-9999"
                  className={`font-sans w-full px-4 py-4 rounded-2xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                    darkMode
                      ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                      : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                  }`}
                />
              </div>

              <div>
                <label htmlFor="password" className={`block text-sm font-medium mb-3 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                  <Lock className="h-4 w-4 inline mr-2" />
                  Senha
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  className={`font-sans w-full px-4 py-4 rounded-2xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                    darkMode
                      ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                      : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                  }`}
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className={`block text-sm font-medium mb-3 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                  <Lock className="h-4 w-4 inline mr-2" />
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Digite a senha novamente"
                  className={`font-sans w-full px-4 py-4 rounded-2xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                    darkMode
                      ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                      : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                  }`}
                  required
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
                icon={ArrowRight}
              >
                {isLoading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <span className={`font-sans text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                Já tem uma conta?{' '}
                <Link
                  to="/auth/login"
                  className="font-medium text-triagen-secondary-green hover:text-triagen-primary-blue transition-colors"
                >
                  Faça login
                </Link>
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
