
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  Eye,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Star,
  CheckCircle
} from 'lucide-react';
import useDarkMode from '../../../hooks/useDarkMode';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../integrations/supabase/client';
import Button from '../../ui/button';
import Card from '../../ui/Card';
import StatusMessage from '../../ui/StatusMessage';

interface Report {
  id: string;
  candidate_name: string;
  job_title: string;
  overall_score: number;
  created_at: string;
  alignment_analysis: string;
  summary: string;
  category_scores: Record<string, number>;
}

function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('date');
  const { darkMode } = useDarkMode(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
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
        setReports([]);
        return;
      }

      const company = companies[0];

      // Get reports with candidate and job information
      const { data: reportsData, error: reportsError } = await supabase
        .from('interview_reports')
        .select(`
          *,
          candidate:candidates(
            name,
            job:jobs(title)
          )
        `)
        .in('candidate_id', 
          await supabase
            .from('candidates')
            .select('id')
            .in('job_id', 
              await supabase
                .from('jobs')
                .select('id')
                .eq('company_id', company.id)
                .then(({ data }) => (data || []).map(job => job.id))
            )
            .then(({ data }) => (data || []).map(candidate => candidate.id))
        )
        .order('created_at', { ascending: false });

      if (reportsError) {
        throw reportsError;
      }

      // Transform the data
      const transformedReports = (reportsData || []).map(report => ({
        id: report.id,
        candidate_name: report.candidate?.name || 'Nome não disponível',
        job_title: report.candidate?.job?.title || 'Vaga não disponível',
        overall_score: report.overall_score || 0,
        created_at: report.created_at || '',
        alignment_analysis: report.alignment_analysis || '',
        summary: report.summary || '',
        category_scores: report.category_scores || {}
      }));

      setReports(transformedReports);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.job_title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return b.overall_score - a.overall_score;
      case 'name':
        return a.candidate_name.localeCompare(b.candidate_name);
      case 'job':
        return a.job_title.localeCompare(b.job_title);
      case 'date':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-triagen-secondary-green';
    if (score >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-triagen-secondary-green/20';
    if (score >= 60) return 'bg-orange-500/20';
    return 'bg-red-500/20';
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
          Relatórios
        </h1>
        <p className={`font-sans mt-2 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
          Visualize e analise os resultados das entrevistas
        </p>
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
                placeholder="Buscar relatórios..."
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
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`font-sans px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                darkMode
                  ? 'bg-gray-800/50 border-triagen-border-dark text-white'
                  : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg'
              }`}
            >
              <option value="date">Data</option>
              <option value="score">Pontuação</option>
              <option value="name">Nome</option>
              <option value="job">Vaga</option>
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

      {/* Reports List */}
      {sortedReports.length === 0 ? (
        <Card darkMode={darkMode}>
          <div className="text-center py-12">
            <FileText className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-triagen-text-light'}`} />
            <h3 className={`font-heading text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
              {searchTerm ? 'Nenhum relatório encontrado' : 'Nenhum relatório disponível'}
            </h3>
            <p className={`font-sans mb-6 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              {searchTerm 
                ? 'Tente ajustar os filtros de busca'
                : 'Os relatórios aparecerão aqui após as entrevistas serem concluídas'
              }
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedReports.map((report) => (
            <Card key={report.id} darkMode={darkMode} hoverEffect>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <h3 className={`font-heading text-lg font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                      {report.candidate_name}
                    </h3>
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${getScoreBg(report.overall_score)}`}>
                      <Star className={`h-4 w-4 ${getScoreColor(report.overall_score)}`} />
                      <span className={`text-sm font-medium ${getScoreColor(report.overall_score)}`}>
                        {report.overall_score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm mb-3">
                    <span className={`${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                      📋 {report.job_title}
                    </span>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                      📅 {new Date(report.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  {report.summary && (
                    <p className={`font-sans text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'} line-clamp-2`}>
                      {report.summary}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/dashboard/reports/${report.id}`)}
                    icon={Eye}
                    darkMode={darkMode}
                  >
                    Ver Detalhes
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      // Download report functionality
                      console.log('Download report:', report.id);
                    }}
                    icon={Download}
                    darkMode={darkMode}
                  >
                    Download
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {sortedReports.length > 0 && (
        <Card darkMode={darkMode}>
          <h2 className={`font-heading text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
            Estatísticas Gerais
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                {sortedReports.length}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                Total de Relatórios
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                {(sortedReports.reduce((acc, report) => acc + report.overall_score, 0) / sortedReports.length).toFixed(1)}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                Pontuação Média
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold text-triagen-secondary-green`}>
                {sortedReports.filter(report => report.overall_score >= 80).length}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                Pontuação Alta (≥80)
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                {Math.max(...sortedReports.map(report => report.overall_score)).toFixed(1)}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                Melhor Pontuação
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default ReportsPage;
