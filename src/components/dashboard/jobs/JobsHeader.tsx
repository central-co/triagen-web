
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../ui/button';

interface JobsHeaderProps {
  darkMode: boolean;
}

function JobsHeader({ darkMode }: JobsHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className={`font-heading text-3xl font-bold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
          Vagas
        </h1>
        <p className={`font-sans mt-2 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
          Gerencie suas oportunidades de emprego
        </p>
      </div>
      <Button
        onClick={() => navigate('/dashboard/jobs/new')}
        variant="primary-solid"
        icon={Plus}
      >
        Nova Vaga
      </Button>
    </div>
  );
}

export default JobsHeader;
