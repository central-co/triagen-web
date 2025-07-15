import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import useDarkMode from '../../../hooks/useDarkMode';
import StatusMessage from '../../ui/StatusMessage';
import Button from '../../ui/button';
import DashboardHeader from '../DashboardHeader';
import JobsSearchFilter from './JobsSearchFilter';
import JobsEmptyState from './JobsEmptyState';
import JobsList from './JobsList';
import { useJobsData } from '../../../hooks/useJobsData';

function JobsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { darkMode } = useDarkMode(true);
  const { jobs, loading, error } = useJobsData();
  const navigate = useNavigate();

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const handleJobClick = (jobId: string) => {
    navigate(`/dashboard/jobs/${jobId}`);
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
        title="Vagas"
        description="Gerencie suas oportunidades de emprego"
        darkMode={darkMode}
        rightContent={
          <Button
            onClick={() => navigate('/dashboard/jobs/new')}
            variant="primary-solid"
            icon={Plus}
          >
            Nova Vaga
          </Button>
        }
      />

      <JobsSearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        darkMode={darkMode}
      />

      {error && (
        <StatusMessage
          type="error"
          message="Erro ao carregar vagas"
          darkMode={darkMode}
        />
      )}

      {filteredJobs.length === 0 ? (
        <JobsEmptyState darkMode={darkMode} />
      ) : (
        <JobsList jobs={filteredJobs} darkMode={darkMode} onJobClick={handleJobClick} />
      )}
    </div>
  );
}

export default JobsPage;
