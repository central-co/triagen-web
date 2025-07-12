import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import Button from '../../ui/button';
import Card from '../../ui/Card';
import { JobWithStats } from '../../../types/company';

interface JobCardProps {
  job: JobWithStats;
  darkMode: boolean;
  onClick: (jobId: string) => void;
}

function JobCard({ job, darkMode, onClick }: JobCardProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const applicationUrl = `${window.location.origin}/apply/${job.id}`;

  const copyApplicationLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(applicationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const openApplicationPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(applicationUrl, '_blank');
  };

  return (
    <Card 
      key={job.id} 
      darkMode={darkMode} 
      hoverEffect
      onClick={() => onClick(job.id)}
    >
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

          {/* Application Link Section */}
          <div className={`mt-4 pt-4 border-t ${
            darkMode ? 'border-triagen-border-dark' : 'border-triagen-border-light'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <p className={`text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                  Link de Candidatura:
                </p>
                <div className={`px-3 py-2 rounded-lg text-xs font-mono break-all ${
                  darkMode ? 'bg-gray-800/50 text-gray-400' : 'bg-triagen-light-bg/50 text-triagen-text-light'
                }`}>
                  {applicationUrl}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyApplicationLink}
                  icon={copied ? Check : Copy}
                  darkMode={darkMode}
                >
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openApplicationPage}
                  icon={ExternalLink}
                  darkMode={darkMode}
                >
                  Abrir
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default JobCard;