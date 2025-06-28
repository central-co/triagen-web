import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Download, Eye, TrendingUp, Users, Clock, Star } from 'lucide-react';
import useDarkMode from '../../../hooks/useDarkMode';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../lib/supabase';
import Button from '../../ui/button';
import Card from '../../ui/card';
import StatusMessage from '../../ui/StatusMessage';
import StatCard from '../../ui/StatCard';
import { InterviewReport, Candidate, Job } from '../../../types/company';

interface ReportWithCandidate extends InterviewReport {
  candidate: Candidate & { job: Job };
}

function ReportsPage() {
  const [reports, setReports] = useState<ReportWithCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalReports: 0,
    averageScore: 0,
    topPerformers: 0,
    completionRate: 0
  });
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
        .eq('user_id', user?.id)
        .single();

      if (companyError) {
        throw companyError;
      }

      // Get reports with candidate and job information
      const { data: reportsData, error: reportsError } = await supabase
        .from('interview_reports')
        .select(`
          *,
          candidate:candidates(
            *,
            job:jobs(*)
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
                .eq('company_id', companies.id)
                .then(({ data }) => (data || []).map(job => job.id))
            )
            .then(({ data }) => (data || []).map(candidate => candidate.id))
        )
        .order('created_at', { ascending: false });

      if (reportsError) {
        throw reportsError;
      }

      const reports = reportsData || [];
      setReports(reports);

      // Calculate stats
      const totalReports = reports.length;
      const scoresWithValues = reports.filter(r => r.overall_score !== null);
      const averageScore = scoresWithValues.length > 0 
        ? scoresWithValues.reduce((sum, r) => sum + (r.overall_score || 0), 0) / scoresWithValues.length
        : 0;
      const topPerformers = scoresWithValues.filter(r => (r.overall_score || 0) >= 8).length;
      
      // Get total candidates to calculate completion rate
      const { data: candidatesData } = await supabase
        .from('candidates')
        .select('id')
        .in('job_id', 
          await supabase
            .from('jobs')
            .select('id')
            .eq('company_id', companies.id)
            .then(({ data }) => (data || []).map(job => job.id))
        );

      const totalCandidates = candidatesData?.length || 0;
      const completionRate = totalCandidates > 0 ? (totalReports / totalCandidates) * 100 : 0;

      setStats({
        totalReports,
        averageScore,
        topPerformers,
        completionRate
      });

    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-triagen-secondary-green';
    if (score >= 6) return 'text-triagen-primary-blue';
    if (score >= 4) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excelente';
    if (score >= 6) return 'Bom';
    if (score >= 4) return 'Regular';
    return 'Baixo';
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
          Análises detalhadas das entrevistas realizadas pela IA
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={BarChart3}
          value={stats.totalReports.toString()}
          label="Relatórios Gerados"
          darkMode={darkMode}
          iconColor="bg-triagen-dark-bg"
        />
        <StatCard
          icon={TrendingUp}
          value={stats.averageScore.toFixed(1)}
          label="Pontuação Média"
          darkMode={darkMode}
          iconColor="bg-triagen-secondary-green"
        />
        <StatCard
          icon={Star}
          value={stats.topPerformers.toString()}
          label="Alto Desempenho (8+)"
          darkMode={darkMode}
          iconColor="bg-triagen-primary-blue"
        />
        <StatCard
          icon={Users}
          value={`${stats.completionRate.toFixed(0)}%`}
          label="Taxa de Conclusão"
          darkMode={darkMode}
          iconColor="bg-triagen-highlight-purple"
        />
      </div>

      {/* Error Message */}
      {error && (
        <StatusMessage
          type="error"
          message={error}
          darkMode={darkMode}
        />
      )}

      {/* Reports List */}
      {reports.length === 0 ? (
        <Card darkMode={darkMode}>
          <div className="text-center py-12">
            <BarChart3 className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-triagen-text-light'}`} />
            <h3 className={`font-heading text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
              Nenhum relatório disponível
            </h3>
            <p className={`font-sans mb-6 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              Os relatórios aparecerão aqui após os candidatos concluírem suas entrevistas
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/dashboard/jobs')}
              className="bg-triagen-dark-bg hover:bg-triagen-primary-blue"
            >
              Ver Vagas
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id} darkMode={darkMode} hoverEffect>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <h3 className={`font-heading text-lg font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                      {report.candidate.name}
                    </h3>
                    {report.overall_score && (
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${getScoreColor(report.overall_score)}`}>
                          <span className="text-sm font-bold">{report.overall_score.toFixed(1)}</span>
                        </div>
                        <span className={`text-sm font-medium ${getScoreColor(report.overall_score)}`}>
                          {getScoreLabel(report.overall_score)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <span className={`${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                      {report.candidate.job.title}
                    </span>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                      {new Date(report.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  {report.summary && (
                    <p className={`font-sans text-sm mt-3 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                      {report.summary}
                    </p>
                  )}
                </div>

                <div className="flex space-x-2 ml-4">
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
                      // TODO: Implement PDF download
                      console.log('Download PDF for report:', report.id);
                    }}
                    icon={Download}
                    darkMode={darkMode}
                  >
                    PDF
                  </Button>
                </div>
              </div>

              {/* Category Scores */}
              {report.category_scores && Object.keys(report.category_scores).length > 0 && (
                <div className={`mt-4 pt-4 border-t ${
                  darkMode ? 'border-triagen-border-dark' : 'border-triagen-border-light'
                }`}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(report.category_scores).map(([category, score]) => (
                      <div key={category} className="text-center">
                        <div className={`text-lg font-bold ${getScoreColor(score as number)}`}>
                          {(score as number).toFixed(1)}
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-triagen-text-light'}`}>
                          {category}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReportsPage;