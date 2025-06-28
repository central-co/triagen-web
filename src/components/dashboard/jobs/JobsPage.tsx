import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, MoreVertical, Users, Calendar, MapPin, Briefcase, Copy, ExternalLink, Check } from 'lucide-react';
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
  const [copiedJobId, setCopiedJobId] = useState<string | null>(null);
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

      // If no company exists, set empty jobs and return
      if (!companies || companies.length === 0) {
        setJobs([]);
        return;
      }

      const company = companies[0];

      // Then get jobs for that company with candidate count
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

      setJobs(jobsData || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Erro ao carregar vagas');
    } finally {
      setLoading(false);
    }
  };

  const copyJobLink = async (jobId: string) => {
    const baseUrl = window.location.origin;
    const jobLink = `${baseUrl}/apply/${jobId}`;
    
    try {
      await navigator.clipboard.writeText(jobLink);
      setCopiedJobId(jobId);
      setTimeout(() => setCopiedJobId(null), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const openJobLink = (jobId: string) => {
    const baseUrl = window.location.origin;
    const jobLink = `${baseUrl}/apply/${jobId}`;
    window.open(jobLink, '_blank');
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
        <div className="space-y-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} darkMode={darkMode} hoverEffect>
              <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
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
                      <div className={`flex items-center space-x-1 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                        <Users className="h-4 w-4" />
                        <span>{(job as any).candidates?.[0]?.count || 0} candidatos</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(job.status)}`}>
                      {getStatusText(job.status)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className={`font-sans text-sm line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                  {job.description}
                </p>

                {/* Job Application Link */}
                <div className={`p-4 rounded-xl border ${
                  darkMode ? 'border-triagen-border-dark bg-gray-800/30' : 'border-triagen-border-light bg-triagen-light-bg/30'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`font-semibold text-sm mb-1 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                        Link para Candidatura
                      </h4>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                        Compartilhe este link para que candidatos se inscrevam
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyJobLink(job.id)}
                        icon={copiedJobId === job.id ? Check : Copy}
                        darkMode={darkMode}
                        className={copiedJobId === job.id ? 'border-triagen-secondary-green text-triagen-secondary-green' : ''}
                      >
                        {copiedJobId === job.id ? 'Copiado!' : 'Copiar'}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openJobLink(job.id)}
                        icon={ExternalLink}
                        darkMode={darkMode}
                      >
                        Abrir
                      </Button>
                    </div>
                  </div>
                  
                  <div className={`mt-3 p-2 rounded-lg text-xs font-mono break-all ${
                    darkMode ? 'bg-gray-900/50 text-gray-300' : 'bg-white/50 text-triagen-text-dark'
                  }`}>
                    {window.location.origin}/apply/{job.id}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-inherit">
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

                  {job.deadline && (
                    <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-triagen-text-light'}`}>
                      Prazo: {new Date(job.deadline).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default JobsPage;