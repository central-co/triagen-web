import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import useDarkMode from '../../../hooks/useDarkMode';
import Button from '../../ui/Button';
import LoadingSpinner from '../../ui/LoadingSpinner';
import DashboardHeader from '../DashboardHeader';
import JobsList from './JobsList';
import { useJobsData } from '../../../hooks/useJobsData';

function JobsPage() {
  const { darkMode } = useDarkMode(true);
  const { jobs, loading } = useJobsData();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All Departments');

  const departments = useMemo(() => {
    const deps = new Set(jobs.map(j => j.department).filter(Boolean));
    return ['All Departments', ...Array.from(deps)] as string[];
  }, [jobs]);

  const filteredJobs = jobs.filter(job => {
    if (activeFilter === 'All Departments') return true;
    return job.department === activeFilter;
  });

  const activeRolesCount = jobs.filter(j => j.status === 'open').length;
  const totalPipelineCount = jobs.reduce((acc, job) => acc + (job.candidatesCount || 0), 0);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col gap-10 max-w-6xl mx-auto pb-12">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
         {/* Custom Header format matching the mockup */}
         <div className="mb-2 mt-4">
           <h1 className={`text-4xl md:text-[3.5rem] leading-[1.1] font-heading font-normal tracking-tight mb-4 ${
             darkMode ? 'text-gray-100' : 'text-triagen-primary'
           }`}>
             Position <span className="italic text-triagen-secondary">Management</span>
           </h1>
           <p className={`text-lg font-sans font-medium mt-4 max-w-xl ${
             darkMode ? 'text-gray-400' : 'text-triagen-secondary'
           }`}>
             Orchestrate your talent acquisition with curated precision. Review active search mandates and archived intelligence.
           </p>
         </div>
         
         <div className="flex items-center gap-3">
           <Button
             onClick={() => {}}
             variant="secondary"
             size="sm"
             darkMode={darkMode}
           >
             View Archive
           </Button>
           <Button
             onClick={() => navigate('/dashboard/jobs/new')}
             variant="primary-solid"
             size="sm"
             darkMode={darkMode}
           >
             New Position
           </Button>
         </div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border-b border-neutral-200 pb-8 px-2">
        <div className="flex items-center gap-12">
           <div className="flex flex-col">
              <span className={`text-[0.65rem] tracking-widest uppercase font-semibold mb-1 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>Active Roles</span>
              <span className={`text-4xl font-heading ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>{activeRolesCount}</span>
           </div>
           <div className="w-px h-10 bg-neutral-200 hidden md:block"></div>
           <div className="flex flex-col">
              <span className={`text-[0.65rem] tracking-widest uppercase font-semibold mb-1 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>Total Pipeline</span>
              <span className={`text-4xl font-heading ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>{totalPipelineCount}</span>
           </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
           {departments.map((dep) => (
             <button
               key={dep}
               onClick={() => setActiveFilter(dep)}
               className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                 activeFilter === dep
                   ? (darkMode ? 'bg-gray-700 text-white' : 'bg-triagen-secondary text-white')
                   : (darkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-[#eaefee] text-triagen-secondary hover:bg-neutral-200')
               }`}
             >
               {dep}
             </button>
           ))}
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="py-20 text-center text-triagen-secondary">
          No positions found.
        </div>
      ) : (
        <JobsList jobs={filteredJobs} darkMode={darkMode} onJobClick={(id) => navigate(`/dashboard/jobs/${id}`)} />
      )}
    </div>
  );
}

export default JobsPage;
