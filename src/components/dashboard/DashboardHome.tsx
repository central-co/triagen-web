
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, FileText, TrendingUp, Plus, Eye, BarChart3 } from 'lucide-react';
import useDarkMode from '../../hooks/useDarkMode';
import { useAuth } from '../../hooks/useAuth';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import Card from '../ui/Card';
import StatCard from '../ui/StatCard';
import Button from '../ui/button';

function DashboardHome() {
  const { darkMode } = useDarkMode(true);
  const { user } = useAuth();
  const { stats, loading } = useDashboardStats();
  const navigate = useNavigate();

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
          Dashboard
        </h1>
        <p className={`font-sans mt-2 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
          Bem-vindo de volta, {user?.email}
        </p>
      </div>

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
          <div 
            onClick={() => navigate('/dashboard/jobs/new')}
            className={`p-4 rounded-xl border transition-colors cursor-pointer hover:border-triagen-secondary-green ${
            darkMode ? 'border-triagen-border-dark bg-gray-800/30 hover:bg-gray-800/50' : 'border-triagen-border-light bg-triagen-light-bg/30 hover:bg-triagen-light-bg/50'
          }`}>
            <div className="flex items-center mb-3">
              <Plus className={`h-5 w-5 mr-2 ${darkMode ? 'text-triagen-secondary-green' : 'text-triagen-primary-blue'}`} />
              <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                Nova Vaga
              </h3>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              Criar uma nova oportunidade de emprego
            </p>
          </div>
          
          <div 
            onClick={() => navigate('/dashboard/candidates')}
            className={`p-4 rounded-xl border transition-colors cursor-pointer hover:border-triagen-secondary-green ${
            darkMode ? 'border-triagen-border-dark bg-gray-800/30 hover:bg-gray-800/50' : 'border-triagen-border-light bg-triagen-light-bg/30 hover:bg-triagen-light-bg/50'
          }`}>
            <div className="flex items-center mb-3">
              <Eye className={`h-5 w-5 mr-2 ${darkMode ? 'text-triagen-secondary-green' : 'text-triagen-primary-blue'}`} />
              <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                Ver Candidatos
              </h3>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              Gerenciar candidatos existentes
            </p>
          </div>
          
          <div 
            onClick={() => navigate('/dashboard/reports')}
            className={`p-4 rounded-xl border transition-colors cursor-pointer hover:border-triagen-secondary-green ${
            darkMode ? 'border-triagen-border-dark bg-gray-800/30 hover:bg-gray-800/50' : 'border-triagen-border-light bg-triagen-light-bg/30 hover:bg-triagen-light-bg/50'
          }`}>
            <div className="flex items-center mb-3">
              <BarChart3 className={`h-5 w-5 mr-2 ${darkMode ? 'text-triagen-secondary-green' : 'text-triagen-primary-blue'}`} />
              <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                Relatórios
              </h3>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              Visualizar análises e relatórios
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default DashboardHome;
