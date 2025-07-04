import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, StarOff, Eye, Download, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
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
}

interface CandidateWithJob extends Candidate {
  job: Job;
}

function CandidatesPage() {
  const [candidates, setCandidates] = useState<CandidateWithJob[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [jobFilter, setJobFilter] = useState<string>('all');
  const [favoriteFilter, setFavoriteFilter] = useState<boolean | null>(null);
  const { darkMode } = useDarkMode(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        setError('Usuário não encontrado');
        return;
      }
      
      // First get the user's company
      const { data: companies, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id);

      if (companyError) {
        throw companyError;
      }

      // If no company exists, set empty data and return
      if (!companies || companies.length === 0) {
        setCandidates([]);
        setJobs([]);
        return;
      }

      const company = companies[0];

      // Get jobs for dropdown filter
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('id, title')
        .eq('company_id', company.id)
        .order('title');

      if (jobsError) {
        throw jobsError;
      }

      setJobs(jobsData || []);

      // Get candidates with job information
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select(`
          *,
          job:jobs(*)
        `)
        .in('job_id', (jobsData || []).map(job => job.id))
        .order('created_at', { ascending: false });

      if (candidatesError) {
        throw candidatesError;
      }

      // Transform the data to match our interface
      const transformedCandidates = (candidatesData || []).map(candidate => ({
        ...candidate,
        phone: candidate.phone || undefined, // Convert null to undefined
        resume_url: candidate.resume_url || undefined, // Convert null to undefined
        notes: candidate.notes || undefined, // Convert null to undefined
        interview_token: candidate.interview_token || undefined, // Convert null to undefined
        interview_started_at: candidate.interview_started_at || undefined, // Convert null to undefined
        interview_completed_at: candidate.interview_completed_at || undefined, // Convert null to undefined
        status: (candidate.status || 'pending') as 'pending' | 'interviewed' | 'completed' | 'rejected' | 'hired', // Convert null to 'pending' and cast to proper type
        is_favorite: candidate.is_favorite || false, // Convert null to false
        created_at: candidate.created_at || new Date().toISOString(), // Convert null to current timestamp
        updated_at: candidate.updated_at || new Date().toISOString(), // Convert null to current timestamp
        job: candidate.job
      }));

      setCandidates(transformedCandidates);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Erro ao carregar candidatos');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (candidateId: string, currentFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ is_favorite: !currentFavorite })
        .eq('id', candidateId);

      if (error) {
        throw error;
      }

      setCandidates(prev => prev.map(candidate => 
        candidate.id === candidateId 
          ? { ...candidate, is_favorite: !currentFavorite }
          : candidate
      ));
    } catch (err) {
      console.error('Error updating favorite:', err);
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
    const matchesJob = jobFilter === 'all' || candidate.job_id === jobFilter;
    const matchesFavorite = favoriteFilter === null || candidate.is_favorite === favoriteFilter;
    
    return matchesSearch && matchesStatus && matchesJob && matchesFavorite;
  });

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className={`font-heading text-3xl font-bold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
          Candidatos
        </h1>
        <p className={`font-sans mt-2 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
          Gerencie e avalie todos os candidatos das suas vagas
        </p>
      </div>

      {/* Filters */}
      <Card darkMode={darkMode}>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                  darkMode ? 'text-gray-400' : 'text-triagen-text-light'
                }`} />
                <input
                  type="text"
                  placeholder="Buscar candidatos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`font-sans w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                    darkMode
                      ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                      : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`font-sans px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                darkMode
                  ? 'bg-gray-800/50 border-triagen-border-dark text-white'
                  : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg'
              }`}
            >
              <option value="all">Todos os status</option>
              <option value="pending">Pendentes</option>
              <option value="interviewed">Entrevistados</option>
              <option value="completed">Concluídos</option>
              <option value="rejected">Rejeitados</option>
              <option value="hired">Contratados</option>
            </select>

            <select
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className={`font-sans px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                darkMode
                  ? 'bg-gray-800/50 border-triagen-border-dark text-white'
                  : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg'
              }`}
            >
              <option value="all">Todas as vagas</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>

            <select
              value={favoriteFilter === null ? 'all' : favoriteFilter ? 'favorites' : 'not-favorites'}
              onChange={(e) => {
                const value = e.target.value;
                setFavoriteFilter(value === 'all' ? null : value === 'favorites');
              }}
              className={`font-sans px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                darkMode
                  ? 'bg-gray-800/50 border-triagen-border-dark text-white'
                  : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg'
              }`}
            >
              <option value="all">Todos</option>
              <option value="favorites">Favoritos</option>
              <option value="not-favorites">Não favoritos</option>
            </select>

            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setJobFilter('all');
                setFavoriteFilter(null);
              }}
              darkMode={darkMode}
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <StatusMessage
          type="error"
          message={error}
          darkMode={darkMode}
        />
      )}

      {/* Candidates List */}
      {filteredCandidates.length === 0 ? (
        <Card darkMode={darkMode}>
          <div className="text-center py-12">
            <Users className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-triagen-text-light'}`} />
            <h3 className={`font-heading text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
              {searchTerm || statusFilter !== 'all' || jobFilter !== 'all' || favoriteFilter !== null 
                ? 'Nenhum candidato encontrado' 
                : 'Nenhum candidato ainda'
              }
            </h3>
            <p className={`font-sans mb-6 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              {searchTerm || statusFilter !== 'all' || jobFilter !== 'all' || favoriteFilter !== null
                ? 'Tente ajustar os filtros de busca'
                : 'Os candidatos aparecerão aqui quando se inscreverem nas suas vagas'
              }
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCandidates.map((candidate) => {
            const StatusIcon = getStatusIcon(candidate.status);
            
            return (
              <Card key={candidate.id} darkMode={darkMode} hoverEffect>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className={`font-heading text-lg font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                          {candidate.name}
                        </h3>
                        <Button
                          variant={candidate.is_favorite ? "favorite-toggle" : "ghost"}
                          size="sm"
                          onClick={() => toggleFavorite(candidate.id, candidate.is_favorite)}
                          icon={candidate.is_favorite ? Star : StarOff}
                          iconPosition="left"
                          darkMode={darkMode}
                          className="p-1"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <span className={`${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                          {candidate.email}
                        </span>
                        <span className={`${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                          {candidate.job.title}
                        </span>
                        <span className={`${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                          {new Date(candidate.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <StatusIcon className="h-4 w-4" />
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(candidate.status)}`}>
                        {getStatusText(candidate.status)}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/dashboard/candidates/${candidate.id}`)}
                        icon={Eye}
                        darkMode={darkMode}
                      >
                        Ver Perfil
                      </Button>
                      
                      {candidate.status === 'completed' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/dashboard/candidates/${candidate.id}/report`)}
                          icon={Download}
                          darkMode={darkMode}
                        >
                          Relatório
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {candidate.notes && (
                  <div className={`mt-4 pt-4 border-t ${
                    darkMode ? 'border-triagen-border-dark' : 'border-triagen-border-light'
                  }`}>
                    <p className={`font-sans text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                      <strong>Observações:</strong> {candidate.notes}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CandidatesPage;