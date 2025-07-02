
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Calendar,
  Building,
  Briefcase
} from 'lucide-react';
import useDarkMode from '../../../hooks/useDarkMode';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../integrations/supabase/client';
import Button from '../../ui/button';
import Card from '../../ui/Card';
import StatusMessage from '../../ui/StatusMessage';
import { Job } from '../../../types/company';

interface JobWithStats extends Job {
  candidatesCount: number;
}

function JobsPage() {
  const [jobs, setJobs] = useState<JobWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { darkMode } = useDarkMode(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      // First get the user's company
      const { data: companies, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user?.id);

      if (companyError) {
        throw companyError;
      }

      if (!companies || companies.length === 0) {
        setJobs([]);
        return;
      }

      const company = companies[0];

      // Get jobs with candidates count
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          *,
          candidates(count)
        `)
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (jobsError) {
        throw jobsError;
      }

      // Transform the data to include candidates count
      const jobsWithStats = (jobsData || []).map(job => ({
        ...job,
        candidatesCount: job.candidates?.[0]?.count || 0
      }));

      setJobs(jobsWithStats);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Erro ao carregar vagas');
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta vaga?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) {
        throw error;
      }

      setJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (err) {
      console.error('Error deleting job:', err);
      setError('Erro ao excluir vaga');
    }
  };

  const toggleJobStatus = async (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'open' ? 'paused' : 'open';
    
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);

      if (error) {
        throw error;
      }

      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: newStatus }
          : job
      ));
    } catch (err) {
      console.error('Error updating job status:', err);
      setError('Erro ao atualizar status da vaga');
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-triagen-secondary-green/20 text-triagen-secondary-green';
      case 'paused': return 'bg-orange-500/20 text-orange-500';
      case 'closed': return 'bg-red-500/20 text-red-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Ativa';
      case 'paused': return 'Pausada';
      case 'closed': return 'Fechada';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return CheckCircle;
      case 'paused': return Clock;
      case 'closed': return XCircle;
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`font-heading text-3xl font-bold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
            Vagas
          </h1>
          <p className={`font-sans mt-2 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
            Gerencie suas oportunidades de emprego
          </p>
        </div>
        
        <Button
          variant="primary"
          onClick={() => navigate('/dashboard/jobs/new')}
          icon={Plus}
          darkMode={darkMode}
          className="bg-triagen-dark-bg hover:bg-triagen-primary-blue"
        >
          Nova Vaga
        </Button>
      </div>

      {/* Filters */}
      <Card darkMode={darkMode}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                darkMode ? 'text-gray-400' : 'text-triagen-text-light'
              }`} />
              <input
                type="text"
                placeholder="Buscar vagas..."
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
          
          <div className="flex gap-4">
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
              <option value="open">Ativas</option>
              <option value="paused">Pausadas</option>
              <option value="closed">Fechadas</option>
            </select>
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

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <Card darkMode={darkMode}>
          <div className="text-center py-12">
            <Briefcase className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-triagen-text-light'}`} />
            <h3 className={`font-heading text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
              {searchTerm || statusFilter !== 'all' ? 'Nenhuma vaga encontrada' : 'Nenhuma vaga criada ainda'}
            </h3>
            <p className={`font-sans mb-6 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              {searchTerm || statusFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando sua primeira vaga de emprego'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button
                variant="primary"
                onClick={() => navigate('/dashboard/jobs/new')}
                icon={Plus}
                darkMode={darkMode}
                className="bg-triagen-dark-bg hover:bg-triagen-primary-blue"
              >
                Criar Primeira Vaga
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const StatusIcon = getStatusIcon(job.status);
            
            return (
              <Card key={job.id} darkMode={darkMode} hoverEffect>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className={`font-heading text-xl font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                        {job.title}
                      </h3>
                      <StatusIcon className="h-4 w-4" />
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(job.status)}`}>
                        {getStatusText(job.status)}
                      </span>
                    </div>
                    
                    <p className={`font-sans text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'} line-clamp-2`}>
                      {job.description}
                    </p>
                    
                    <div className="flex items-center space-x-6 text-sm">
                      <div className={`flex items-center space-x-1 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                        <Users className="h-4 w-4" />
                        <span>{job.candidatesCount} candidatos</span>
                      </div>
                      
                      {job.location && (
                        <div className={`flex items-center space-x-1 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                      )}
                      
                      <div className={`flex items-center space-x-1 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(job.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                      
                      {job.contract_type && (
                        <div className={`flex items-center space-x-1 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                          <Building className="h-4 w-4" />
                          <span className="capitalize">{job.contract_type}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/dashboard/jobs/${job.id}`)}
                      icon={Eye}
                      darkMode={darkMode}
                    >
                      Ver
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/dashboard/jobs/${job.id}/edit`)}
                      icon={Edit}
                      darkMode={darkMode}
                    >
                      Editar
                    </Button>
                    
                    <Button
                      variant={job.status === 'open' ? 'outline' : 'secondary'}
                      size="sm"
                      onClick={() => toggleJobStatus(job.id, job.status)}
                      darkMode={darkMode}
                    >
                      {job.status === 'open' ? 'Pausar' : 'Ativar'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteJob(job.id)}
                      icon={Trash2}
                      darkMode={darkMode}
                      className="text-red-500 hover:text-red-600 border-red-500 hover:border-red-600"
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default JobsPage;
