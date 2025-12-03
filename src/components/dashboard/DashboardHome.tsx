
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, FileText, TrendingUp, Plus, Eye, BarChart3, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import useDarkMode from '../../hooks/useDarkMode';
import { useAuth } from '../../hooks/useAuth';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { supabase } from '../../integrations/supabase/client';
import { Report } from '../../types/company';
import Card from '../ui/Card';
import StatCard from '../ui/StatCard';
import Button from '../ui/button';
import DashboardHeader from './DashboardHeader';

function DashboardHome() {
  const { darkMode } = useDarkMode(true);
  const { user } = useAuth();
  const { stats, loading } = useDashboardStats();
  const navigate = useNavigate();
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentReports();
    }
  }, [user]);

  const fetchRecentReports = async () => {
    try {
      if (!user?.id) return;

      const { data: reportsData, error: reportsError } = await supabase
        .from('interview_reports')
        .select(`
          *,
          candidate:candidates(
            name,
            job:jobs(
              title
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (reportsError) throw reportsError;

      const transformedReports: Report[] = (reportsData || []).map((report: any) => ({
        id: report.id,
        candidate_name: report.candidate?.name || 'N/A',
        job_title: report.candidate?.job?.title || 'N/A',
        overall_score: report.overall_score || 0,
        created_at: report.created_at || '',
        alignment_analysis: report.alignment_analysis || '',
        summary: report.summary || '',
        category_scores: typeof report.category_scores === 'object' && report.category_scores !== null
          ? report.category_scores as Record<string, number>
          : {},
        status: report.status as 'pending' | 'processing' | 'completed' | 'failed' || 'completed'
      }));

      setRecentReports(transformedReports);
    } catch (err) {
      console.error('Error fetching recent reports:', err);
    } finally {
      setReportsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'processing': return 'Processando';
      case 'failed': return 'Falhou';
      default: return 'Pendente';
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
      <DashboardHeader
        title="Dashboard"
        description={`Bem-vindo de volta, ${user?.email}`}
        darkMode={darkMode}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Candidatos"
          value={stats.totalCandidates.toString()}
          icon={Users}
          darkMode={darkMode}
        />
        <StatCard
          title="Vagas Ativas"
          value={stats.activeJobs.toString()}
          icon={Briefcase}
          darkMode={darkMode}
        />
        <StatCard
          title="Entrevistas Concluídas"
          value={stats.completedInterviews.toString()}
          icon={FileText}
          darkMode={darkMode}
        />
        <StatCard
          title="Avaliações Pendentes"
          value={stats.pendingReviews.toString()}
          icon={TrendingUp}
          darkMode={darkMode}
        />
      </div>

      {/* Quick Actions */}
      <Card darkMode={darkMode}>
        <h2 className={`font-heading text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl border transition-colors ${darkMode ? 'border-triagen-border-dark bg-gray-800/30' : 'border-triagen-border-light bg-triagen-light-bg/30'
            }`}>
            <div className="flex items-center mb-3">
              <Plus className={`h-5 w-5 mr-2 ${darkMode ? 'text-triagen-secondary-green' : 'text-triagen-primary-blue'}`} />
              <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                Nova Vaga
              </h3>
            </div>
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              Criar uma nova oportunidade de emprego
            </p>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => navigate('/dashboard/jobs/new')}
              darkMode={darkMode}
            >
              Criar Vaga
            </Button>
          </div>

          <div className={`p-4 rounded-xl border transition-colors ${darkMode ? 'border-triagen-border-dark bg-gray-800/30' : 'border-triagen-border-light bg-triagen-light-bg/30'
            }`}>
            <div className="flex items-center mb-3">
              <Eye className={`h-5 w-5 mr-2 ${darkMode ? 'text-triagen-secondary-green' : 'text-triagen-primary-blue'}`} />
              <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                Ver Candidatos
              </h3>
            </div>
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              Gerenciar candidatos existentes
            </p>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => navigate('/dashboard/candidates')}
              darkMode={darkMode}
            >
              Ver Candidatos
            </Button>
          </div>

          <div className={`p-4 rounded-xl border transition-colors ${darkMode ? 'border-triagen-border-dark bg-gray-800/30' : 'border-triagen-border-light bg-triagen-light-bg/30'
            }`}>
            <div className="flex items-center mb-3">
              <BarChart3 className={`h-5 w-5 mr-2 ${darkMode ? 'text-triagen-secondary-green' : 'text-triagen-primary-blue'}`} />
              <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                Relatórios
              </h3>
            </div>
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              Visualizar análises e relatórios
            </p>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => navigate('/dashboard/reports')}
              darkMode={darkMode}
            >
              Ver Relatórios
            </Button>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card darkMode={darkMode}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`font-heading text-xl font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
            Atividade Recente
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/reports')}
            darkMode={darkMode}
          >
            Ver Todos
          </Button>
        </div>

        {reportsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-triagen-primary-blue" />
          </div>
        ) : recentReports.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhuma atividade recente
          </div>
        ) : (
          <div className="space-y-4">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-colors cursor-pointer ${darkMode
                  ? 'border-triagen-border-dark bg-gray-800/30 hover:bg-gray-800/50'
                  : 'border-triagen-border-light bg-triagen-light-bg/30 hover:bg-triagen-light-bg/50'
                  }`}
                onClick={() => report.status === 'completed' && navigate(`/dashboard/reports/${report.id}`)}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-white'
                    }`}>
                    {getStatusIcon(report.status)}
                  </div>
                  <div>
                    <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                      {report.candidate_name}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                      {report.job_title} • {new Date(report.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`text-sm font-medium px-3 py-1 rounded-full ${report.status === 'completed'
                    ? 'bg-green-500/10 text-green-500'
                    : report.status === 'processing'
                      ? 'bg-blue-500/10 text-blue-500'
                      : report.status === 'failed'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-gray-500/10 text-gray-500'
                    }`}>
                    {getStatusText(report.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default DashboardHome;
