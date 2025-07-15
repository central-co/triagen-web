import JobCard from './JobCard';
import { JobWithStats } from '../../../types/company';

interface JobsListProps {
  jobs: JobWithStats[];
  darkMode: boolean;
  onJobClick: (jobId: string) => void;
}

function JobsList({ jobs, darkMode, onJobClick }: JobsListProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} darkMode={darkMode} onClick={onJobClick} />
      ))}
    </div>
  );
}

export default JobsList;