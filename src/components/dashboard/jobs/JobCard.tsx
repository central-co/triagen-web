
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users } from 'lucide-react';
import Button from '../../ui/button';
import Card from '../../ui/Card';
import { JobWithStats } from '../../../types/company';

interface JobCardProps {
  job: JobWithStats;
  darkMode: boolean;
}

function JobCard({ job, darkMode }: JobCardProps) {
  const navigate = useNavigate();

  return (
    <Card key={job.id} darkMode={darkMode} hoverEffect>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <h3 className={`font-heading text-xl font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
              {job.title}
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              job.status === 'open'
                ? 'bg-green-100 text-green-800'
                : job.status === 'paused'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {job.status === 'open' ? 'Aberta' : job.status === 'paused' ? 'Pausada' : 'Fechada'}
            </span>
          </div>
          <p className={`font-sans text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'} line-clamp-2`}>
            {job.description}
          </p>
          <div className="flex items-center space-x-6 text-sm">
            {job.location && (
              <div className={`flex items-center space-x-1 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
            )}
            <div className={`flex items-center space-x-1 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              <Users className="h-4 w-4" />
              <span>{job.candidatesCount} candidatos</span>
            </div>
            <div className={`flex items-center space-x-1 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              <Clock className="h-4 w-4" />
              <span>{new Date(job.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/dashboard/candidates?job=${job.id}`)}
            darkMode={darkMode}
          >
            Ver Candidatos
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default JobCard;
