
import JobCard from './JobCard';
import { JobWithStats } from '../../../types/company';

interface JobsListProps {
  jobs: JobWithStats[];
  darkMode: boolean;
}

function JobsList({ jobs, darkMode }: JobsListProps) {
  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} darkMode={darkMode} />
      ))}
    </div>
  );
}

export default JobsList;
