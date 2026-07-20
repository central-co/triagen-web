import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowRight } from 'lucide-react';
import useDarkMode from '../../hooks/useDarkMode';
import { useAuth } from '../../hooks/useAuth';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useJobsData } from '../../hooks/useJobsData';
import { DashboardReportListItem, fetchDashboardReports } from '../../api/reports/dashboardReports';
import StatCard from '../ui/StatCard';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import { ScoreRing } from '../ui/Score';
import LoadingSpinner from '../ui/LoadingSpinner';

function DashboardHome() {
  const { darkMode } = useDarkMode();
  const { user } = useAuth();
  const { stats, loading: statsLoading } = useDashboardStats();
  const { jobs, loading: jobsLoading } = useJobsData();
  const navigate = useNavigate();
  const [recentReports, setRecentReports] = useState<DashboardReportListItem[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    fetchDashboardReports(userId, 4)
      .then((reports) => { if (!cancelled) setRecentReports(reports); })
      .catch((err) => console.error('Error fetching recent reports:', err))
      .finally(() => { if (!cancelled) setReportsLoading(false); });

    return () => { cancelled = true; };
  }, [userId]);

  if (statsLoading) {
    return <LoadingSpinner />;
  }

  // Top 3 active jobs
  const priorityJobs = jobs.filter(j => j.status === 'open').slice(0, 3);

  const inlineSpinner = (
    <div className="flex justify-center py-6">
      <div className={`w-6 h-6 rounded-full border-2 border-t-transparent animate-spin ${darkMode ? 'border-gray-500' : 'border-triagen-primary'}`} />
    </div>
  );

  return (
    <div className="flex flex-col gap-12 max-w-6xl mx-auto pb-12">
      {/* Header Area */}
      <div className="mt-4">
        <h1 className={`text-4xl md:text-[3.5rem] leading-[1.1] font-heading font-normal tracking-tight ${
          darkMode ? 'text-gray-100' : 'text-triagen-primary'
        }`}>
          Bem-vindo ao <span className="italic text-triagen-secondary">TriaGen.</span><br />
          Seu ecossistema de <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>contratação.</span>
        </h1>
      </div>

      {/* Stats Section with Large Numbers */}
      <div className={`grid grid-cols-3 gap-8 md:gap-16 border-b pb-12 ${darkMode ? 'border-gray-800' : 'border-triagen-border-light'}`}>
        <StatCard
          title="Vagas ativas"
          value={stats.activeJobs.toString()}
          darkMode={darkMode}
          accentClass="bg-triagen-secondary-green"
        />
        <StatCard
          title="Entrevistas concluídas"
          value={stats.completedInterviews.toString()}
          darkMode={darkMode}
          accentClass="bg-triagen-primary-blue"
        />
        <StatCard
          title="Avaliações pendentes"
          value={stats.pendingReviews.toString()}
          darkMode={darkMode}
          accentClass="bg-amber-500"
        />
      </div>

      {/* Split Columns Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">

        {/* Left Column: Priority roles */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between pb-2">
            <h2 className={`text-xl font-heading italic ${darkMode ? 'text-gray-100' : 'text-triagen-primary'}`}>
              Vagas em destaque
            </h2>
            <button
              onClick={() => navigate('/dashboard/jobs')}
              className={`text-xs font-semibold tracking-wider uppercase transition-colors ${darkMode ? 'text-gray-400 hover:text-white' : 'text-triagen-secondary hover:text-triagen-primary'}`}
            >
              Ver todas
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {jobsLoading ? (
              inlineSpinner
            ) : priorityJobs.length === 0 ? (
              <div className={`flex flex-col items-center gap-4 text-center py-10 px-6 border border-dashed rounded ${darkMode ? 'border-gray-700 text-gray-400' : 'border-neutral-300 text-triagen-secondary'}`}>
                <p className="text-sm">Nenhuma vaga ativa no momento.</p>
                <Button variant="secondary" size="sm" icon={Plus} iconPosition="left" darkMode={darkMode} onClick={() => navigate('/dashboard/jobs/new')}>
                  Criar primeira vaga
                </Button>
              </div>
            ) : (
              priorityJobs.map((job, idx) => {
                const colors = [
                  'bg-triagen-primary text-white',
                  'bg-triagen-secondary text-white',
                  'bg-[#E4D1C3] text-triagen-primary'
                ];
                const colorClass = colors[idx % colors.length];

                return (
                  <button
                    key={job.id}
                    onClick={() => navigate(`/dashboard/jobs/${job.id}`)}
                    className={`p-5 rounded border flex items-center gap-4 text-left transition-colors group ${darkMode ? 'bg-gray-800/40 border-gray-700 hover:border-gray-600' : 'bg-white border-triagen-border-light hover:border-neutral-300'}`}
                  >
                    <div className={`w-12 h-12 rounded flex items-center justify-center shrink-0 font-heading text-xl ${colorClass}`}>
                      {job.title.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className={`font-semibold font-sans mb-1 truncate ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>{job.title}</h3>
                      <p className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
                        {job.candidatesCount === 1 ? '1 candidato' : `${job.candidatesCount} candidatos`}
                        {job.location && ` • ${job.location}`}
                      </p>
                    </div>
                    <ArrowRight className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Right Column: Recent evaluations */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between pb-2">
            <h2 className={`text-xl font-heading italic ${darkMode ? 'text-gray-100' : 'text-triagen-primary'}`}>
              Avaliações recentes
            </h2>
            <button
              onClick={() => navigate('/dashboard/reports')}
              className={`text-xs font-semibold tracking-wider uppercase transition-colors ${darkMode ? 'text-gray-400 hover:text-white' : 'text-triagen-secondary hover:text-triagen-primary'}`}
            >
              Ver relatórios
            </button>
          </div>

          <div className={`p-6 rounded border flex flex-col gap-5 ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-triagen-border-light'}`}>
            {reportsLoading ? (
              inlineSpinner
            ) : recentReports.length === 0 ? (
              <p className={`text-center py-6 text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
                Nenhuma avaliação disponível ainda. Assim que os candidatos concluírem as entrevistas, os relatórios aparecerão aqui.
              </p>
            ) : (
              recentReports.map(report => (
                <div key={report.id} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {report.overall_score
                      ? <ScoreRing score={report.overall_score} size="sm" darkMode={darkMode} />
                      : <Avatar name={report.candidate_name} size="md" />}
                    <div className="flex flex-col min-w-0">
                      <span className={`font-semibold text-[0.95rem] truncate ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>{report.candidate_name}</span>
                      <span className={`text-xs tracking-wide uppercase mt-0.5 truncate ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
                        {report.job_title}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    darkMode={darkMode}
                    onClick={() => navigate(`/dashboard/candidates/${report.candidate_id}/report`)}
                  >
                    Avaliar
                  </Button>
                </div>
              ))
            )}

            <div className={`mt-2 pt-5 border-t flex justify-end ${darkMode ? 'border-gray-700' : 'border-neutral-100'}`}>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/dashboard/jobs/new')}
                icon={Plus}
                iconPosition="left"
              >
                Nova vaga
              </Button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default DashboardHome;
