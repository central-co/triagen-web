import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, FileText } from 'lucide-react';
import useDarkMode from '../../../hooks/useDarkMode';
import { supabase } from '../../../integrations/supabase/client';
import { createApplication } from '../../../api/application';
import Button from '../../ui/Button';
import Card from '../../ui/Card';
import StatusMessage from '../../ui/StatusMessage';
import AnimatedBackground from '../../ui/AnimatedBackground';
import PageHeader from '../../ui/PageHeader';
import { JobWithCompany } from '../../../types/company';

function JobApplicationPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobWithCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { darkMode } = useDarkMode(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    resume_url: '',
    resume_text: '',
    pre_interview_answers: {} as Record<string, string>
  });

  useEffect(() => {
    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  useEffect(() => {
    console.log('JobApplicationPage mounted');
    console.log('jobId from URL:', jobId);
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('API URL from env:', import.meta.env.VITE_API_URL);
  }, []);

  const fetchJob = async () => {
    console.log('Fetching job with ID:', jobId);

    if (!jobId) {
      setError('ID da vaga não fornecido na URL');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Buscar vaga com dados da empresa (JOIN)
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          company:companies(
            id,
            name,
            contact_email,
            address
          )
        `)
        .eq('id', jobId)
        .eq('status', 'open')
        .maybeSingle();

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        setError(`Erro ao carregar vaga: ${error.message}`);
        return;
      }

      if (!data) {
        setError('Vaga não encontrada ou não está mais disponível.');
        return;
      }

      // Transform to match JobWithCompany interface
      // Parse JSONB fields that might be stored as strings
      const parseJsonbField = (field: any): any[] | null => {
        if (!field) return null;
        if (Array.isArray(field)) return field;
        if (typeof field === 'string') {
          try {
            const parsed = JSON.parse(field);
            return Array.isArray(parsed) ? parsed : null;
          } catch {
            return null;
          }
        }
        return null;
      };

      const transformedJob: JobWithCompany = {
        id: data.id,
        title: data.title,
        description: data.description,
        location: data.location || undefined,
        work_model: data.work_model,
        mandatory_requirements: parseJsonbField(data.mandatory_requirements),
        desirable_requirements: parseJsonbField(data.desirable_requirements),
        salary_range: data.salary_range || undefined,
        benefits: data.benefits || undefined,
        pre_interview_questions: parseJsonbField(data.pre_interview_questions) as Array<{ id: number; question: string }> | null,
        company: data.company as {
          id: string;
          name: string;
          contact_email?: string;
          address?: string;
        }
      };

      console.log('Job loaded successfully:', transformedJob);
      setJob(transformedJob);
    } catch (err) {
      console.error('Error fetching job:', err);
      setError('Erro inesperado ao carregar vaga.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
    let formatted = digits;
    if (digits.length > 10) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    } else if (digits.length > 6) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    } else if (digits.length > 2) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else if (digits.length > 0) {
      formatted = `(${digits}`;
    }
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      setError('Nome e email são obrigatórios');
      return;
    }

    // Validate pre-interview questions — all are required
    if (job?.pre_interview_questions) {
      for (const q of job.pre_interview_questions) {
        if (!formData.pre_interview_answers[String(q.id)]?.trim()) {
          setError(`A pergunta "${q.question}" é obrigatória`);
          return;
        }
      }
    }

    setSubmitting(true);
    setError('');

    try {
      // Preparar payload no formato esperado pelo backend (flat structure com snake_case)
      if (!jobId) throw new Error('ID da vaga não encontrado');

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        job_id: jobId,
        resume_text: formData.resume_text || undefined,
        pre_interview_answers: Object.keys(formData.pre_interview_answers).length > 0
          ? formData.pre_interview_answers
          : undefined
      };

      console.log('Enviando payload para API:', payload);

      await createApplication(payload);
      setSuccess(true);
    } catch (err) {
      console.error('Error submitting application:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao enviar candidatura. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-triagen-light-bg'}`}>
        <AnimatedBackground darkMode={darkMode} />
        <PageHeader darkMode={darkMode} />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-triagen-primary-blue"></div>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-triagen-light-bg'}`}>
        <AnimatedBackground darkMode={darkMode} />
        <PageHeader darkMode={darkMode} />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <Card darkMode={darkMode}>
            <StatusMessage
              type="error"
              title="Vaga não encontrada"
              message={error}
              darkMode={darkMode}
            />
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate('/')}
              icon={ArrowLeft}
              iconPosition="left"
            >
              Voltar ao Início
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-triagen-light-bg'}`}>
        <AnimatedBackground darkMode={darkMode} />
        <PageHeader darkMode={darkMode} />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <Card darkMode={darkMode}>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-triagen-secondary-green flex items-center justify-center">
                <Send className="h-10 w-10 text-white" />
              </div>

              <h1 className={`font-heading text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                Candidatura Enviada!
              </h1>

              <p className={`font-sans mb-6 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                Sua candidatura foi processada com sucesso! Nossa IA está preparando uma entrevista personalizada para você.
              </p>

              <StatusMessage
                type="info"
                title="Próximos passos"
                message="Você receberá um e-mail com o link para sua entrevista em breve. Verifique sua caixa de entrada e spam."
                darkMode={darkMode}
              />

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => navigate('/')}
                icon={ArrowLeft}
                iconPosition="left"
              >
                Voltar ao Início
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-triagen-light-bg'}`}>
      <AnimatedBackground darkMode={darkMode} />
      <PageHeader darkMode={darkMode} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Job Info */}
        <Card darkMode={darkMode} className="mb-8">
          <div className="text-center">
            <h1 className={`font-heading text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
              {job?.title}
            </h1>
            <div className="flex items-center justify-center space-x-4 text-sm mb-6">
              <span className={`${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                📍 {job?.work_model === 'remoto' ? 'Remoto' : job?.work_model === 'hibrido' ? 'Híbrido' : 'Presencial'}
                {job?.location && ` • ${job.location}`}
              </span>
              {job?.company && (
                <span className={`${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                  🏢 {job.company.name}
                </span>
              )}
            </div>
            <p className={`font-sans ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'} leading-relaxed mb-6`}>
              {job?.description}
            </p>

            {/* Requirements and Differentials */}
            {(job?.mandatory_requirements && job.mandatory_requirements.length > 0) || (job?.desirable_requirements && job.desirable_requirements.length > 0) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {job?.mandatory_requirements && job.mandatory_requirements.length > 0 && (
                  <div className={`p-4 rounded-xl ${
                    darkMode ? 'bg-gray-800/30' : 'bg-triagen-light-bg/30'
                  }`}>
                    <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                      ✅ Requisitos Obrigatórios
                    </h3>
                    <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                      {job.mandatory_requirements.map((req, index) => (
                        <li key={index}>• {req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {job?.desirable_requirements && job.desirable_requirements.length > 0 && (
                  <div className={`p-4 rounded-xl ${
                    darkMode ? 'bg-gray-800/30' : 'bg-triagen-light-bg/30'
                  }`}>
                    <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                      ⭐ Diferenciais Desejáveis
                    </h3>
                    <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                      {job.desirable_requirements.map((diff, index) => (
                        <li key={index}>• {diff}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}

            {/* Salary and Benefits */}
            {(job?.salary_range || job?.benefits) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {job.salary_range && (
                  <div className={`p-4 rounded-xl ${
                    darkMode ? 'bg-gray-800/30' : 'bg-triagen-light-bg/30'
                  }`}>
                    <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                      💰 Faixa Salarial
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                      {job.salary_range}
                    </p>
                  </div>
                )}

                {job.benefits && (
                  <div className={`p-4 rounded-xl ${
                    darkMode ? 'bg-gray-800/30' : 'bg-triagen-light-bg/30'
                  }`}>
                    <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                      🎁 Benefícios
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                      {job.benefits}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Application Form */}
        <Card darkMode={darkMode}>
          <h2 className={`font-heading text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
            Candidate-se à Vaga
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                  Nome Completo *
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
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
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
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                Telefone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="(11) 99999-9999"
                className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                  darkMode
                    ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                    : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                }`}
              />
            </div>

            {/* Resume Text */}
            <div>
              <label htmlFor="resume_text" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                <FileText className="h-4 w-4 inline mr-1" />
                Resumo do seu Currículo (Opcional)
              </label>
              <textarea
                id="resume_text"
                name="resume_text"
                value={formData.resume_text}
                onChange={handleInputChange}
                placeholder="Descreva brevemente sua experiência profissional, formação e principais habilidades..."
                rows={4}
                className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green resize-none ${
                  darkMode
                    ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                    : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                }`}
              />
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-triagen-text-light'}`}>
                Essas informações ajudarão nossa IA a personalizar a entrevista para você
              </p>
            </div>

            {/* Pre-Interview Questions */}
            {job?.pre_interview_questions && job.pre_interview_questions.length > 0 && (
              <div className="space-y-4">
                <h3 className={`font-heading text-lg font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                  Perguntas da Vaga
                </h3>
                {job.pre_interview_questions.map((q) => (
                  <div key={q.id}>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                      {q.question} *
                    </label>
                    <textarea
                      value={formData.pre_interview_answers[String(q.id)] || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        pre_interview_answers: { ...prev.pre_interview_answers, [String(q.id)]: e.target.value }
                      }))}
                      rows={2}
                      className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green resize-none ${
                        darkMode
                          ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                          : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                      }`}
                      placeholder="Sua resposta..."
                    />
                  </div>
                ))}
              </div>
            )}

            {error && (
              <StatusMessage
                type="error"
                message={error}
                darkMode={darkMode}
              />
            )}

            <StatusMessage
              type="info"
              title="Próximo passo: Entrevista Personalizada com IA"
              message="Após enviar sua candidatura, nossa IA analisará seu perfil e criará uma entrevista personalizada. Você receberá um e-mail com o link para a entrevista."
              darkMode={darkMode}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={submitting}
              disabled={!formData.name || !formData.email}
              icon={Send}
              iconPosition="left"
            >
              {submitting ? 'Processando...' : 'Enviar Candidatura'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default JobApplicationPage;
