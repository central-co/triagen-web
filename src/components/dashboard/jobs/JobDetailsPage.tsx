import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  MapPin, 
  Users, 
  Calendar,
  DollarSign,
  Gift,
  Target,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Download
} from 'lucide-react';
import useDarkMode from '../../../hooks/useDarkMode';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../integrations/supabase/client';
import Button from '../../ui/button';
import Card from '../../ui/Card';
import StatusMessage from '../../ui/StatusMessage';
import { JobWithStats } from '../../../types/company';
import { Candidate } from '../../../types/company';

interface JobWithCompany extends JobWithStats {
  company: {
    id: string;
    name: string;
  };
}

interface CandidateWithStatus extends Candidate {
  job: {
    title: string;
  };
}

function JobDetailsPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobWithCompany | null>(null);
  const [candidates, setCandidates] = useState<CandidateWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { darkMode } = useDarkMode(true);
  const { user } = useAuth();

  useEffect(() => {
    if (jobId && user) {
      fetchJobDetails();
    }
  }, [jobId, user]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      
      if (!user?.id || !jobId) {
        throw new Error('Dados necessários não encontrados');
      }
      
      // First get the user's company
      const { data: companies, error: companyError } = await supabase
        .from('companies')
        .select('id, name')
        .eq('user_id', user.id);

      if (companyError) {
        throw companyError;
      }

      if (!companies || companies.length === 0) {
        throw new Error('Empresa não encontrada');
      }

      const company = companies[0];

      // Get job details with candidate count
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select(`
          *,
          candidates(count)
        `)
        .eq('id', jobId)
        .eq('company_id', company.id)
        .single();

      if (jobError) {
        throw jobError;
      }

      if (!jobData) {
        throw new Error('Vaga não encontrada');
      }

      // Transform job data
      const transformedJob: JobWithCompany = {
        ...jobData,
        location: jobData.location || undefined,
        custom_fields: jobData.custom_fields ? jobData.custom_fields as Record<string, any> : null,
        requirements: jobData.requirements ? (Array.isArray(jobData.requirements) ? jobData.requirements as string[] : JSON.parse(jobData.requirements as string)) : null,
        differentials: jobData.differentials ? (Array.isArray(jobData.differentials) ? jobData.differentials as string[] : JSON.parse(jobData.differentials as string)) : null,
        custom_questions: jobData.custom_questions ? (Array.isArray(jobData.custom_questions) ? jobData.custom_questions : JSON.parse(jobData.custom_questions as string)) : null,
        evaluation_criteria: jobData.evaluation_criteria ? (Array.isArray(jobData.evaluation_criteria) ? jobData.evaluation_criteria : JSON.parse(jobData.evaluation_criteria as string)) : null,
        candidatesCount: jobData.candidates?.[0]?.count || 0,
        candidates: jobData.candidates,
        status: (jobData.status as 'open' | 'closed' | 'paused') || 'open',
        created_at: jobData.created_at || new Date().toISOString(),
        updated_at: jobData.updated_at || new Date().toISOString(),
        company: company
      };

      setJob(transformedJob);

      // Get candidates for this job
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select(`
          *,
          job:jobs(title)
        `)
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (candidatesError) {
        throw candidatesError;
      }

      // Transform candidates data
      const transformedCandidates: CandidateWithStatus[] = (candidatesData || []).map(candidate => ({
        ...candidate,
        phone: candidate.phone || undefined,
        resume_url: candidate.resume_url || undefined,
        notes: candidate.notes || undefined,
        interview_token: candidate.interview_token || undefined,
        interview_started_at: candidate.interview_started_at || undefined,
        interview_completed_at: candidate.interview_completed_at || undefined,
        status: (candidate.status || 'pending') as 'pending' | 'interviewed' | 'completed' | 'rejected' | 'hired',
        is_favorite: candidate.is_favorite || false,
        created_at: candidate.created_at || new Date().toISOString(),
        updated_at: candidate.updated_at || new Date().toISOString(),
        job: candidate.job
      }));

      setCandidates(transformedCandidates);
    } catch (err) {
      console.error('Error fetching job details:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar detalhes da vaga');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-triagen-secondary-green/20 text-triagen-secondary-green';
      case 'interviewed': return 'bg-triagen-primary-blue/20 text-triagen-primary-blue';
      case 'pending': return 'bg-orange-500/20 text-orange-500';
      case 'rejected': return 'bg-red-500/20 text-red-500';
      case 'hired': return 'bg-purple-500/20 text-purple-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'interviewed': return 'Entrevistado';
      case 'pending': return 'Pendente';
      case 'rejected': return 'Rejeitado';
      case 'hired': return 'Contratado';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'interviewed': return Eye;
      case 'pending': return Clock;
      case 'rejected': return XCircle;
      case 'hired': return CheckCircle;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-triagen-primary-blue"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate('/dashboard/jobs')}
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            darkMode={darkMode}
          >
            Voltar
          </Button>
        </div>
        
        <StatusMessage
          type="error"
          title="Vaga não encontrada"
          message={error || 'A vaga solicitada não foi encontrada'}
          darkMode={darkMode}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate('/dashboard/jobs')}
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            darkMode={darkMode}
          >
            Voltar
          </Button>
          <div>
            <h1 className={`font-heading text-3xl font-bold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
              {job.title}
            </h1>
            <p className={`font-sans mt-2 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              {job.company.name} • {job.candidatesCount} candidatos
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            job.status === 'open'
              ? 'bg-green-100 text-green-800'
              : job.status === 'paused'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {job.status === 'open' ? 'Aberta' : job.status === 'paused' ? 'Pausada' : 'Fechada'}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => alert('Funcionalidade de edição será implementada em breve')}
            icon={Edit}
            darkMode={darkMode}
          >
            Editar Vaga
          </Button>
        </div>
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Job Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card darkMode={darkMode}>
            <h2 className={`font-heading text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
              Descrição da Vaga
            </h2>
            <p className={`font-sans leading-relaxed mb-6 ${darkMode ? 'text-gray-300' : 'text-triagen-text-dark'}`}>
              {job.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {job.location && (
                <div className="flex items-center space-x-3">
                  <MapPin className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`} />
                  <div>
                    <p className={`font-sans text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                      Localização
                    </p>
                    <p className={`font-sans font-medium ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                      {job.location}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Users className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`} />
                <div>
                  <p className={`font-sans text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                    Modelo de Trabalho
                  </p>
                  <p className={`font-sans font-medium ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                    {job.work_model === 'remoto' ? 'Remoto' : job.work_model === 'hibrido' ? 'Híbrido' : 'Presencial'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`} />
                <div>
                  <p className={`font-sans text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                    Data de Criação
                  </p>
                  <p className={`font-sans font-medium ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                    {new Date(job.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {job.deadline && (
                <div className="flex items-center space-x-3">
                  <Clock className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`} />
                  <div>
                    <p className={`font-sans text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                      Prazo Final
                    </p>
                    <p className={`font-sans font-medium ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                      {new Date(job.deadline).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Requirements and Differentials */}
          {((job.requirements && job.requirements.length > 0) || (job.differentials && job.differentials.length > 0)) && (
            <Card darkMode={darkMode}>
              <h2 className={`font-heading text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                Requisitos e Diferenciais
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {job.requirements && job.requirements.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Target className={`h-5 w-5 ${darkMode ? 'text-triagen-secondary-green' : 'text-triagen-primary-blue'}`} />
                      <h3 className={`font-heading text-lg font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                        Requisitos Obrigatórios
                      </h3>
                    </div>
                    <ul className={`space-y-2 ${darkMode ? 'text-gray-300' : 'text-triagen-text-dark'}`}>
                      {job.requirements.map((req, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-triagen-secondary-green">•</span>
                          <span className="font-sans">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {job.differentials && job.differentials.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Star className={`h-5 w-5 ${darkMode ? 'text-triagen-highlight-purple' : 'text-triagen-highlight-purple'}`} />
                      <h3 className={`font-heading text-lg font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                        Diferenciais Desejáveis
                      </h3>
                    </div>
                    <ul className={`space-y-2 ${darkMode ? 'text-gray-300' : 'text-triagen-text-dark'}`}>
                      {job.differentials.map((diff, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-triagen-highlight-purple">•</span>
                          <span className="font-sans">{diff}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Salary and Benefits */}
          {(job.salary_range || job.benefits) && (
            <Card darkMode={darkMode}>
              <h2 className={`font-heading text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                Remuneração e Benefícios
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {job.salary_range && (
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <DollarSign className={`h-5 w-5 ${darkMode ? 'text-triagen-secondary-green' : 'text-triagen-primary-blue'}`} />
                      <h3 className={`font-heading text-lg font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                        Faixa Salarial
                      </h3>
                    </div>
                    <p className={`font-sans ${darkMode ? 'text-gray-300' : 'text-triagen-text-dark'}`}>
                      {job.salary_range}
                    </p>
                  </div>
                )}

                {job.benefits && (
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Gift className={`h-5 w-5 ${darkMode ? 'text-triagen-highlight-purple' : 'text-triagen-highlight-purple'}`} />
                      <h3 className={`font-heading text-lg font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                        Benefícios
                      </h3>
                    </div>
                    <p className={`font-sans ${darkMode ? 'text-gray-300' : 'text-triagen-text-dark'}`}>
                      {job.benefits}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Candidates */}
        <div className="space-y-6">
          <Card darkMode={darkMode}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-heading text-lg font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                Candidatos ({candidates.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/dashboard/candidates?job=${job.id}`)}
                darkMode={darkMode}
              >
                Ver Todos
              </Button>
            </div>

            {candidates.length === 0 ? (
              <div className="text-center py-8">
                <Users className={`h-12 w-12 mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-triagen-text-light'}`} />
                <p className={`font-sans text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                  Nenhum candidato ainda
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {candidates.slice(0, 5).map((candidate) => {
                  const StatusIcon = getStatusIcon(candidate.status);
                  
                  return (
                    <div
                      key={candidate.id}
                      className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-101 ${
                        darkMode 
                          ? 'border-triagen-border-dark bg-gray-800/30 hover:bg-gray-800/50' 
                          : 'border-triagen-border-light bg-triagen-light-bg/30 hover:bg-triagen-light-bg/50'
                      }`}
                      onClick={() => navigate(`/dashboard/candidates/${candidate.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className={`font-sans font-medium text-sm ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                              {candidate.name}
                            </h4>
                            {candidate.is_favorite && (
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <p className={`font-sans text-xs ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                            {candidate.email}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <StatusIcon className="h-3 w-3" />
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(candidate.status)}`}>
                            {getStatusText(candidate.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {candidates.length > 5 && (
                  <div className="text-center pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/dashboard/candidates?job=${job.id}`)}
                      darkMode={darkMode}
                    >
                      Ver mais {candidates.length - 5} candidatos
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card darkMode={darkMode}>
            <h3 className={`font-heading text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
              Ações Rápidas
            </h3>
            
            <div className="space-y-3">
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={() => navigate('/dashboard/reports')}
                icon={Download}
                darkMode={darkMode}
              >
                Ver Relatórios
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default JobDetailsPage;