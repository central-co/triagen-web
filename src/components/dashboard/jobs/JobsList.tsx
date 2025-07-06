import JobCard from './JobCard';
import { JobWithStats } from '../../../types/company';

interface JobsListProps {
  jobs: JobWithStats[];
  darkMode: boolean;
  onJobClick: (jobId: string) => void;
}

function JobsList({ jobs, darkMode, onJobClick }: JobsListProps) {
  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} darkMode={darkMode} onClick={onJobClick} />
      ))}
    </div>
  );
}

export default JobsList;