import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Bot,
  TrendingUp,
  Star,
  ArrowRight,
  Sparkles,
  Building,
  Target,
  Brain
} from 'lucide-react';
import useDarkMode from '../hooks/useDarkMode';
import AnimatedBackground from './ui/AnimatedBackground';
import Button from './ui/button';
import PageHeader from './ui/PageHeader';
import SectionHeader from './ui/SectionHeader';
import FeatureCard from './ui/FeatureCard';
import StatCard from './ui/StatCard';
import Footer from './ui/Footer';

function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const { darkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStartInterview = () => {
    navigate('/interview');
  };

  const handleWaitlistClick = () => {
    // Temporarily disabled - do nothing
    console.log('Waitlist functionality temporarily disabled');
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