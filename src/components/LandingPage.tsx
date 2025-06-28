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
  Shield,
  FileText,
  CheckCircle,
  BarChart3,
  Heart,
  Mic,
  UserCheck,
  Clock,
  Download
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
    { icon: Users, value: '2.5K+', label: 'Candidatos ouvidos', iconColor: 'from-triagen-petrol to-blue-600' },
    { icon: Building, value: '50+', label: 'Empresas parceiras', iconColor: 'from-triagen-mint to-green-500' },
    { icon: Clock, value: '80%', label: 'Redução no tempo de triagem', iconColor: 'from-triagen-salmon to-red-500' },
    { icon: Heart, value: '95%', label: 'Satisfação dos candidatos', iconColor: 'from-purple-500 to-pink-500' }
  ];

  const features = [
    {
      icon: Mic,
      title: 'Escuta Empática e Inclusiva',
      description: 'Nossa IA conversa com cada candidato de forma natural e acessível, garantindo que todas as vozes sejam ouvidas, independente do perfil ou background.',
      iconColor: 'from-triagen-petrol to-blue-600'
    },
    {
      icon: Brain,
      title: 'Contexto Primeiro, Não Apenas Palavras-chave',
      description: 'Análise profunda que vai além do currículo, entendendo a compatibilidade real entre candidato e vaga através de conversas estruturadas.',
      iconColor: 'from-triagen-mint to-green-500'
    },
    {
      icon: UserCheck,
      title: 'Etapa Adicional, Não Substituta',
      description: 'Amplificamos seu funil de candidatos e entregamos apenas os perfis com maior fit, poupando horas de trabalho manual sem substituir o toque humano.',
      iconColor: 'from-triagen-salmon to-red-500'
    }
  ];

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-triagen-light'}`}>
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
                : 'bg-white/30 border-triagen-petrol/20 text-triagen-petrol'
            }`}>
              <Heart className="h-4 w-4 mr-2 text-triagen-salmon" />
              Democratizando a escuta no recrutamento
            </div>
            
            <h1 className={`font-heading text-5xl md:text-7xl font-bold mb-8 transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-triagen-petrol'
            }`}>
              Para quem acredita que{' '}
              <span className="bg-gradient-to-r from-triagen-mint to-triagen-salmon bg-clip-text text-transparent">
                recrutar bem começa por ouvir
              </span>
            </h1>
            
            <p className={`font-sans text-xl md:text-2xl mb-12 transition-colors duration-300 leading-relaxed ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
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
                className="text-lg px-8 py-4 bg-gradient-to-r from-triagen-petrol to-blue-600 hover:from-triagen-petrol/90 hover:to-blue-600/90"
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
                    ? 'border-triagen-mint/50 text-triagen-mint hover:bg-triagen-mint/10' 
                    : 'border-triagen-salmon/50 text-triagen-salmon hover:bg-triagen-salmon/10'
                }`}
              >
                Piloto Acadêmico (R$200)
              </Button>
            </div>

            {/* Waitlist Form */}
            {showWaitlistForm && (
              <div id="waitlist-form" className="mt-16 max-w-md mx-auto">
                <Card darkMode={darkMode} hoverEffect>
                  {isSubmitted ? (
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-triagen-mint to-green-500 flex items-center justify-center">
                        <Mail className="h-8 w-8 text-white" />
                      </div>
                      
                      <h3 className={`font-heading text-xl font-bold mb-4 transition-colors duration-300 ${
                        darkMode ? 'text-white' : 'text-triagen-petrol'
                      }`}>
                        Obrigado por se inscrever!
                      </h3>
                      
                      <p className={`font-sans mb-6 transition-colors duration-300 ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Você foi adicionado à nossa lista. Verifique seu email para confirmação.
                      </p>
                      
                      <Button
                        variant="primary"
                        size="md"
                        onClick={handleCloseForm}
                        className="w-full bg-gradient-to-r from-triagen-petrol to-blue-600"
                      >
                        Fechar
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-6">
                        <div className="text-center flex-1">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-triagen-petrol to-blue-600 flex items-center justify-center">
                            <User className="h-8 w-8 text-white" />
                          </div>
                          
                          <h3 className={`font-heading text-xl font-bold mb-2 transition-colors duration-300 ${
                            darkMode ? 'text-white' : 'text-triagen-petrol'
                          }`}>
                            Comece a Ouvir Mais
                          </h3>
                          
                          <p className={`font-sans text-sm transition-colors duration-300 ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Teste grátis ou piloto acadêmico
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
                            darkMode ? 'text-gray-300' : 'text-triagen-petrol'
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
                            className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-mint/50 focus:border-triagen-mint ${
                              darkMode
                                ? 'bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400'
                                : 'bg-white/50 border-gray-300/50 text-triagen-petrol placeholder-gray-500'
                            }`}
                            disabled={isLoading}
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="email" className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                            darkMode ? 'text-gray-300' : 'text-triagen-petrol'
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
                            className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-mint/50 focus:border-triagen-mint ${
                              darkMode
                                ? 'bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400'
                                : 'bg-white/50 border-gray-300/50 text-triagen-petrol placeholder-gray-500'
                            }`}
                            disabled={isLoading}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="company" className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                              darkMode ? 'text-gray-300' : 'text-triagen-petrol'
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
                              className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-mint/50 focus:border-triagen-mint ${
                                darkMode
                                  ? 'bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400'
                                  : 'bg-white/50 border-gray-300/50 text-triagen-petrol placeholder-gray-500'
                              }`}
                              disabled={isLoading}
                            />
                          </div>

                          <div>
                            <label htmlFor="job_title" className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                              darkMode ? 'text-gray-300' : 'text-triagen-petrol'
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
                              className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-mint/50 focus:border-triagen-mint ${
                                darkMode
                                  ? 'bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400'
                                  : 'bg-white/50 border-gray-300/50 text-triagen-petrol placeholder-gray-500'
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
                            className="mt-1 h-4 w-4 text-triagen-mint focus:ring-triagen-mint border-gray-300 rounded"
                            disabled={isLoading}
                            required
                          />
                          <label htmlFor="newsletter_consent" className={`font-sans text-sm transition-colors duration-300 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Aceito receber comunicações sobre o TriaGen e concordo com os{' '}
                            <a href="#" className="text-triagen-mint hover:text-triagen-mint/80 underline">
                              termos de uso
                            </a>
                            {' '}e{' '}
                            <a href="#" className="text-triagen-mint hover:text-triagen-mint/80 underline">
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
                          darkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          This site is protected by reCAPTCHA and the Google{' '}
                          <a 
                            href="https://policies.google.com/privacy" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-triagen-mint hover:text-triagen-mint/80 underline"
                          >
                            Privacy Policy
                          </a>
                          {' '}and{' '}
                          <a 
                            href="https://policies.google.com/terms" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-triagen-mint hover:text-triagen-mint/80 underline"
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
                          className="bg-gradient-to-r from-triagen-petrol to-blue-600"
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
                    <h3 className={`font-heading text-xl font-bold ${darkMode ? 'text-white' : 'text-triagen-petrol'}`}>
                      Análise do Candidato
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-triagen-mint to-green-500 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">8.7</span>
                      </div>
                      <span className={`font-sans text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Compatibilidade
                      </span>
                    </div>
                  </div>

                  {/* Competências */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`font-sans text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-triagen-petrol'}`}>
                          Comunicação
                        </span>
                        <span className="text-triagen-mint text-sm font-bold">Excelente</span>
                      </div>
                      <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div className="h-full bg-gradient-to-r from-triagen-mint to-green-500 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`font-sans text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-triagen-petrol'}`}>
                          Experiência Técnica
                        </span>
                        <span className="text-triagen-salmon text-sm font-bold">Muito Bom</span>
                      </div>
                      <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div className="h-full bg-gradient-to-r from-triagen-salmon to-red-500 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`font-sans text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-triagen-petrol'}`}>
                          Fit Cultural
                        </span>
                        <span className="text-blue-500 text-sm font-bold">Excelente</span>
                      </div>
                      <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div className="h-full bg-gradient-to-r from-triagen-petrol to-blue-600 rounded-full" style={{ width: '95%' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex space-x-3">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Download}
                      className="bg-gradient-to-r from-triagen-petrol to-blue-600"
                    >
                      Baixar PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={BarChart3}
                      darkMode={darkMode}
                      className={darkMode ? 'border-triagen-mint/50 text-triagen-mint' : 'border-triagen-salmon/50 text-triagen-salmon'}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </div>

                {/* Right side - Key insights */}
                <div>
                  <h4 className={`font-heading text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-triagen-petrol'}`}>
                    Pontos-chave da Entrevista
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-triagen-mint flex-shrink-0 mt-0.5" />
                      <div>
                        <p className={`font-sans text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-triagen-petrol'}`}>
                          Pontos Fortes
                        </p>
                        <p className={`font-sans text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Comunicação clara, experiência sólida em React, demonstrou proatividade
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Target className="h-5 w-5 text-triagen-salmon flex-shrink-0 mt-0.5" />
                      <div>
                        <p className={`font-sans text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-triagen-petrol'}`}>
                          Áreas de Desenvolvimento
                        </p>
                        <p className={`font-sans text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Poderia aprofundar conhecimentos em TypeScript e testes automatizados
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Brain className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className={`font-sans text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-triagen-petrol'}`}>
                          Recomendação da IA
                        </p>
                        <p className={`font-sans text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Candidato promissor para posição júnior/pleno. Agendar entrevista técnica.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`mt-6 p-4 rounded-xl ${
                    darkMode ? 'bg-triagen-mint/10 border border-triagen-mint/20' : 'bg-triagen-mint/10 border border-triagen-mint/30'
                  }`}>
                    <p className={`font-sans text-sm ${darkMode ? 'text-gray-300' : 'text-triagen-petrol'}`}>
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