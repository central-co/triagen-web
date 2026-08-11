import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { ArrowRight, Quote, CheckCircle2 } from 'lucide-react';
import useDarkMode from '../hooks/useDarkMode';
import { useAuth } from '../hooks/useAuth';
import { config } from '../utils/config';
import { submitWaitlistSignup } from '../api';
import Button from './ui/Button';
import PageHeader from './ui/PageHeader';
import Footer from './ui/Footer';
import StatusMessage from './ui/StatusMessage';
import { Input } from './ui/Field';
import { ScoreRing, ScoreMeter } from './ui/Score';

const STEPS = [
  {
    number: '01',
    title: 'Publique a vaga',
    description:
      'Defina requisitos, diferenciais e perguntas de triagem. Compartilhe o link de candidatura onde preferir — o TriaGen cuida do resto.',
  },
  {
    number: '02',
    title: 'A IA entrevista cada candidato',
    description:
      'Cada candidato conversa por voz com a IA no horário que puder, sem agendamento. Ninguém é descartado por falta de palavra-chave no currículo.',
  },
  {
    number: '03',
    title: 'Você decide com contexto',
    description:
      'Para cada entrevista, um relatório com pontuação por critério, trechos da conversa como evidência e uma recomendação objetiva.',
  },
];

const PRINCIPLES = [
  {
    title: 'A IA não decide por você',
    description:
      'Ela conduz a conversa e organiza o que ouviu em evidências. A decisão final é sempre de quem contrata.',
  },
  {
    title: 'Toda avaliação mostra suas fontes',
    description:
      'Cada pontuação vem acompanhada de trechos reais da entrevista. Nada de caixa-preta.',
  },
  {
    title: 'Uma etapa a mais de escuta',
    description:
      'O TriaGen amplia o topo do seu funil — não substitui a entrevista com o seu time.',
  },
];

