
import { useState } from 'react';
import { ArrowLeft, Mail, User, MessageSquare } from 'lucide-react';
import useDarkMode from '../hooks/useDarkMode';
import AnimatedBackground from './ui/AnimatedBackground';
import Button from './ui/button';
import Card from './ui/Card';
import StatusMessage from './ui/StatusMessage';
import PageHeader from './ui/PageHeader';

interface WaitlistFormProps {
  onBack: () => void;
  darkMode?: boolean;
}

function WaitlistForm({ onBack, darkMode: propDarkMode }: WaitlistFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    experience: '',
    interests: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { darkMode: hookDarkMode } = useDarkMode(true);
  
  // Use prop darkMode if provided, otherwise use hook
  const darkMode = propDarkMode !== undefined ? propDarkMode : hookDarkMode;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSubmitted(true);
    } catch (err) {
      setError('Erro ao enviar formulário. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
        <AnimatedBackground darkMode={darkMode} />
        <PageHeader darkMode={darkMode} />
        
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <Card darkMode={darkMode} hoverEffect>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                  <Mail className="h-10 w-10 text-white" />
                </div>
                
                <h1 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Obrigado por se inscrever!
                </h1>
                
                <p className={`mb-8 transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Você foi adicionado à nossa lista de espera. Em breve entraremos em contato com mais informações.
                </p>
                
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={onBack}
                  icon={ArrowLeft}
                  iconPosition="left"
                >
                  Voltar ao Início
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
      <AnimatedBackground darkMode={darkMode} />
      <PageHeader darkMode={darkMode} />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card darkMode={darkMode} hoverEffect>
            {/* Header */}
            <div className="text-center mb-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                icon={ArrowLeft}
                iconPosition="left"
                darkMode={darkMode}
                className="mb-4"
              >
                Voltar
              </Button>
              
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <User className="h-10 w-10 text-white" />
              </div>
              
              <h1 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Junte-se à Lista de Espera
              </h1>
              
              <p className={`transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Seja um dos primeiros a testar nossa plataforma de entrevistas com IA
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Nome completo *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Seu nome completo"
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
                    darkMode
                      ? 'bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400'
                      : 'bg-white/50 border-gray-300/50 text-gray-900 placeholder-gray-500'
                  }`}
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
                    darkMode
                      ? 'bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400'
                      : 'bg-white/50 border-gray-300/50 text-gray-900 placeholder-gray-500'
                  }`}
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <label htmlFor="experience" className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Nível de experiência
                </label>
                <select
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
                    darkMode
                      ? 'bg-gray-800/50 border-gray-600/50 text-white'
                      : 'bg-white/50 border-gray-300/50 text-gray-900'
                  }`}
                  disabled={isLoading}
                >
                  <option value="">Selecione...</option>
                  <option value="junior">Júnior (0-2 anos)</option>
                  <option value="pleno">Pleno (2-5 anos)</option>
                  <option value="senior">Sênior (5+ anos)</option>
                  <option value="lead">Liderança</option>
                </select>
              </div>

              <div>
                <label htmlFor="interests" className={`block text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Áreas de interesse
                </label>
                <textarea
                  id="interests"
                  name="interests"
                  value={formData.interests}
                  onChange={handleInputChange}
                  placeholder="Ex: Desenvolvimento web, mobile, DevOps..."
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none ${
                    darkMode
                      ? 'bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400'
                      : 'bg-white/50 border-gray-300/50 text-gray-900 placeholder-gray-500'
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
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                disabled={!formData.name || !formData.email}
                icon={MessageSquare}
              >
                {isLoading ? 'Enviando...' : 'Entrar na Lista'}
              </Button>
            </form>

            <StatusMessage
              type="info"
              message="Prometemos não enviar spam. Você receberá apenas atualizações importantes sobre o lançamento."
              darkMode={darkMode}
              className="mt-6"
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default WaitlistForm;
