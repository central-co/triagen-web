import { ArrowRight, Users } from 'lucide-react';
import { JobWithStats } from '../../../types/company';
import { getJobDisplayStatus, getJobStatusColor, getJobStatusLabel, JobDisplayStatus } from '../../../utils/jobStatus';

interface JobCardProps {
  job: JobWithStats;
  darkMode: boolean;
  onClick: (jobId: string) => void;
}

const WORK_MODEL_LABELS: Record<string, string> = {
  remoto: 'Remoto',
  hibrido: 'Híbrido',
  presencial: 'Presencial',
};

const STATUS_ACCENT: Record<JobDisplayStatus, string> = {
  active: 'bg-triagen-secondary-green',
  paused: 'bg-amber-500',
  expired: 'bg-red-400',
  closed: 'bg-gray-300 dark:bg-gray-600',
};

function JobCard({ job, darkMode, onClick }: Readonly<JobCardProps>) {
  const displayStatus = getJobDisplayStatus(job);
  const workModel = job.work_model ? WORK_MODEL_LABELS[job.work_model] || job.work_model : null;
  const deadline = job.deadline
    ? new Date(job.deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    : null;

  return (
    <button
      onClick={() => onClick(job.id)}
      className={`relative p-8 pt-9 flex flex-col min-h-[260px] w-full text-left rounded-lg border overflow-hidden transition-all duration-300 group ${
        darkMode
          ? 'bg-gray-800/40 border-gray-700 hover:border-gray-500'
          : 'bg-white border-triagen-border-light hover:border-neutral-300 shadow-[0_2px_10px_-4px_rgba(44,62,80,0.08)] hover:shadow-[0_10px_32px_-8px_rgba(44,62,80,0.16)] hover:-translate-y-0.5'
      }`}
    >
      <span aria-hidden="true" className={`absolute top-0 left-0 right-0 h-[3px] ${STATUS_ACCENT[displayStatus]}`} />
      <div className="flex items-center justify-between mb-8">
        <span className={`px-2.5 py-1 rounded-full text-[0.6rem] font-bold tracking-widest uppercase ${getJobStatusColor(displayStatus)}`}>
          {getJobStatusLabel(displayStatus)}
        </span>
        {deadline && (
          <span className={`text-[0.65rem] tracking-widest font-semibold uppercase ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Prazo {deadline}
          </span>
        )}
      </div>

      <div className="flex flex-col flex-grow">
        <h3 className={`font-heading text-2xl font-normal leading-tight mb-2 ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>
          {job.title}
        </h3>
        <p className={`font-sans text-xs uppercase tracking-wider font-semibold ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
          {[workModel, job.location].filter(Boolean).join(' • ') || 'Local não informado'}
        </p>
      </div>

      <div className="flex items-end justify-between mt-auto pt-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-triagen-neutral text-triagen-secondary'}`}>
            <Users className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className={`text-2xl font-heading leading-none ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>
              {job.candidatesCount || 0}
            </span>
            <span className={`text-[0.6rem] font-semibold tracking-widest uppercase mt-0.5 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>
              {job.candidatesCount === 1 ? 'Candidato' : 'Candidatos'}
            </span>
          </div>
        </div>

        <div className={`transition-transform duration-300 group-hover:translate-x-1 ${darkMode ? 'text-gray-400' : 'text-triagen-primary'}`}>
          <ArrowRight strokeWidth={1.5} className="h-5 w-5" />
        </div>
      </div>
    </button>
  );
}

export default JobCard;