/** Static, clearly-labeled illustration of the interview report — no real data. */
function ReportSpecimen({ darkMode }: Readonly<{ darkMode: boolean }>) {
  const criteria = [
    { label: 'Comunicação', score: 88 },
    { label: 'Experiência com atendimento', score: 76 },
    { label: 'Disponibilidade', score: 92 },
  ];

  return (
    <div
      className={`rounded-lg border overflow-hidden ${
        darkMode
          ? 'bg-gray-800/40 border-gray-700'
          : 'bg-white border-triagen-border-light shadow-[0_12px_40px_-16px_rgba(44,62,80,0.18)]'
      }`}
      aria-label="Exemplo ilustrativo de relatório de entrevista"
    >
      <div
        className={`px-6 py-3 border-b flex items-center justify-between ${
          darkMode ? 'border-gray-700 bg-gray-800/60' : 'border-triagen-border-light bg-neutral-50'
        }`}
      >
        <span className={`text-[0.6rem] uppercase tracking-widest font-bold ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
          Relatório de entrevista
        </span>
        <span className={`text-[0.6rem] uppercase tracking-widest font-semibold ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Exemplo ilustrativo
        </span>
      </div>

      <div className="p-6 md:p-8">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div className="min-w-0">
            <p className={`font-heading text-2xl leading-tight ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>
              Candidata de exemplo
            </p>
            <p className={`text-[0.65rem] uppercase tracking-widest font-semibold mt-1 ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
              Analista de Atendimento
            </p>
            <span
              className={`inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full border text-xs font-semibold ${
                darkMode
                  ? 'bg-triagen-secondary-green/20 text-emerald-300 border-triagen-secondary-green/30'
                  : 'bg-triagen-sage-tint text-triagen-secondary-green border-triagen-secondary-green/25'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              Avançar
            </span>
          </div>
          <ScoreRing score={84} size="md" darkMode={darkMode} />
        </div>

        <div className="flex flex-col gap-4 mb-6">
          {criteria.map((criterion) => (
            <div key={criterion.label}>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-triagen-primary'}`}>
                  {criterion.label}
                </span>
                <span className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
                  {criterion.score}/100
                </span>
              </div>
              <ScoreMeter score={criterion.score} darkMode={darkMode} />
            </div>
          ))}
        </div>

        <div>
          <p className={`flex items-center gap-1.5 text-[0.6rem] uppercase tracking-widest font-bold mb-2 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>
            <Quote className="w-3 h-3" aria-hidden="true" /> Evidência da conversa
          </p>
          <blockquote
            className={`border-l-2 pl-4 py-0.5 text-sm leading-relaxed italic ${
              darkMode ? 'border-triagen-secondary-green/50 text-gray-400' : 'border-triagen-secondary-green/40 text-triagen-secondary'
            }`}
          >
            “No pico de atendimento, eu priorizava os casos por urgência e mantinha
            o cliente informado do prazo — isso reduziu bastante as reclamações.”
          </blockquote>
        </div>
      </div>
    </div>
  );
}

function LandingPage() {
  const [formData, setFormData] = useState({ name: '', email: '', company: '', job_title: '' });
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  // The waitlist endpoint rejects submissions without a reCAPTCHA token, so the
  // form can only be sent when the site key is configured for this environment.
  const recaptchaSiteKey = config.recaptchaSiteKey;

  const scrollToForm = () => {
    document.getElementById('acesso-antecipado')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      setError('Preencha nome e e-mail para continuar.');
      return;
    }

    if (!newsletterConsent) {
      setError('É necessário aceitar receber comunicações para continuar.');
      return;
    }

    if (!recaptchaSiteKey) {
      setError('A verificação de segurança não está disponível no momento. Escreva para contato@triagen.app e retornamos o contato.');
      return;
    }

    const recaptchaToken = await recaptchaRef.current?.executeAsync();
    if (!recaptchaToken) {
      setError('Falha na verificação de segurança. Tente novamente.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await submitWaitlistSignup({
        email: formData.email,
        name: formData.name,
        company: formData.company || null,
        job_title: formData.job_title || null,
        newsletter_consent: newsletterConsent,
        recaptcha_token: recaptchaToken,
      });

      setIsSubmitted(true);
      setFormData({ name: '', email: '', company: '', job_title: '' });
      setNewsletterConsent(false);
    } catch (err) {
      console.error('Waitlist submission error:', err);
      setError(err instanceof Error ? err.message : 'Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setIsLoading(false);
      recaptchaRef.current?.reset();
    }
  };

  const headerActions = (() => {
    if (loading) {
      return <div className="w-8 h-8 rounded-full border-2 border-triagen-secondary border-t-transparent animate-spin" />;
    }

    if (user) {
      return (
        <Button variant="primary" size="sm" onClick={() => navigate('/dashboard')} icon={ArrowRight}>
          Ir para o painel
        </Button>
      );
    }

    return (
      <>
        <Button variant="ghost" size="sm" darkMode={darkMode} onClick={() => navigate('/interview')}>
          Sou candidato
        </Button>
        <Button variant="secondary" size="sm" darkMode={darkMode} onClick={() => navigate('/auth/login')}>
          Entrar
        </Button>
      </>
    );
  })();

  const sectionEyebrow = (text: string) => (
    <p className={`text-[0.65rem] uppercase tracking-[0.2em] font-bold mb-4 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>
      {text}
    </p>
  );

  return (
    <div className={`min-h-screen font-sans ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-triagen-neutral text-triagen-primary'}`}>
      <PageHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} rightContent={headerActions} />

      <main>
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 md:px-8 pt-20 md:pt-28 pb-20 md:pb-28">
          <div className="max-w-3xl">
            <p className={`rise-in text-[0.65rem] uppercase tracking-[0.2em] font-bold mb-6 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>
              Triagem com entrevistas de voz por IA
            </p>

            <h1
              className={`rise-in rise-in-delay-1 font-heading font-normal tracking-tight text-5xl md:text-7xl leading-[1.05] mb-8 ${
                darkMode ? 'text-white' : 'text-triagen-primary'
              }`}
            >
              A primeira entrevista,<br />
              para <span className="italic text-triagen-secondary-green">todos</span> os candidatos.
            </h1>

            <p className={`rise-in rise-in-delay-2 text-lg md:text-xl leading-relaxed max-w-2xl mb-10 ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
              O TriaGen entrevista por voz cada pessoa que se candidata às suas vagas
              e transforma cada conversa em um relatório comparável — pontuação por
              critério, evidências e uma recomendação clara. A decisão continua sendo sua.
            </p>

            <div className="rise-in rise-in-delay-3 flex flex-col sm:flex-row sm:items-center gap-4">
              <Button variant="primary" size="lg" onClick={scrollToForm} icon={ArrowRight}>
                Quero acesso antecipado
              </Button>
              <Button variant="ghost" size="lg" darkMode={darkMode} onClick={() => navigate('/interview')}>
                Recebi um código de entrevista
              </Button>
            </div>

            <p className={`rise-in rise-in-delay-3 mt-10 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Em fase de piloto com as primeiras empresas.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className={`border-t ${darkMode ? 'border-gray-800' : 'border-triagen-border-light'}`}>
          <div className="max-w-6xl mx-auto px-6 md:px-8 py-20 md:py-24">
            {sectionEyebrow('Como funciona')}
            <h2 className={`font-heading font-normal tracking-tight text-3xl md:text-4xl mb-14 ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>
              Da vaga publicada à decisão, em três etapas.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
              {STEPS.map((step) => (
                <div key={step.number} className={`border-t pt-6 ${darkMode ? 'border-gray-700' : 'border-triagen-primary/20'}`}>
                  <span className={`font-heading text-lg ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {step.number}
                  </span>
                  <h3 className={`font-heading text-xl mt-3 mb-3 ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The report */}
        <section className={`border-t ${darkMode ? 'border-gray-800' : 'border-triagen-border-light'}`}>
          <div className="max-w-6xl mx-auto px-6 md:px-8 py-20 md:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                {sectionEyebrow('O relatório')}
                <h2 className={`font-heading font-normal tracking-tight text-3xl md:text-4xl mb-6 ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>
                  Cada entrevista vira um documento de decisão.
                </h2>
                <p className={`text-base md:text-lg leading-relaxed mb-8 ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
                  Em vez de uma pilha de currículos, você recebe relatórios com a mesma
                  estrutura para todos os candidatos — fáceis de comparar e de justificar.
                </p>
                <ul className="flex flex-col gap-4">
                  {[
                    ['Recomendação objetiva', 'Avançar, avançar com ressalvas ou não avançar — sem ambiguidade.'],
                    ['Pontuação por critério', 'Os critérios vêm da sua vaga, não de uma régua genérica.'],
                    ['Evidências reais', 'Cada avaliação cita trechos do que o candidato disse na conversa.'],
                  ].map(([title, description]) => (
                    <li key={title} className="flex items-start gap-3">
                      <span className={`mt-[0.55rem] w-1.5 h-1.5 rounded-full shrink-0 ${darkMode ? 'bg-emerald-400' : 'bg-triagen-secondary-green'}`} />
                      <p className={`text-sm md:text-base leading-relaxed ${darkMode ? 'text-gray-300' : 'text-triagen-primary'}`}>
                        <strong className="font-semibold">{title}.</strong>{' '}
                        <span className={darkMode ? 'text-gray-400' : 'text-triagen-secondary'}>{description}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <ReportSpecimen darkMode={darkMode} />
            </div>
          </div>
        </section>

        {/* Principles */}
        <section className={`border-t ${darkMode ? 'border-gray-800' : 'border-triagen-border-light'}`}>
          <div className="max-w-6xl mx-auto px-6 md:px-8 py-20 md:py-24">
            {sectionEyebrow('Princípios')}
            <h2 className={`font-heading font-normal tracking-tight text-3xl md:text-4xl mb-14 ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>
              O que guia o produto.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
              {PRINCIPLES.map((principle) => (
                <div key={principle.title}>
                  <h3 className={`font-heading text-xl italic mb-3 ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>
                    {principle.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
                    {principle.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Early access */}
        <section
          id="acesso-antecipado"
          className={`border-t scroll-mt-16 ${darkMode ? 'border-gray-800' : 'border-triagen-border-light'}`}
        >
          <div className="max-w-6xl mx-auto px-6 md:px-8 py-20 md:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
              <div>
                {sectionEyebrow('Acesso antecipado')}
                <h2 className={`font-heading font-normal tracking-tight text-3xl md:text-4xl mb-6 ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>
                  Estamos abrindo o TriaGen para um primeiro grupo de empresas.
                </h2>
                <p className={`text-base md:text-lg leading-relaxed ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
                  Deixe seu contato e conversamos sobre o seu processo seletivo —
                  sem compromisso. Você acompanha de perto e ajuda a moldar o produto.
                </p>
              </div>

              <div className={`rounded-lg border p-6 md:p-8 ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-triagen-border-light'}`}>
                {isSubmitted ? (
                  <div className="py-6 text-center">
                    <div className={`w-14 h-14 mx-auto mb-5 rounded-full flex items-center justify-center ${darkMode ? 'bg-triagen-secondary-green/20' : 'bg-triagen-sage-tint'}`}>
                      <CheckCircle2 className={`h-7 w-7 ${darkMode ? 'text-emerald-300' : 'text-triagen-secondary-green'}`} aria-hidden="true" />
                    </div>
                    <h3 className={`font-heading text-2xl mb-3 ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>
                      Contato recebido
                    </h3>
                    <p className={`text-sm leading-relaxed max-w-sm mx-auto ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
                      Obrigado pelo interesse. Enviamos uma confirmação para o seu
                      e-mail e entraremos em contato em breve.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Input
                        label="Nome completo *"
                        id="name"
                        name="name"
                        darkMode={darkMode}
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Seu nome"
                        autoComplete="name"
                        disabled={isLoading}
                        required
                      />
                      <Input
                        label="E-mail corporativo *"
                        id="email"
                        name="email"
                        type="email"
                        darkMode={darkMode}
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="voce@empresa.com"
                        autoComplete="email"
                        disabled={isLoading}
                        required
                      />
                      <Input
                        label="Empresa"
                        id="company"
                        name="company"
                        darkMode={darkMode}
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Nome da empresa"
                        autoComplete="organization"
                        disabled={isLoading}
                      />
                      <Input
                        label="Cargo"
                        id="job_title"
                        name="job_title"
                        darkMode={darkMode}
                        value={formData.job_title}
                        onChange={handleInputChange}
                        placeholder="Seu cargo"
                        autoComplete="organization-title"
                        disabled={isLoading}
                      />
                    </div>

                    <label htmlFor="newsletter_consent" className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        id="newsletter_consent"
                        checked={newsletterConsent}
                        onChange={(e) => setNewsletterConsent(e.target.checked)}
                        className="mt-0.5 h-4 w-4 accent-[#3F7A5E] shrink-0"
                        disabled={isLoading}
                        required
                      />
                      <span className={`text-xs leading-relaxed ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
                        Aceito receber comunicações do TriaGen sobre o acesso antecipado. *
                      </span>
                    </label>

                    {recaptchaSiteKey && (
                      <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={recaptchaSiteKey}
                        size="invisible"
                        theme={darkMode ? 'dark' : 'light'}
                      />
                    )}

                    {error && <StatusMessage type="error" message={error} darkMode={darkMode} />}

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      fullWidth
                      isLoading={isLoading}
                      disabled={!formData.name || !formData.email || !newsletterConsent || !recaptchaSiteKey}
                      icon={ArrowRight}
                    >
                      {isLoading ? 'Enviando...' : 'Solicitar acesso'}
                    </Button>

                    <p className={`text-[0.65rem] leading-relaxed text-center ${recaptchaSiteKey ? '' : 'hidden'} ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Protegido por reCAPTCHA — aplicam-se a{' '}
                      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70">
                        Política de Privacidade
                      </a>{' '}
                      e os{' '}
                      <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70">
                        Termos de Serviço
                      </a>{' '}
                      do Google.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default LandingPage;
