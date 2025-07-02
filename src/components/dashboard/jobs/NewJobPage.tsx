import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Minus
} from 'lucide-react';
import useDarkMode from '../../../hooks/useDarkMode';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../integrations/supabase/client';
import Button from '../../ui/button';
import Card from '../../ui/Card';
import StatusMessage from '../../ui/StatusMessage';

interface CustomQuestion {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'select';
  options?: string[];
  required: boolean;
}

function NewJobPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    workModel: 'remoto',
    contractType: 'full-time',
    salaryRange: '',
    benefits: '',
    requirements: [''],
    differentials: [''],
    deadline: ''
  });
  
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { darkMode } = useDarkMode(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  const addDifferential = () => {
    setFormData(prev => ({
      ...prev,
      differentials: [...prev.differentials, '']
    }));
  };

  const removeDifferential = (index: number) => {
    setFormData(prev => ({
      ...prev,
      differentials: prev.differentials.filter((_, i) => i !== index)
    }));
  };

  const updateDifferential = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      differentials: prev.differentials.map((diff, i) => i === index ? value : diff)
    }));
  };

  const addCustomQuestion = () => {
    const newQuestion: CustomQuestion = {
      id: Date.now().toString(),
      question: '',
      type: 'text',
      required: false
    };
    setCustomQuestions(prev => [...prev, newQuestion]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      setError('Usuário não encontrado');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Get user's company
      const { data: companies, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id);

      if (companyError) {
        throw companyError;
      }

      if (!companies || companies.length === 0) {
        throw new Error('Empresa não encontrada. Por favor, configure sua empresa primeiro.');
      }

      const company = companies[0];

      // Create job with proper Json casting
      const { error: jobError } = await supabase
        .from('jobs')
        .insert({
          company_id: company.id,
          title: formData.title,
          description: formData.description,
          location: formData.location || null,
          work_model: formData.workModel,
          contract_type: formData.contractType,
          salary_range: formData.salaryRange || null,
          benefits: formData.benefits || null,
          requirements: formData.requirements.filter(req => req.trim() !== '') as any,
          differentials: formData.differentials.filter(diff => diff.trim() !== '') as any,
          custom_questions: customQuestions as any,
          deadline: formData.deadline || null,
          status: 'open'
        });

      if (jobError) {
        throw jobError;
      }

      navigate('/dashboard/jobs');
    } catch (err) {
      console.error('Error creating job:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar vaga');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          onClick={() => navigate('/dashboard/jobs')}
          variant="outline"
          size="sm"
          icon={ArrowLeft}
          darkMode={darkMode}
        >
          Voltar
        </Button>
        <div>
          <h1 className={`font-heading text-3xl font-bold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
            Nova Vaga
          </h1>
          <p className={`font-sans mt-2 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
            Crie uma nova oportunidade de emprego
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card darkMode={darkMode}>
          <h2 className={`font-heading text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
            Informações Básicas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                Título da Vaga *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                  darkMode
                    ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                    : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                }`}
                placeholder="Ex: Desenvolvedor Full Stack"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                Descrição *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                  darkMode
                    ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                    : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                }`}
                placeholder="Descreva a vaga, responsabilidades e expectativas..."
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                Localização
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                  darkMode
                    ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                    : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                }`}
                placeholder="Ex: São Paulo, SP"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                Modelo de Trabalho
              </label>
              <select
                value={formData.workModel}
                onChange={(e) => setFormData(prev => ({ ...prev, workModel: e.target.value }))}
                className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                  darkMode
                    ? 'bg-gray-800/50 border-triagen-border-dark text-white'
                    : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg'
                }`}
              >
                <option value="remoto">Remoto</option>
                <option value="presencial">Presencial</option>
                <option value="hibrido">Híbrido</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Requirements */}
        <Card darkMode={darkMode}>
          <h2 className={`font-heading text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
            Requisitos
          </h2>
          
          <div className="space-y-4">
            {formData.requirements.map((req, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                  className={`font-sans flex-1 px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                    darkMode
                      ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                      : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                  }`}
                  placeholder="Ex: Experiência com React"
                />
                {formData.requirements.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    variant="outline"
                    size="sm"
                    icon={Minus}
                    darkMode={darkMode}
                  />
                )}
              </div>
            ))}
            <Button
              type="button"
              onClick={addRequirement}
              variant="outline"
              size="sm"
              icon={Plus}
              darkMode={darkMode}
            >
              Adicionar Requisito
            </Button>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <StatusMessage
            type="error"
            message={error}
            darkMode={darkMode}
          />
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            onClick={() => navigate('/dashboard/jobs')}
            variant="outline"
            darkMode={darkMode}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="bg-triagen-dark-bg hover:bg-triagen-primary-blue"
          >
            {isLoading ? 'Criando...' : 'Criar Vaga'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default NewJobPage;
