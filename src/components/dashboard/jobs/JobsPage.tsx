import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import useDarkMode from '../../../hooks/useDarkMode';
import Button from '../../ui/Button';
import LoadingSpinner from '../../ui/LoadingSpinner';
import StatusMessage from '../../ui/StatusMessage';
import JobsList from './JobsList';
import { useJobsData } from '../../../hooks/useJobsData';
import { getJobDisplayStatus, JobDisplayStatus } from '../../../utils/jobStatus';

type StatusFilter = 'all' | JobDisplayStatus;

const FILTERS: Array<{ key: StatusFilter; label: string }> = [
  { key: 'all', label: 'Todas' },
  { key: 'active', label: 'Ativas' },
  { key: 'expired', label: 'Prazo encerrado' },
  { key: 'paused', label: 'Pausadas' },
  { key: 'closed', label: 'Encerradas' },
];

function JobsPage() {
  const { darkMode } = useDarkMode();
  const { jobs, loading, error } = useJobsData();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('all');

  const jobsWithStatus = useMemo(
    () => jobs.map(job => ({ job, displayStatus: getJobDisplayStatus(job) })),
    [jobs],
  );

  const filteredJobs = jobsWithStatus
    .filter(({ displayStatus }) => activeFilter === 'all' || displayStatus === activeFilter)
    .map(({ job }) => job);

  const activeRolesCount = jobsWithStatus.filter(({ displayStatus }) => displayStatus === 'active').length;
  const totalPipelineCount = jobs.reduce((acc, job) => acc + (job.candidatesCount || 0), 0);

  // Hide filters for statuses that don't exist yet, keeping the bar clean
  const visibleFilters = FILTERS.filter(({ key }) =>
    key === 'all' || key === 'active' || jobsWithStatus.some(({ displayStatus }) => displayStatus === key)
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col gap-10 max-w-6xl mx-auto pb-12">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="mb-2 mt-4">
          <h1 className={`text-4xl md:text-[3.5rem] leading-[1.1] font-heading font-normal tracking-tight mb-4 ${
            darkMode ? 'text-gray-100' : 'text-triagen-primary'
          }`}>
            Gestão de <span className="italic text-triagen-secondary">Vagas</span>
          </h1>
          <p className={`text-lg font-sans mt-4 max-w-xl ${
            darkMode ? 'text-gray-400' : 'text-triagen-secondary'
          }`}>
            Crie vagas, acompanhe candidaturas e gerencie todo o funil de entrevistas em um só lugar.
          </p>
        </div>

        <Button
          onClick={() => navigate('/dashboard/jobs/new')}
          variant="primary"
          size="md"
          icon={Plus}
          iconPosition="left"
        >
          Nova vaga
        </Button>
      </div>

      {error && <StatusMessage type="error" message={error} darkMode={darkMode} />}

      <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border-b pb-8 ${darkMode ? 'border-gray-800' : 'border-triagen-border-light'}`}>
        <div className="flex items-center gap-12">
          <div className="flex flex-col">
            <span className={`text-[0.65rem] tracking-widest uppercase font-semibold mb-1 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>Vagas ativas</span>
            <span className={`text-4xl font-heading ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>{activeRolesCount}</span>
          </div>
          <div className={`w-px h-10 hidden md:block ${darkMode ? 'bg-gray-800' : 'bg-neutral-200'}`}></div>
          <div className="flex flex-col">
            <span className={`text-[0.65rem] tracking-widest uppercase font-semibold mb-1 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>Total de candidatos</span>
            <span className={`text-4xl font-heading ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>{totalPipelineCount}</span>
          </div>
        </div>

        {/* Status filters */}
        {jobs.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {visibleFilters.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                aria-pressed={activeFilter === key}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeFilter === key
                    ? (darkMode ? 'bg-gray-200 text-gray-900' : 'bg-triagen-primary text-white')
                    : (darkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-neutral-100 text-triagen-secondary hover:bg-neutral-200')
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {filteredJobs.length === 0 ? (
        <div className={`flex flex-col items-center gap-5 text-center py-20 px-6 border border-dashed rounded ${darkMode ? 'border-gray-700' : 'border-neutral-300'}`}>
          <div>
            <p className={`font-heading text-xl mb-1 ${darkMode ? 'text-gray-200' : 'text-triagen-primary'}`}>
              {jobs.length === 0 ? 'Nenhuma vaga criada ainda' : 'Nenhuma vaga neste filtro'}
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
              {jobs.length === 0
                ? 'Crie sua primeira vaga e compartilhe o link de candidatura para começar as entrevistas.'
                : 'Ajuste o filtro acima para ver as demais vagas.'}
            </p>
          </div>
          {jobs.length === 0 && (
            <Button
              onClick={() => navigate('/dashboard/jobs/new')}
              variant="primary"
              size="md"
              icon={Plus}
              iconPosition="left"
            >
              Criar primeira vaga
            </Button>
          )}
        </div>
      ) : (
        <JobsList jobs={filteredJobs} darkMode={darkMode} onJobClick={(id) => navigate(`/dashboard/jobs/${id}`)} />
      )}
    </div>
  );
}

export default JobsPage;
