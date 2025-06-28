import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Upload, Send, ArrowLeft } from 'lucide-react';
import useDarkMode from '../../../hooks/useDarkMode';
import { supabase } from '../../../lib/supabase';
import Button from '../../ui/button';
import Card from '../../ui/card';
import StatusMessage from '../../ui/StatusMessage';
import AnimatedBackground from '../../ui/AnimatedBackground';
import PageHeader from '../../ui/PageHeader';
import { Job } from '../../../types/company';

function JobApplicationPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
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
    custom_answers: {} as Record<string, any>
  });

  useEffect(() => {
    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .eq('status', 'open')
        .single();

      if (jobError) {
        throw jobError;
      }

      setJob(jobData);
    } catch (err) {
      console.error('Error fetching job:', err);
      setError('Vaga não encontrada ou não está mais disponível');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      custom_answers: {
        ...prev.custom_answers,
        [fieldId]: value
      }
    }));
  };

  const generateSecureInterviewToken = async (candidateId: string): Promise<string> => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(`${supabaseUrl}/functions/v1/generate-interview-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        candidate_id: candidateId
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate interview token');
    }

    const data = await response.json();
    return data.interview_token;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      setError('Nome e email são obrigatórios');
      return;
    }

    // Validate required custom fields
    if (job?.custom_fields) {
      const customFields = Object.entries(job.custom_fields);
      for (const [fieldId, field] of customFields) {
        if ((field as any).required && !formData.custom_answers[fieldId]) {
          setError(`O campo "${(field as any).label}" é obrigatório`);
          return;
        }
      }
    }

    setSubmitting(true);
    setError('');

    try {
      // Create candidate first without token
      const { data: candidate, error: candidateError } = await supabase
        .from('candidates')
        .insert({
          job_id: jobId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          resume_url: formData.resume_url || null,
          status: 'pending'
        })
        .select()
        .single();

      if (candidateError) {
        throw candidateError;
      }

      // Generate secure interview token using edge function
      const interviewToken = await generateSecureInterviewToken(candidate.id);

      setSuccess(true);
      
      // Redirect to interview after a delay
      setTimeout(() => {
        navigate(`/interview/${interviewToken}`);
      }, 3000);

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
              className="mt-4 bg-triagen-dark-bg hover:bg-triagen-primary-blue"
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
                Sua candidatura foi enviada com sucesso. Você será redirecionado para a entrevista com nossa IA em alguns segundos.
              </p>

              <StatusMessage
                type="info"
                message="Prepare-se para uma conversa natural com nossa IA. Ela fará perguntas sobre sua experiência e adequação à vaga."
                darkMode={darkMode}
              />
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
              {job?.location && (
                <span className={`${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                  📍 {job.location}
                </span>
              )}
              <span className={`${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                💼 {job?.contract_type}
              </span>
            </div>
            <p className={`font-sans ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'} leading-relaxed`}>
              {job?.description}
            </p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                  Telefone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(11) 99999-9999"
                  className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                    darkMode
                      ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                      : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                  }`}
                />
              </div>

              <div>
                <label htmlFor="resume_url" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                  Link do Currículo
                </label>
                <input
                  type="url"
                  id="resume_url"
                  name="resume_url"
                  value={formData.resume_url}
                  onChange={handleInputChange}
                  placeholder="https://drive.google.com/..."
                  className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                    darkMode
                      ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                      : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                  }`}
                />
              </div>
            </div>

            {/* Custom Fields */}
            {job?.custom_fields && Object.keys(job.custom_fields).length > 0 && (
              <div className="space-y-4">
                <h3 className={`font-heading text-lg font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                  Informações Adicionais
                </h3>
                
                {Object.entries(job.custom_fields).map(([fieldId, field]) => {
                  const fieldData = field as any;
                  
                  return (
                    <div key={fieldId}>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                        {fieldData.label} {fieldData.required && '*'}
                      </label>
                      
                      {fieldData.type === 'text' && (
                        <input
                          type="text"
                          value={formData.custom_answers[fieldId] || ''}
                          onChange={(e) => handleCustomFieldChange(fieldId, e.target.value)}
                          className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                            darkMode
                              ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                              : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                          }`}
                          required={fieldData.required}
                        />
                      )}
                      
                      {fieldData.type === 'select' && (
                        <select
                          value={formData.custom_answers[fieldId] || ''}
                          onChange={(e) => handleCustomFieldChange(fieldId, e.target.value)}
                          className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                            darkMode
                              ? 'bg-gray-800/50 border-triagen-border-dark text-white'
                              : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg'
                          }`}
                          required={fieldData.required}
                        >
                          <option value="">Selecione...</option>
                          {fieldData.options?.map((option: string) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  );
                })}
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
              title="Próximo passo: Entrevista com IA"
              message="Após enviar sua candidatura, você será direcionado para uma entrevista com nossa IA. A conversa dura cerca de 15-20 minutos e é totalmente automatizada."
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
              className="bg-triagen-dark-bg hover:bg-triagen-primary-blue"
            >
              {submitting ? 'Enviando...' : 'Enviar Candidatura'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default JobApplicationPage;