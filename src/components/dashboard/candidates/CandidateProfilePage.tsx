import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Briefcase,
  Calendar,
  Star,
  StarOff,
  Edit,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import useDarkMode from '../../../hooks/useDarkMode';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../integrations/supabase/client';
import Button from '../../ui/button';
import Card from '../../ui/Card';
import StatusMessage from '../../ui/StatusMessage';
import { Candidate } from '../../../types/company';

interface Job {
  id: string;
  title: string;
  description: string;
  company: {
    id: string; // Added id field
    name: string;
  };
}

interface CandidateWithJob extends Candidate {
  job: Job;
}

function CandidateProfilePage() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<CandidateWithJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);
  const { darkMode } = useDarkMode(true);
  const { user } = useAuth();

  useEffect(() => {
    if (candidateId && user) {
      fetchCandidate();
    }
  }, [candidateId, user]);

  const fetchCandidate = async () => {
    try {
      setLoading(true);
      
      if (!user?.id || !candidateId) {
        throw new Error('Dados necessários não encontrados');
      }
      
      // First get the user's company
      const { data: companies, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id);

      if (companyError) {
        throw companyError;
      }

      if (!companies || companies.length === 0) {
        throw new Error('Empresa não encontrada');
      }

      // Get candidate with job information - FIXED: Added company id to the query
      const { data: candidateData, error: candidateError } = await supabase
        .from('candidates')
        .select(`
          *,
          job:jobs(
            id,
            title,
            description,
            company:companies(
              id,
              name
            )
          )
        `)
        .eq('id', candidateId)
        .single();

      if (candidateError) {
        throw candidateError;
      }

      if (!candidateData) {
        throw new Error('Candidato não encontrado');
      }

      // Verify that this candidate belongs to a job from the user's company
      if (candidateData.job.company.id !== companies[0].id) {
        throw new Error('Acesso negado');
      }

      // Transform the data to match our interface
      const transformedCandidate: CandidateWithJob = {
        ...candidateData,
        phone: candidateData.phone || undefined,
        resume_url: candidateData.resume_url || undefined,
        notes: candidateData.notes || undefined,
        interview_token: candidateData.interview_token || undefined,
        interview_started_at: candidateData.interview_started_at || undefined,
        interview_completed_at: candidateData.interview_completed_at || undefined,
        status: (candidateData.status || 'pending') as 'pending' | 'interviewed' | 'completed' | 'rejected' | 'hired',
        is_favorite: candidateData.is_favorite || false,
        created_at: candidateData.created_at || new Date().toISOString(),
        updated_at: candidateData.updated_at || new Date().toISOString(),
        job: candidateData.job
      };

      setCandidate(transformedCandidate);
    } catch (err) {
      console.error('Error fetching candidate:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar candidato');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!candidate) return;
    
    setIsUpdatingFavorite(true);
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ is_favorite: !candidate.is_favorite })
        .eq('id', candidate.id);

      if (error) {
        throw error;
      }

      setCandidate(prev => prev ? { ...prev, is_favorite: !prev.is_favorite } : null);
    } catch (err) {
      console.error('Error updating favorite:', err);
    } finally {
      setIsUpdatingFavorite(false);
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

  if (error || !candidate) {
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate('/dashboard/candidates')}
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
          title="Candidato não encontrado"
          message={error || 'O candidato solicitado não foi encontrado'}
          darkMode={darkMode}
        />
      </div>
    );
  }

  const StatusIcon = getStatusIcon(candidate.status);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate('/dashboard/candidates')}
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            darkMode={darkMode}
          >
            Voltar
          </Button>
          <div>
            <h1 className={`font-heading text-3xl font-bold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
              Perfil do Candidato
            </h1>
            <p className={`font-sans mt-2 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              Informações detalhadas e histórico
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant={candidate.is_favorite ? "favorite-toggle" : "outline"}
            size="sm"
            onClick={toggleFavorite}
            isLoading={isUpdatingFavorite}
            icon={candidate.is_favorite ? Star : StarOff}
            darkMode={darkMode}
          >
            {candidate.is_favorite ? 'Favorito' : 'Favoritar'}
          </Button>

          {candidate.status === 'completed' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/dashboard/candidates/${candidate.id}/report`)}
              icon={FileText}
            >
              Ver Relatório
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card darkMode={darkMode}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  darkMode ? 'bg-triagen-secondary-green' : 'bg-triagen-dark-bg'
                }`}>
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className={`font-heading text-2xl font-bold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                    {candidate.name}
                  </h2>
                  <p className={`font-sans ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                    Candidato para: {candidate.job.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <StatusIcon className="h-5 w-5" />
                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(candidate.status)}`}>
                  {getStatusText(candidate.status)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <Mail className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`} />
                <div>
                  <p className={`font-sans text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                    Email
                  </p>
                  <p className={`font-sans font-medium ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                    {candidate.email}
                  </p>
                </div>
              </div>

              {candidate.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`} />
                  <div>
                    <p className={`font-sans text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                      Telefone
                    </p>
                    <p className={`font-sans font-medium ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                      {candidate.phone}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Calendar className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`} />
                <div>
                  <p className={`font-sans text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                    Data de Candidatura
                  </p>
                  <p className={`font-sans font-medium ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                    {new Date(candidate.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {candidate.interview_completed_at && (
                <div className="flex items-center space-x-3">
                  <CheckCircle className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`} />
                  <div>
                    <p className={`font-sans text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                      Entrevista Concluída
                    </p>
                    <p className={`font-sans font-medium ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                      {new Date(candidate.interview_completed_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Resume Text */}
          {candidate.resume_text && (
            <Card darkMode={darkMode}>
              <div className="flex items-center space-x-3 mb-4">
                <FileText className={`h-5 w-5 ${darkMode ? 'text-triagen-secondary-green' : 'text-triagen-primary-blue'}`} />
                <h3 className={`font-heading text-lg font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                  Resumo do Currículo
                </h3>
              </div>
              <div className={`p-4 rounded-xl ${
                darkMode ? 'bg-gray-800/30' : 'bg-triagen-light-bg/30'
              }`}>
                <p className={`font-sans leading-relaxed ${darkMode ? 'text-gray-300' : 'text-triagen-text-dark'}`}>
                  {candidate.resume_text}
                </p>
              </div>
            </Card>
          )}

          {/* Custom Answers */}
          {candidate.custom_answers && Object.keys(candidate.custom_answers).length > 0 && (
            <Card darkMode={darkMode}>
              <div className="flex items-center space-x-3 mb-4">
                <MessageSquare className={`h-5 w-5 ${darkMode ? 'text-triagen-secondary-green' : 'text-triagen-primary-blue'}`} />
                <h3 className={`font-heading text-lg font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                  Respostas Personalizadas
                </h3>
              </div>
              <div className="space-y-4">
                {Object.entries(candidate.custom_answers as Record<string, any>).map(([question, answer], index) => (
                  <div key={index} className={`p-4 rounded-xl ${
                    darkMode ? 'bg-gray-800/30' : 'bg-triagen-light-bg/30'
                  }`}>
                    <p className={`font-sans font-medium mb-2 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                      {question}
                    </p>
                    <p className={`font-sans ${darkMode ? 'text-gray-300' : 'text-triagen-text-dark'}`}>
                      {typeof answer === 'string' ? answer : JSON.stringify(answer)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Notes */}
          {candidate.notes && (
            <Card darkMode={darkMode}>
              <div className="flex items-center space-x-3 mb-4">
                <Edit className={`h-5 w-5 ${darkMode ? 'text-triagen-secondary-green' : 'text-triagen-primary-blue'}`} />
                <h3 className={`font-heading text-lg font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                  Observações
                </h3>
              </div>
              <div className={`p-4 rounded-xl ${
                darkMode ? 'bg-gray-800/30' : 'bg-triagen-light-bg/30'
              }`}>
                <p className={`font-sans leading-relaxed ${darkMode ? 'text-gray-300' : 'text-triagen-text-dark'}`}>
                  {candidate.notes}
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Job Info & Actions */}
        <div className="space-y-6">
          {/* Job Information */}
          <Card darkMode={darkMode}>
            <div className="flex items-center space-x-3 mb-4">
              <Briefcase className={`h-5 w-5 ${darkMode ? 'text-triagen-secondary-green' : 'text-triagen-primary-blue'}`} />
              <h3 className={`font-heading text-lg font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                Informações da Vaga
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className={`font-sans text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                  Título da Vaga
                </p>
                <p className={`font-sans font-medium ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                  {candidate.job.title}
                </p>
              </div>
              
              <div>
                <p className={`font-sans text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                  Empresa
                </p>
                <p className={`font-sans font-medium ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                  {candidate.job.company.name}
                </p>
              </div>
              
              <div>
                <p className={`font-sans text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                  Descrição
                </p>
                <p className={`font-sans text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-triagen-text-dark'}`}>
                  {candidate.job.description}
                </p>
              </div>
            </div>
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
                onClick={() => navigate(`/dashboard/jobs/${candidate.job_id}`)}
                icon={Briefcase}
                darkMode={darkMode}
              >
                Ver Vaga Completa
              </Button>
              
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={() => navigate(`/dashboard/candidates?job=${candidate.job_id}`)}
                icon={User}
                darkMode={darkMode}
              >
                Outros Candidatos
              </Button>
              
              {candidate.status === 'completed' && (
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => navigate(`/dashboard/candidates/${candidate.id}/report`)}
                  icon={FileText}
                >
                  Ver Relatório Completo
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CandidateProfilePage;