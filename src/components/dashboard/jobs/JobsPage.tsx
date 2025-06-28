import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, MoreVertical, Users, Calendar, MapPin, Briefcase } from 'lucide-react';
import useDarkMode from '../../../hooks/useDarkMode';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../lib/supabase';
import Button from '../../ui/button';
import Card from '../../ui/card';
import StatusMessage from '../../ui/StatusMessage';
import { Job } from '../../../types/company';

function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
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
        .eq('user_id', user?.id)
        .single();

      if (companyError) {
        throw companyError;
      }

      // Then get jobs for that company
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          *,
          candidates(count)
        `)
        .eq('company_id', companies.id)
        .order('created_at', { ascending: false });

      if (jobsError) {
        throw jobsError;
      }

      setJobs(jobsData || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Erro ao carregar vagas');
    } finally {
      setLoading(false);
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
      case 'closed': return 'bg-gray-500/20 text-gray-500';
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`font-heading text-3xl font-bold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
            Vagas
          </h1>
          <p className={`font-sans mt-2 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
            Gerencie suas vagas e acompanhe candidatos
          </p>
        </div>
        
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/dashboard/jobs/new')}
          icon={Plus}
          iconPosition="left"
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
          
          <div className="flex items-center space-x-3">
            <Filter className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`} />
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
              {searchTerm || statusFilter !== 'all' ? 'Nenhuma vaga encontrada' : 'Nenhuma vaga criada'}
            </h3>
            <p className={`font-sans mb-6 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              {searchTerm || statusFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando sua primeira vaga para atrair candidatos'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/dashboard/jobs/new')}
                icon={Plus}
                iconPosition="left"
                className="bg-triagen-dark-bg hover:bg-triagen-primary-blue"
              >
                Criar Primeira Vaga
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} darkMode={darkMode} hoverEffect>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className={`font-heading text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                    {job.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm">
                    {job.location && (
                      <div className={`flex items-center space-x-1 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                    )}
                    <div className={`flex items-center space-x-1 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                      <Calendar className="h-4 w-4" />
                      <span>{job.contract_type}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(job.status)}`}>
                    {getStatusText(job.status)}
                  </span>
                  <button className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    darkMode ? 'text-gray-400' : 'text-triagen-text-light'
                  }`}>
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className={`font-sans text-sm mb-4 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                {job.description}
              </p>

              <div className="flex items-center justify-between">
                <div className={`flex items-center space-x-2 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                  <Users className="h-4 w-4" />
                  <span className="font-sans text-sm">
                    {(job as any).candidates?.[0]?.count || 0} candidatos
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/dashboard/jobs/${job.id}/candidates`)}
                    darkMode={darkMode}
                  >
                    Ver Candidatos
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/dashboard/jobs/${job.id}/edit`)}
                    darkMode={darkMode}
                  >
                    Editar
                  </Button>
                </div>
              </div>

              {job.deadline && (
                <div className={`mt-4 pt-4 border-t ${
                  darkMode ? 'border-triagen-border-dark' : 'border-triagen-border-light'
                }`}>
                  <p className={`font-sans text-xs ${darkMode ? 'text-gray-500' : 'text-triagen-text-light'}`}>
                    Prazo: {new Date(job.deadline).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default JobsPage;