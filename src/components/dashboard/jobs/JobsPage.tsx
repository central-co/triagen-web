import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Briefcase,
  MapPin,
  Clock,
  Users
} from 'lucide-react';
import useDarkMode from '../../../hooks/useDarkMode';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../integrations/supabase/client';
import Button from '../../ui/button';
import Card from '../../ui/Card';
import StatusMessage from '../../ui/StatusMessage';
import { JobWithStats } from '../../../types/company';

function JobsPage() {
  const [jobs, setJobs] = useState<JobWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
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
      
      if (!user?.id) {
        throw new Error('User not found');
      }
      
      // Get user's company
      const { data: companies, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id);

      if (companyError) {
        throw companyError;
      }

      if (!companies || companies.length === 0) {
        setJobs([]);
        return;
      }

      const company = companies[0];

      // Get jobs with candidate count
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

      // Transform the data to match JobWithStats interface
      const transformedJobs: JobWithStats[] = (jobsData || []).map(job => ({
        ...job,
        location: job.location || undefined,
        custom_fields: job.custom_fields ? job.custom_fields as Record<string, any> : null,
        requirements: job.requirements ? (Array.isArray(job.requirements) ? job.requirements as string[] : JSON.parse(job.requirements as string)) : null,
        differentials: job.differentials ? (Array.isArray(job.differentials) ? job.differentials as string[] : JSON.parse(job.differentials as string)) : null,
        custom_questions: job.custom_questions ? (Array.isArray(job.custom_questions) ? job.custom_questions : JSON.parse(job.custom_questions as string)) : null,
        candidatesCount: job.candidates?.[0]?.count || 0,
        candidates: job.candidates,
        status: (job.status as 'open' | 'closed' | 'paused') || 'open',
        created_at: job.created_at || new Date().toISOString(),
        updated_at: job.updated_at || new Date().toISOString()
      }));

      setJobs(transformedJobs);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Erro ao carregar vagas');
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

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
          onClick={() => navigate('/dashboard/jobs/new')}
          variant="primary"
          icon={Plus}
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
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <StatusMessage
          type="error"
          message="Erro ao carregar vagas"
          darkMode={darkMode}
        />
      )}

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <Card darkMode={darkMode}>
          <div className="text-center py-12">
            <Briefcase className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-triagen-text-light'}`} />
            <h3 className={`font-heading text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
              Nenhuma vaga encontrada
            </h3>
            <p className={`font-sans mb-6 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              Comece criando sua primeira oportunidade de emprego
            </p>
            <Button
              onClick={() => navigate('/dashboard/jobs/new')}
              variant="primary"
              icon={Plus}
              className="bg-triagen-dark-bg hover:bg-triagen-primary-blue"
            >
              Criar Primeira Vaga
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} darkMode={darkMode} hoverEffect>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className={`font-heading text-xl font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                      {job.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.status === 'open'
                        ? 'bg-green-100 text-green-800'
                        : job.status === 'paused'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {job.status === 'open' ? 'Aberta' : job.status === 'paused' ? 'Pausada' : 'Fechada'}
                    </span>
                  </div>
                  <p className={`font-sans text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'} line-clamp-2`}>
                    {job.description}
                  </p>
                  <div className="flex items-center space-x-6 text-sm">
                    {job.location && (
                      <div className={`flex items-center space-x-1 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                    )}
                    <div className={`flex items-center space-x-1 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                      <Users className="h-4 w-4" />
                      <span>{job.candidatesCount} candidatos</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                      <Clock className="h-4 w-4" />
                      <span>{new Date(job.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/dashboard/candidates?job=${job.id}`)}
                    darkMode={darkMode}
                  >
                    Ver Candidatos
                  </Button>
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
