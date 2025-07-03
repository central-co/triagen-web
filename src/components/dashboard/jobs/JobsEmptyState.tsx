
import { useNavigate } from 'react-router-dom';
import { Briefcase, Plus } from 'lucide-react';
import Button from '../../ui/button';
import Card from '../../ui/Card';

interface JobsEmptyStateProps {
  darkMode: boolean;
}

function JobsEmptyState({ darkMode }: JobsEmptyStateProps) {
  const navigate = useNavigate();

  return (
    <Card darkMode={darkMode}>
      <div className="text-center py-12">
        <Briefcase className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-triagen-text-light'}`} />
        <h3 className={`font-heading text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
          Nenhuma vaga encontrada
        </h3>
        <p className={`font-sans mb-6 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
          Comece criando sua primeira oportunidade de emprego
        </p>
        <Button
          onClick={() => navigate('/dashboard/jobs/new')}
          variant="primary"
          icon={Plus}
          className="bg-triagen-dark-bg hover:bg-triagen-primary-blue"
        >
          Criar Primeira Vaga
        </Button>
      </div>
    </Card>
  );
}

export default JobsEmptyState;
