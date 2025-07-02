
import { useState } from 'react';
import { Users, Briefcase, FileText, TrendingUp } from 'lucide-react';
import useDarkMode from '../../hooks/useDarkMode';
import { useAuth } from '../../hooks/useAuth';
import Card from '../ui/Card';
import StatCard from '../ui/StatCard';

function DashboardHome() {
  const [stats] = useState({
    totalCandidates: 0,
    activeJobs: 0,
    completedInterviews: 0,
    pendingReviews: 0
  });
  
  const { darkMode } = useDarkMode(true);
  const { user } = useAuth();

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
          trend="+12%"
          darkMode={darkMode}
        />
        <StatCard
          title="Vagas Ativas"
          value={stats.activeJobs.toString()}
          icon={Briefcase}
          trend="+3%"
          darkMode={darkMode}
        />
        <StatCard
          title="Entrevistas Concluídas"
          value={stats.completedInterviews.toString()}
          icon={FileText}
          trend="+25%"
          darkMode={darkMode}
        />
        <StatCard
          title="Avaliações Pendentes"
          value={stats.pendingReviews.toString()}
          icon={TrendingUp}
          trend="-8%"
          darkMode={darkMode}
        />
      </div>

      {/* Quick Actions */}
      <Card darkMode={darkMode}>
        <h2 className={`font-heading text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl border transition-colors cursor-pointer hover:border-triagen-secondary-green ${
            darkMode ? 'border-triagen-border-dark bg-gray-800/30' : 'border-triagen-border-light bg-triagen-light-bg/30'
          }`}>
            <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
              Nova Vaga
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              Criar uma nova oportunidade de emprego
            </p>
          </div>
          
          <div className={`p-4 rounded-xl border transition-colors cursor-pointer hover:border-triagen-secondary-green ${
            darkMode ? 'border-triagen-border-dark bg-gray-800/30' : 'border-triagen-border-light bg-triagen-light-bg/30'
          }`}>
            <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
              Ver Candidatos
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              Gerenciar candidatos existentes
            </p>
          </div>
          
          <div className={`p-4 rounded-xl border transition-colors cursor-pointer hover:border-triagen-secondary-green ${
            darkMode ? 'border-triagen-border-dark bg-gray-800/30' : 'border-triagen-border-light bg-triagen-light-bg/30'
          }`}>
            <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
              Relatórios
            </h3>
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
