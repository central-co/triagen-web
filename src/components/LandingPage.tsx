import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import {
  Users,
  Bot,
  ArrowRight,
  Building,
  Target,
  Brain,
  Mail,
  MessageSquare,
  X,
  Shield,
  FileText,
  CheckCircle,
  BarChart3,
  Heart,
  Mic,
  UserCheck,
  Clock,
  Download,
  Zap,
  UserPlus,
  Play
} from 'lucide-react';
import useDarkMode from '../hooks/useDarkMode';
import { useAuth } from '../hooks/useAuth';
import AnimatedBackground from './ui/AnimatedBackground';
import Button from './ui/button';
import PageHeader from './ui/PageHeader';
import SectionHeader from './ui/SectionHeader';
import FeatureCard from './ui/FeatureCard';
import StatCard from './ui/StatCard';
import Footer from './ui/Footer';
import Card from './ui/Card';
import StatusMessage from './ui/StatusMessage';
import UserDropdown from './ui/UserDropdown';

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
  const { user, loading } = useAuth();
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

  // Create right content based on authentication status
  const rightContent = (() => {
    // Don't show loading spinner in the header - just show nothing while loading
    if (loading) {
      return null;
    }

    if (user) {
      return <UserDropdown />;
    }

    return (
      <div className="flex items-center space-x-3">
        <Button 
          variant="secondary"
          size="sm"
          darkMode={darkMode}
          onClick={handleWaitlistClick}
          icon={UserPlus}
          iconPosition="left"
          className={`h-10 px-4 text-sm whitespace-nowrap flex-shrink-0 ${
            darkMode 
              ? 'bg-triagen-secondary-green/10 border-triagen-secondary-green/30 text-triagen-secondary-green hover:bg-triagen-secondary-green/20' 
              : 'bg-triagen-highlight-purple/10 border-triagen-highlight-purple/30 text-triagen-highlight-purple hover:bg-triagen-highlight-purple/20'
          }`}
        >
          Teste Grátis
        </Button>
        
        <Button 
          variant="primary"
          size="sm"
          onClick={handleStartInterview}
          icon={Play}
          iconPosition="left"
          className="h-10 px-4 text-sm whitespace-nowrap flex-shrink-0 bg-triagen-dark-bg hover:bg-triagen-primary-blue"
        >
          Iniciar Entrevista
        </Button>
      </div>
    );
  })();

  const stats = [
    { icon: Users, value: '2.5K+', title: 'Candidatos ouvidos', iconColor: 'bg-triagen-dark-bg' },
    { icon: Building, value: '50+', title: 'Empresas parceiras', iconColor: 'bg-triagen-secondary-green' },
    { icon: Clock, value: '80%', title: 'Redução no tempo de triagem', iconColor: 'bg-triagen-primary-blue' },
    { icon: Heart, value: '95%', title: 'Satisfação dos candidatos', iconColor: 'bg-triagen-highlight-purple' }
  ];

  const features = [
    {
      icon: Mic,
      title: 'Escuta Empática e Inclusiva',
      description: 'Nossa IA conversa com cada candidato de forma natural e acessível, garantindo que todas as vozes sejam ouvidas, independente do perfil ou background.',
      iconColor: 'bg-triagen-dark-bg'
    },
    {
      icon: Brain,
      title: 'Contexto Primeiro, Não Apenas Palavras-chave',
      description: 'Análise profunda que vai além do currículo, entendendo a compatibilidade real entre candidato e vaga através de conversas estruturadas.',
      iconColor: 'bg-triagen-secondary-green'
    },
    {
      icon: UserCheck,
      title: 'Etapa Adicional, Não Substituta',
      description: 'Amplificamos seu funil de candidatos e entregamos apenas os perfis com maior fit, poupando horas de trabalho manual sem substituir o toque humano.',
      iconColor: 'bg-triagen-primary-blue'
    }
  ];

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-triagen-light-bg'}`}>
      {/* Animated Background */}
      <AnimatedBackground darkMode={darkMode} scrollY={scrollY} />

      {/* Header */}
      <PageHeader
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        rightContent={rightContent}
      />

      {/* Hero Section */}
      <section className="pt-20 pb-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-8 backdrop-blur-sm border ${
              darkMode 
                ? 'bg-gray-800/30 border-triagen-border-dark text-gray-300' 
                : 'bg-white/40 border-triagen-border-light text-triagen-text-dark'
            }`}>
              <Zap className="h-4 w-4 mr-2 text-triagen-secondary-green" />
              Democratizando a escuta no recrutamento
            </div>
            
            <h1 className={`font-heading text-5xl md:text-7xl font-bold mb-8 transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-triagen-dark-bg'
            }`}>
              Mais{' '}
              <span className="text-triagen-primary-blue">
                alcance
              </span>
              , mais{' '}
              <span className="text-triagen-secondary-green">
                precisão
              </span>
            </h1>
            
            <p className={`font-sans text-xl md:text-2xl mb-12 transition-colors duration-300 leading-relaxed ${
              darkMode ? 'text-gray-400' : 'text-triagen-text-light'
            }`}>
              Amplie seu funil de candidatos e afunile com contexto. Nossa IA empática entrevista todos que se candidatam, 
              entregando apenas os perfis com maior fit — humanizando o processo sem inflar os custos.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={handleWaitlistClick}
                icon={ArrowRight}
                className="text-lg px-8 py-4 bg-triagen-dark-bg hover:bg-triagen-primary-blue"
              >
                Teste Grátis (5 Candidatos)
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleWaitlistClick}
                darkMode={darkMode}
                className={`text-lg px-8 py-4 border-2 ${
                  darkMode 
                    ? 'border-triagen-secondary-green/50 text-triagen-secondary-green hover:bg-triagen-secondary-green/10' 
                    : 'border-triagen-highlight-purple/50 text-triagen-highlight-purple hover:bg-triagen-highlight-purple/10'
                }`}
              >
                Piloto Acadêmico (R$200)
              </Button>
            </div>

            {/* Interview Access for Candidates */}
            <div className="mt-12 pt-8 border-t border-triagen-border-light dark:border-triagen-border-dark">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-4 backdrop-blur-sm border ${
                darkMode 
                  ? 'bg-triagen-primary-blue/10 border-triagen-primary-blue/30 text-triagen-primary-blue' 
                  : 'bg-triagen-primary-blue/10 border-triagen-primary-blue/30 text-triagen-primary-blue'
              }`}>
                <Bot className="h-4 w-4 mr-2" />
                Para Candidatos
              </div>
              
              <h2 className={`font-heading text-2xl font-bold mb-4 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-triagen-dark-bg'
              }`}>
                Recebeu um código de entrevista?
              </h2>
              
              <p className={`font-sans text-lg mb-6 transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-triagen-text-light'
              }`}>
                Inicie sua entrevista personalizada com nossa IA empática
              </p>
              
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartInterview}
                icon={Play}
                iconPosition="left"
                className="text-lg px-8 py-4 bg-triagen-primary-blue hover:bg-triagen-dark-bg"
              >
                Iniciar Minha Entrevista
              </Button>
            </div>

            {/* Waitlist Form */}
            {showWaitlistForm && (
              <div id="waitlist-form" className="mt-16 max-w-2xl mx-auto">
                <Card darkMode={darkMode} hoverEffect>
                  {isSubmitted ? (
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-triagen-secondary-green flex items-center justify-center">
                        <Mail className="h-8 w-8 text-white" />
                      </div>
                      
                      <h3 className={`font-heading text-xl font-bold mb-4 transition-colors duration-300 ${
                        darkMode ? 'text-white' : 'text-triagen-dark-bg'
                      }`}>
                        Obrigado por se inscrever!
                      </h3>
                      
                      <p className={`font-sans mb-6 transition-colors duration-300 ${
                        darkMode ? 'text-gray-400' : 'text-triagen-text-light'
                      }`}>
                        Você foi adicionado à nossa lista. Verifique seu email para confirmação.
                      </p>
                      
                      <Button
                        variant="primary"
                        size="md"
                        onClick={handleCloseForm}
                        className="w-full bg-triagen-dark-bg hover:bg-triagen-primary-blue"
                      >
                        Fechar
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-6">
                        <div className="text-center flex-1">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-triagen-dark-bg flex items-center justify-center">
                            <UserCheck className="h-8 w-8 text-white" />
                          </div>
                          
                          <h3 className={`font-heading text-xl font-bold mb-2 transition-colors duration-300 ${
                            darkMode ? 'text-white' : 'text-triagen-dark-bg'
                          }`}>
                            Comece a Ouvir Mais
                          </h3>
                          
                          <p className={`font-sans text-sm transition-colors duration-300 ${
                            darkMode ? 'text-gray-400' : 'text-triagen-text-light'
                          }`}>
                            Teste grátis ou piloto acadêmico
                          </p>
                        </div>
                        
                        <button
                          onClick={handleCloseForm}
                          className={`p-2 rounded-full transition-colors ${
                            darkMode 
                              ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' 
                              : 'hover:bg-triagen-border-light text-triagen-text-light hover:text-triagen-text-dark'
                          }`}
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <form onSubmit={handleFormSubmit} className="space-y-4">
                        {/* Nome e Email lado a lado */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="name" className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                              darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'
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
                            <label htmlFor="email" className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                              darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'
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
                              className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                                darkMode
                                  ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                                  : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                              }`}
                              disabled={isLoading}
                              required
                            />
                          </div>
                        </div>

                        {/* Empresa e Cargo lado a lado */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="company" className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                              darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'
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
                              className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                                darkMode
                                  ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                                  : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                              }`}
                              disabled={isLoading}
                            />
                          </div>

                          <div>
                            <label htmlFor="job_title" className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                              darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'
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
                              className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                                darkMode
                                  ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                                  : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
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
                            className="mt-1 h-4 w-4 text-triagen-secondary-green focus:ring-triagen-secondary-green border-triagen-border-light rounded"
                            disabled={isLoading}
                            required
                          />
                          <label htmlFor="newsletter_consent" className={`font-sans text-sm transition-colors duration-300 ${
                            darkMode ? 'text-gray-300' : 'text-triagen-text-light'
                          }`}>
                            Aceito receber comunicações sobre o TriaGen e concordo com os{' '}
                            <a href="#" className="text-triagen-secondary-green hover:text-triagen-secondary-green/80 underline">
                              termos de uso
                            </a>
                            {' '}e{' '}
                            <a href="#" className="text-triagen-secondary-green hover:text-triagen-secondary-green/80 underline">
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
                        <div className={`font-sans text-xs text-center transition-colors duration-300 ${
                          darkMode ? 'text-gray-500' : 'text-triagen-text-light'
                        }`}>
                          This site is protected by reCAPTCHA and the Google{' '}
                          <a 
                            href="https://policies.google.com/privacy" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-triagen-secondary-green hover:text-triagen-secondary-green/80 underline"
                          >
                            Privacy Policy
                          </a>
                          {' '}and{' '}
                          <a 
                            href="https://policies.google.com/terms" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-triagen-secondary-green hover:text-triagen-secondary-green/80 underline"
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
                          className="bg-triagen-dark-bg hover:bg-triagen-primary-blue"
                        >
                          {isLoading ? 'Enviando...' : 'Começar Agora'}
                        </Button>
                      </form>

                      <StatusMessage
                        type="info"
                        title="Transparência e Confiança"
                        message="Seus dados são protegidos e você tem controle total sobre como nossa IA conduz as entrevistas. Sem surpresas, apenas resultados."
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
                title={stat.title}
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
            icon={Heart}
            label="Como Funciona"
            title="Eficiência sem frieza, tecnologia com empatia"
            description="Nossa IA não substitui você — ela amplifica sua capacidade de ouvir todos os candidatos e identificar os melhores fits com precisão e humanidade."
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

      {/* Report Example Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            icon={FileText}
            label="Relatórios Inteligentes"
            title="Insights que fazem a diferença"
            description="Receba análises detalhadas e transparentes sobre cada candidato, com dados que realmente importam para sua decisão."
            darkMode={darkMode}
          />
          
          <div className="max-w-4xl mx-auto">
            <Card darkMode={darkMode} hoverEffect className="overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left side - Report preview */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`font-heading text-xl font-bold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                      Análise do Candidato
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-triagen-secondary-green flex items-center justify-center">
                        <span className="text-white text-sm font-bold">8.7</span>
                      </div>
                      <span className={`font-sans text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                        Compatibilidade
                      </span>
                    </div>
                  </div>

                  {/* Competências */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`font-sans text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                          Comunicação
                        </span>
                        <span className="text-triagen-secondary-green text-sm font-bold">Excelente</span>
                      </div>
                      <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-triagen-border-light'}`}>
                        <div className="h-full bg-triagen-secondary-green rounded-full" style={{ width: '90%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`font-sans text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                          Experiência Técnica
                        </span>
                        <span className="text-triagen-primary-blue text-sm font-bold">Muito Bom</span>
                      </div>
                      <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-triagen-border-light'}`}>
                        <div className="h-full bg-triagen-primary-blue rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`font-sans text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                          Fit Cultural
                        </span>
                        <span className="text-triagen-primary-blue text-sm font-bold">Excelente</span>
                      </div>
                      <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-triagen-border-light'}`}>
                        <div className="h-full bg-triagen-dark-bg rounded-full" style={{ width: '95%' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex space-x-3">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Download}
                      className="bg-triagen-dark-bg hover:bg-triagen-primary-blue"
                    >
                      Baixar PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={BarChart3}
                      darkMode={darkMode}
                      className={darkMode ? 'border-triagen-secondary-green/50 text-triagen-secondary-green' : 'border-triagen-highlight-purple/50 text-triagen-highlight-purple'}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </div>

                {/* Right side - Key insights */}
                <div>
                  <h4 className={`font-heading text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                    Pontos-chave da Entrevista
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-triagen-secondary-green flex-shrink-0 mt-0.5" />
                      <div>
                        <p className={`font-sans text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                          Pontos Fortes
                        </p>
                        <p className={`font-sans text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                          Comunicação clara, experiência sólida em React, demonstrou proatividade
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Target className="h-5 w-5 text-triagen-highlight-purple flex-shrink-0 mt-0.5" />
                      <div>
                        <p className={`font-sans text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                          Áreas de Desenvolvimento
                        </p>
                        <p className={`font-sans text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                          Poderia aprofundar conhecimentos em TypeScript e testes automatizados
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Brain className="h-5 w-5 text-triagen-primary-blue flex-shrink-0 mt-0.5" />
                      <div>
                        <p className={`font-sans text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                          Recomendação da IA
                        </p>
                        <p className={`font-sans text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                          Candidato promissor para posição júnior/pleno. Agendar entrevista técnica.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`mt-6 p-4 rounded-xl ${
                    darkMode ? 'bg-triagen-secondary-green/10 border border-triagen-secondary-green/20' : 'bg-triagen-secondary-green/10 border border-triagen-secondary-green/30'
                  }`}>
                    <p className={`font-sans text-sm ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                      <strong>Checklist Automático:</strong> Todos os pontos-chave da vaga foram cobertos durante a conversa, 
                      garantindo uma avaliação completa e justa.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer darkMode={darkMode} onJoinWaitlist={handleWaitlistClick} />
    </div>
  );
}

export default LandingPage;