import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import {
  Users,
  Bot,
  TrendingUp,
  Star,
  ArrowRight,
  Sparkles,
  Building,
  Target,
  Brain,
  Mail,
  User,
  MessageSquare,
  X,
  Shield
} from 'lucide-react';
import useDarkMode from '../hooks/useDarkMode';
import AnimatedBackground from './ui/AnimatedBackground';
import Button from './ui/button';
import PageHeader from './ui/PageHeader';
import SectionHeader from './ui/SectionHeader';
import FeatureCard from './ui/FeatureCard';
import StatCard from './ui/StatCard';
import Footer from './ui/Footer';
import Card from './ui/card';
import StatusMessage from './ui/StatusMessage';

function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    job_title: ''
  });
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { darkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStartInterview = () => {
    navigate('/interview');
  };

  const handleWaitlistClick = () => {
    setShowWaitlistForm(true);
    setIsSubmitted(false);
    setError('');
    // Scroll to the form area
    setTimeout(() => {
      const formElement = document.getElementById('waitlist-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (!newsletterConsent) {
      setError('É necessário aceitar receber comunicações para continuar');
      return;
    }

    // Get reCAPTCHA token
    const recaptchaToken = await recaptchaRef.current?.executeAsync();
    if (!recaptchaToken) {
      setError('Falha na verificação de segurança. Tente novamente.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Configuração do Supabase não encontrada');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/waitlist-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          company: formData.company || null,
          job_title: formData.job_title || null,
          newsletter_consent: newsletterConsent,
          recaptcha_token: recaptchaToken,
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', company: '', job_title: '' });
        setNewsletterConsent(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao enviar formulário. Tente novamente.');
      }
    } catch (err) {
      console.error('Waitlist submission error:', err);
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setIsLoading(false);
      recaptchaRef.current?.reset();
    }
  };

  const handleCloseForm = () => {
    setShowWaitlistForm(false);
    setIsSubmitted(false);
    setError('');
    setFormData({ name: '', email: '', company: '', job_title: '' });
    setNewsletterConsent(false);
    recaptchaRef.current?.reset();
  };

  const stats = [
    { icon: Users, value: '10K+', label: 'Candidatos avaliados', iconColor: 'from-blue-500 to-blue-600' },
    { icon: Building, value: '200+', label: 'Empresas parceiras', iconColor: 'from-green-500 to-green-600' },
    { icon: TrendingUp, value: '85%', label: 'Taxa de satisfação', iconColor: 'from-purple-500 to-purple-600' },
    { icon: Star, value: '4.9', label: 'Avaliação média', iconColor: 'from-orange-500 to-orange-600' }
  ];

  const features = [
    {
      icon: Bot,
      title: 'IA Conversacional Avançada',
      description: 'Nossa IA conduz entrevistas naturais e envolventes, adaptando-se ao perfil de cada candidato em tempo real.',
      iconColor: 'from-blue-500 to-blue-600'
    },
    {
      icon: Brain,
      title: 'Análise Comportamental',
      description: 'Avaliação profunda de soft skills, competências técnicas e adequação cultural através de análise avançada.',
      iconColor: 'from-purple-500 to-purple-600'
    },
    {
      icon: Target,
      title: 'Personalização Completa',
      description: 'Entrevistas totalmente customizadas para cada vaga, setor e nível hierárquico específico.',
      iconColor: 'from-green-500 to-green-600'
    }
  ];

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
      {/* Animated Background */}
      <AnimatedBackground darkMode={darkMode} scrollY={scrollY} />

      {/* Header */}
      <PageHeader
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        showAuthButtons={true}
        onJoinWaitlist={handleWaitlistClick}
        onStartInterview={handleStartInterview}
      />

      {/* Hero Section */}
      <section className="pt-20 pb-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-8 backdrop-blur-sm border ${
              darkMode 
                ? 'bg-gray-800/30 border-gray-700/50 text-gray-300' 
                : 'bg-white/30 border-gray-200/50 text-gray-600'
            }`}>
              <Sparkles className="h-4 w-4 mr-2" />
              Revolucionando o processo seletivo com IA
            </div>
            
            <h1 className={`text-5xl md:text-7xl font-bold mb-8 transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Entrevistas de emprego do{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                futuro
              </span>
            </h1>
            
            <p className={`text-xl md:text-2xl mb-12 transition-colors duration-300 leading-relaxed ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Nossa IA conduz entrevistas personalizadas, avalia candidatos com precisão e 
              acelera seu processo de contratação com insights profundos e relatórios detalhados.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartInterview}
                icon={ArrowRight}
                className="text-lg px-8 py-4"
              >
                Começar entrevista gratuita
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleWaitlistClick}
                darkMode={darkMode}
                className="text-lg px-8 py-4"
              >
                Junte-se à lista de espera
              </Button>
            </div>

            {/* Waitlist Form */}
            {showWaitlistForm && (
              <div id="waitlist-form" className="mt-16 max-w-md mx-auto">
                <Card darkMode={darkMode} hoverEffect>
                  {isSubmitted ? (
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                        <Mail className="h-8 w-8 text-white" />
                      </div>
                      
                      <h3 className={`text-xl font-bold mb-4 transition-colors duration-300 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Obrigado por se inscrever!
                      </h3>
                      
                      <p className={`mb-6 transition-colors duration-300 ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Você foi adicionado à nossa lista de espera. Verifique seu email para confirmação.
                      </p>
                      
                      <Button
                        variant="primary"
                        size="md"
                        onClick={handleCloseForm}
                        className="w-full"
                      >
                        Fechar
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-6">
                        <div className="text-center flex-1">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                            <User className="h-8 w-8 text-white" />
                          </div>
                          
                          <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            Entre na Lista de Espera
                          </h3>
                          
                          <p className={`text-sm transition-colors duration-300 ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Seja um dos primeiros a testar nossa IA
                          </p>
                        </div>
                        
                        <button
                          onClick={handleCloseForm}
                          className={`p-2 rounded-full transition-colors ${
                            darkMode 
                              ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' 
                              : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div>
                          <label htmlFor="name" className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
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
                          <label htmlFor="email" className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
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

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="company" className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                              darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Empresa
                            </label>
                            <input
                              type="text"
                              id="company"
                              name="company"
                              value={formData.company}
                              onChange={handleInputChange}
                              placeholder="Sua empresa"
                              className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
                                darkMode
                                  ? 'bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400'
                                  : 'bg-white/50 border-gray-300/50 text-gray-900 placeholder-gray-500'
                              }`}
                              disabled={isLoading}
                            />
                          </div>

                          <div>
                            <label htmlFor="job_title" className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                              darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Cargo
                            </label>
                            <input
                              type="text"
                              id="job_title"
                              name="job_title"
                              value={formData.job_title}
                              onChange={handleInputChange}
                              placeholder="Seu cargo"
                              className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
                                darkMode
                                  ? 'bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400'
                                  : 'bg-white/50 border-gray-300/50 text-gray-900 placeholder-gray-500'
                              }`}
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        {/* Newsletter Consent */}
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            id="newsletter_consent"
                            checked={newsletterConsent}
                            onChange={(e) => setNewsletterConsent(e.target.checked)}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            disabled={isLoading}
                            required
                          />
                          <label htmlFor="newsletter_consent" className={`text-sm transition-colors duration-300 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Aceito receber comunicações sobre o TriaGen e concordo com os{' '}
                            <a href="#" className="text-blue-600 hover:text-blue-500 underline">
                              termos de uso
                            </a>
                            {' '}e{' '}
                            <a href="#" className="text-blue-600 hover:text-blue-500 underline">
                              política de privacidade
                            </a>
                            . *
                          </label>
                        </div>

                        {/* reCAPTCHA */}
                        <div className="flex justify-center">
                          <ReCAPTCHA
                            ref={recaptchaRef}
                            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || ''}
                            size="invisible"
                            theme={darkMode ? 'dark' : 'light'}
                          />
                        </div>

                        {/* reCAPTCHA Attribution Text */}
                        <div className={`text-xs text-center transition-colors duration-300 ${
                          darkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          This site is protected by reCAPTCHA and the Google{' '}
                          <a 
                            href="https://policies.google.com/privacy" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-500 underline"
                          >
                            Privacy Policy
                          </a>
                          {' '}and{' '}
                          <a 
                            href="https://policies.google.com/terms" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-500 underline"
                          >
                            Terms of Service
                          </a>
                          {' '}apply.
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
                          disabled={!formData.name || !formData.email || !newsletterConsent}
                          icon={MessageSquare}
                        >
                          {isLoading ? 'Enviando...' : 'Entrar na Lista'}
                        </Button>
                      </form>

                      <StatusMessage
                        type="info"
                        title="Segurança e Privacidade"
                        message="Seus dados são protegidos por criptografia e verificação anti-spam. Não compartilhamos informações com terceiros."
                        darkMode={darkMode}
                        className="mt-4"
                        icon={Shield}
                      />
                    </>
                  )}
                </Card>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                icon={stat.icon}
                value={stat.value}
                label={stat.label}
                darkMode={darkMode}
                iconColor={stat.iconColor}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            icon={Bot}
            label="Recursos"
            title="Tecnologia de ponta para recrutamento inteligente"
            description="Descubra como nossa IA revoluciona o processo de entrevistas com recursos avançados e análises precisas."
            darkMode={darkMode}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                darkMode={darkMode}
                iconColor={feature.iconColor}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer darkMode={darkMode} onJoinWaitlist={handleWaitlistClick} />
    </div>
  );
}

export default LandingPage;