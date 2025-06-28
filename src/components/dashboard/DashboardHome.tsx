import { useState, useEffect } from 'react';
import { Plus, Briefcase, Users, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useDarkMode from '../../hooks/useDarkMode';
import Button from '../ui/button';
import Card from '../ui/card';
import StatCard from '../ui/StatCard';
import SectionHeader from '../ui/SectionHeader';

function DashboardHome() {
  const { darkMode } = useDarkMode(true);
  const navigate = useNavigate();
  const [stats] = useState({
    totalJobs: 3,
    totalCandidates: 47,
    pendingInterviews: 12,
    completedInterviews: 35
  });

  const quickStats = [
    { icon: Briefcase, value: stats.totalJobs.toString(), label: 'Vagas Ativas', iconColor: 'bg-triagen-dark-bg' },
    { icon: Users, value: stats.totalCandidates.toString(), label: 'Candidatos', iconColor: 'bg-triagen-secondary-green' },
    { icon: Clock, value: stats.pendingInterviews.toString(), label: 'Entrevistas Pendentes', iconColor: 'bg-triagen-primary-blue' },
    { icon: TrendingUp, value: stats.completedInterviews.toString(), label: 'Entrevistas Concluídas', iconColor: 'bg-triagen-highlight-purple' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`font-heading text-3xl font-bold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
            Dashboard
          </h1>
          <p className={`font-sans mt-2 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
            Visão geral das suas vagas e candidatos
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <StatCard
            key={index}
            icon={stat.icon}
            value={stat.value}
            label={stat.label}
            darkMode={darkMode}
            iconColor={stat.iconColor}
          />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Jobs */}
        <Card darkMode={darkMode}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`font-heading text-xl font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
              Vagas Recentes
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/jobs')}
              darkMode={darkMode}
            >
              Ver todas
            </Button>
          </div>
          
          <div className="space-y-4">
            {[
              { title: 'Desenvolvedor Frontend React', candidates: 15, status: 'Ativa' },
              { title: 'Designer UX/UI', candidates: 8, status: 'Ativa' },
              { title: 'Analista de Dados', candidates: 24, status: 'Pausada' }
            ].map((job, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                  darkMode 
                    ? 'border-triagen-border-dark hover:bg-gray-800/30' 
                    : 'border-triagen-border-light hover:bg-triagen-light-bg/50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                      {job.title}
                    </h4>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                      {job.candidates} candidatos
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    job.status === 'Ativa'
                      ? 'bg-triagen-secondary-green/20 text-triagen-secondary-green'
                      : 'bg-orange-500/20 text-orange-500'
                  }`}>
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Candidates */}
        <Card darkMode={darkMode}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`font-heading text-xl font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
              Candidatos Recentes
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/candidates')}
              darkMode={darkMode}
            >
              Ver todos
            </Button>
          </div>
          
          <div className="space-y-4">
            {[
              { name: 'Ana Silva', job: 'Desenvolvedor Frontend React', score: 8.7, status: 'Entrevistado' },
              { name: 'Carlos Santos', job: 'Designer UX/UI', score: 9.2, status: 'Entrevistado' },
              { name: 'Maria Oliveira', job: 'Analista de Dados', score: null, status: 'Pendente' }
            ].map((candidate, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                  darkMode 
                    ? 'border-triagen-border-dark hover:bg-gray-800/30' 
                    : 'border-triagen-border-light hover:bg-triagen-light-bg/50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                      {candidate.name}
                    </h4>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                      {candidate.job}
                    </p>
                  </div>
                  <div className="text-right">
                    {candidate.score && (
                      <div className="text-triagen-secondary-green font-semibold text-sm mb-1">
                        {candidate.score}/10
                      </div>
                    )}
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      candidate.status === 'Entrevistado'
                        ? 'bg-triagen-secondary-green/20 text-triagen-secondary-green'
                        : 'bg-orange-500/20 text-orange-500'
                    }`}>
                      {candidate.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Getting Started */}
      <Card darkMode={darkMode}>
        <SectionHeader
          title="Primeiros Passos"
          description="Configure sua conta e comece a usar a plataforma"
          darkMode={darkMode}
          alignment="left"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-xl border ${
            darkMode ? 'border-triagen-border-dark' : 'border-triagen-border-light'
          }`}>
            <div className="w-12 h-12 rounded-xl bg-triagen-dark-bg flex items-center justify-center mb-4">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
              1. Crie sua primeira vaga
            </h4>
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              Configure os detalhes da vaga e gere um link para candidatos se inscreverem
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard/jobs/new')}
              darkMode={darkMode}
            >
              Criar Vaga
            </Button>
          </div>

          <div className={`p-6 rounded-xl border ${
            darkMode ? 'border-triagen-border-dark' : 'border-triagen-border-light'
          }`}>
            <div className="w-12 h-12 rounded-xl bg-triagen-secondary-green flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
              2. Compartilhe o link
            </h4>
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              Envie o link da vaga para candidatos ou publique em plataformas de emprego
            </p>
            <Button
              variant="outline"
              size="sm"
              disabled
              darkMode={darkMode}
            >
              Em breve
            </Button>
          </div>

          <div className={`p-6 rounded-xl border ${
            darkMode ? 'border-triagen-border-dark' : 'border-triagen-border-light'
          }`}>
            <div className="w-12 h-12 rounded-xl bg-triagen-primary-blue flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
              3. Analise os resultados
            </h4>
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              Receba relatórios detalhados da IA sobre cada candidato entrevistado
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard/reports')}
              darkMode={darkMode}
            >
              Ver Relatórios
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default DashboardHome;