import { useNavigate } from 'react-router-dom';
import { ArrowRight, Pencil, Archive } from 'lucide-react';
import { JobWithStats } from '../../../types/company';

interface JobCardProps {
  job: JobWithStats;
  darkMode: boolean;
  onClick: (jobId: string) => void;
}

function JobCard({ job, darkMode, onClick }: JobCardProps) {
  const navigate = useNavigate();

  // Use the ID snippet to simulate the ref structure from mockups
  const shortId = job.id ? job.id.substring(0, 3).toUpperCase() : 'NEW';
  const displayRef = `REF-2026-${shortId}`;
  
  // Custom minimalistic badge colors based entirely on semantic state
  const getStatusInfo = () => {
    switch(job.status) {
       case 'closed': return { label: 'CLOSED', style: darkMode ? 'bg-red-900/30 text-red-400' : 'bg-neutral-200 text-neutral-600', icon: Archive };
       case 'paused': return { label: 'DRAFT', style: darkMode ? 'bg-gray-700 text-gray-300' : 'bg-[#e2e8e4] text-triagen-secondary', icon: Pencil };
       default: return { label: 'ACTIVE', style: darkMode ? 'bg-gray-800 text-gray-300' : 'bg-[#eaefee] text-triagen-primary', icon: ArrowRight };
    }
  }

  const { label, style, icon: Icon } = getStatusInfo();

  return (
    <div
      onClick={() => onClick(job.id)}
      className={`relative p-8 flex flex-col h-[280px] w-full rounded cursor-pointer border transition-all duration-300 group ${
        darkMode 
          ? 'bg-gray-800/40 border-gray-700 hover:border-gray-500' 
          : 'bg-white border-neutral-200 hover:border-neutral-300 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)]'
      }`}
    >
      <div className="flex items-center justify-between mb-8">
        <span className={`px-2.5 py-1 rounded-full text-[0.6rem] font-bold tracking-widest uppercase ${style}`}>
          {label}
        </span>
        <span className={`text-[0.65rem] tracking-widest font-semibold uppercase ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          {displayRef}
        </span>
      </div>

      <div className="flex flex-col flex-grow">
        <h3 className={`font-heading text-2xl font-normal leading-tight mb-2 ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>
          {job.title}
        </h3>
        <p className={`font-sans text-xs uppercase tracking-wider font-semibold ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
          {job.department || 'General'} • {job.location || 'Remote'}
        </p>
      </div>

      <div className="flex items-end justify-between mt-auto pt-4">
        <div className="flex flex-col">
          <span className={`text-4xl font-heading leading-none mb-1 ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>
            {job.candidatesCount || 0}
          </span>
          <span className={`text-[0.65rem] font-semibold tracking-widest uppercase ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>
            Candidates
          </span>
        </div>
        
        <div className={`transition-transform duration-300 group-hover:translate-x-1 ${darkMode ? 'text-gray-400' : 'text-triagen-primary'}`}>
          <Icon strokeWidth={1.5} className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default JobCard;
