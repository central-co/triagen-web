import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, X, DollarSign, Gift, Target, Trash2 } from 'lucide-react';
import useDarkMode from '../../../hooks/useDarkMode';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../lib/supabase';
import Button from '../../ui/button';
import Card from '../../ui/card';
import StatusMessage from '../../ui/StatusMessage';

interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'select' | 'multiselect';
  options?: string[];
  required: boolean;
}

interface EvaluationCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
}

function NewJobPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    contract_type: 'full-time',
    deadline: '',
    salary_info: '',
    benefits: ''
  });
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [evaluationCriteria, setEvaluationCriteria] = useState<EvaluationCriterion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { darkMode } = useDarkMode(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addCustomField = () => {
    const newField: CustomField = {
      id: Date.now().toString(),
      label: '',
      type: 'text',
      required: false
    };
    setCustomFields(prev => [...prev, newField]);
  };

  const updateCustomField = (id: string, updates: Partial<CustomField>) => {
    setCustomFields(prev => prev.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const removeCustomField = (id: string) => {
    setCustomFields(prev => prev.filter(field => field.id !== id));
  };

  const addEvaluationCriterion = () => {
    const newCriterion: EvaluationCriterion = {
      id: Date.now().toString(),
      name: '',
      description: '',
      weight: 5
    };
    setEvaluationCriteria(prev => [...prev, newCriterion]);
  };

  const updateEvaluationCriterion = (id: string, updates: Partial<EvaluationCriterion>) => {
    setEvaluationCriteria(prev => prev.map(criterion => 
      criterion.id === id ? { ...criterion, ...updates } : criterion
    ));
  };

  const removeEvaluationCriterion = (id: string) => {
    setEvaluationCriteria(prev => prev.filter(criterion => criterion.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      setError('Título e descrição são obrigatórios');
      return;
    }

    // Validate evaluation criteria
    const invalidCriteria = evaluationCriteria.some(criterion => 
      !criterion.name.trim() || criterion.weight < 1 || criterion.weight > 10
    );

    if (invalidCriteria) {
      setError('Todos os critérios de avaliação devem ter nome e peso entre 1 e 10');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // First get the user's company
      const { data: companies, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user?.id);

      if (companyError) {
        throw companyError;
      }

      // Check if any company was found
      if (!companies || companies.length === 0) {
        setError('Nenhuma empresa encontrada para o usuário. Por favor, configure sua empresa nas configurações.');
        return;
      }

      // Prepare evaluation criteria object
      const evaluationCriteriaObject = evaluationCriteria.reduce((acc, criterion) => {
        acc[criterion.id] = {
          name: criterion.name,
          description: criterion.description,
          weight: criterion.weight
        };
        return acc;
      }, {} as Record<string, any>);

      // Create the job
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert({
          company_id: companies[0].id,
          title: formData.title,
          description: formData.description,
          location: formData.location || null,
          contract_type: formData.contract_type,
          deadline: formData.deadline || null,
          salary_info: formData.salary_info || null,
          benefits: formData.benefits || null,
          evaluation_criteria: evaluationCriteriaObject,
          custom_fields: customFields.reduce((acc, field) => {
            acc[field.id] = {
              label: field.label,
              type: field.type,
              options: field.options,
              required: field.required
            };
            return acc;
          }, {} as Record<string, any>)
        })
        .select()
        .single();

      if (jobError) {
        throw jobError;
      }

      setSuccess('Vaga criada com sucesso!');
      setTimeout(() => {
        navigate('/dashboard/jobs');
      }, 2000);

    } catch (err) {
      console.error('Error creating job:', err);
      setError('Erro ao criar vaga. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/jobs')}
          icon={ArrowLeft}
          iconPosition="left"
          darkMode={darkMode}
        >
          Voltar
        </Button>
        
        <div>
          <h1 className={`font-heading text-3xl font-bold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
            Nova Vaga
          </h1>
          <p className={`font-sans mt-2 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
            Crie uma nova vaga e comece a receber candidatos
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card darkMode={darkMode}>
          <h2 className={`font-heading text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
            Informações Básicas
          </h2>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                Título da Vaga *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ex: Desenvolvedor Frontend React"
                className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                  darkMode
                    ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                    : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                }`}
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label htmlFor="description" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                Descrição da Vaga *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descreva as responsabilidades, requisitos e benefícios da vaga..."
                rows={6}
                className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green resize-none ${
                  darkMode
                    ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                    : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                }`}
                disabled={isLoading}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="location" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                  Localização
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Ex: São Paulo, SP ou Remoto"
                  className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                    darkMode
                      ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                      : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                  }`}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="contract_type" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                  Tipo de Contrato
                </label>
                <select
                  id="contract_type"
                  name="contract_type"
                  value={formData.contract_type}
                  onChange={handleInputChange}
                  className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                    darkMode
                      ? 'bg-gray-800/50 border-triagen-border-dark text-white'
                      : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg'
                  }`}
                  disabled={isLoading}
                >
                  <option value="full-time">Tempo Integral</option>
                  <option value="part-time">Meio Período</option>
                  <option value="contract">Contrato</option>
                  <option value="freelance">Freelance</option>
                  <option value="internship">Estágio</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="deadline" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                Prazo para Candidaturas
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                  darkMode
                    ? 'bg-gray-800/50 border-triagen-border-dark text-white'
                    : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg'
                }`}
                disabled={isLoading}
              />
            </div>
          </div>
        </Card>

        {/* Salary and Benefits */}
        <Card darkMode={darkMode}>
          <h2 className={`font-heading text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
            <DollarSign className="h-6 w-6 inline mr-2" />
            Salário e Benefícios
          </h2>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="salary_info" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                Informações de Salário
              </label>
              <input
                type="text"
                id="salary_info"
                name="salary_info"
                value={formData.salary_info}
                onChange={handleInputChange}
                placeholder="Ex: R$ 5.000 - R$ 8.000 ou A combinar"
                className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                  darkMode
                    ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                    : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                }`}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="benefits" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                <Gift className="h-4 w-4 inline mr-1" />
                Benefícios
              </label>
              <textarea
                id="benefits"
                name="benefits"
                value={formData.benefits}
                onChange={handleInputChange}
                placeholder="Ex: Vale refeição, plano de saúde, home office, horário flexível..."
                rows={4}
                className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green resize-none ${
                  darkMode
                    ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                    : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                }`}
                disabled={isLoading}
              />
            </div>
          </div>
        </Card>

        {/* Evaluation Criteria */}
        <Card darkMode={darkMode}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`font-heading text-xl font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
              <Target className="h-6 w-6 inline mr-2" />
              Critérios de Avaliação
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addEvaluationCriterion}
              icon={Plus}
              iconPosition="left"
              darkMode={darkMode}
            >
              Adicionar Critério
            </Button>
          </div>

          {evaluationCriteria.length === 0 ? (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              <p className="font-sans">
                Adicione critérios que serão avaliados pela IA durante a entrevista. 
                Cada critério terá um peso de 1 a 10 para calcular a compatibilidade do candidato.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {evaluationCriteria.map((criterion) => (
                <div key={criterion.id} className={`p-4 rounded-xl border ${
                  darkMode ? 'border-triagen-border-dark' : 'border-triagen-border-light'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <input
                      type="text"
                      placeholder="Nome do critério (ex: Experiência Técnica)"
                      value={criterion.name}
                      onChange={(e) => updateEvaluationCriterion(criterion.id, { name: e.target.value })}
                      className={`font-sans flex-1 px-3 py-2 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                        darkMode
                          ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                          : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => removeEvaluationCriterion(criterion.id)}
                      className={`ml-3 p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="md:col-span-3">
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                        Descrição
                      </label>
                      <input
                        type="text"
                        placeholder="Descreva o que será avaliado neste critério"
                        value={criterion.description}
                        onChange={(e) => updateEvaluationCriterion(criterion.id, { description: e.target.value })}
                        className={`font-sans w-full px-3 py-2 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                          darkMode
                            ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                            : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                        Peso (1-10)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={criterion.weight}
                        onChange={(e) => updateEvaluationCriterion(criterion.id, { weight: parseInt(e.target.value) || 1 })}
                        className={`font-sans w-full px-3 py-2 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                          darkMode
                            ? 'bg-gray-800/50 border-triagen-border-dark text-white'
                            : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg'
                        }`}
                      />
                    </div>
                  </div>

                  <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-triagen-text-light'}`}>
                    Peso {criterion.weight}/10 - {criterion.weight <= 3 ? 'Baixa importância' : criterion.weight <= 7 ? 'Importância média' : 'Alta importância'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Custom Fields */}
        <Card darkMode={darkMode}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`font-heading text-xl font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
              Campos Personalizados
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCustomField}
              icon={Plus}
              iconPosition="left"
              darkMode={darkMode}
            >
              Adicionar Campo
            </Button>
          </div>

          {customFields.length === 0 ? (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              <p className="font-sans">
                Adicione campos personalizados para coletar informações específicas dos candidatos
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {customFields.map((field) => (
                <div key={field.id} className={`p-4 rounded-xl border ${
                  darkMode ? 'border-triagen-border-dark' : 'border-triagen-border-light'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <input
                      type="text"
                      placeholder="Nome do campo"
                      value={field.label}
                      onChange={(e) => updateCustomField(field.id, { label: e.target.value })}
                      className={`font-sans flex-1 px-3 py-2 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                        darkMode
                          ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                          : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => removeCustomField(field.id)}
                      className={`ml-3 p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                      value={field.type}
                      onChange={(e) => updateCustomField(field.id, { type: e.target.value as any })}
                      className={`font-sans px-3 py-2 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                        darkMode
                          ? 'bg-gray-800/50 border-triagen-border-dark text-white'
                          : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg'
                      }`}
                    >
                      <option value="text">Texto</option>
                      <option value="select">Seleção Única</option>
                      <option value="multiselect">Seleção Múltipla</option>
                    </select>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateCustomField(field.id, { required: e.target.checked })}
                        className="h-4 w-4 text-triagen-secondary-green focus:ring-triagen-secondary-green border-triagen-border-light rounded"
                      />
                      <span className={`font-sans text-sm ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                        Obrigatório
                      </span>
                    </label>
                  </div>

                  {(field.type === 'select' || field.type === 'multiselect') && (
                    <div className="mt-4">
                      <input
                        type="text"
                        placeholder="Opções separadas por vírgula (ex: Júnior, Pleno, Sênior)"
                        value={field.options?.join(', ') || ''}
                        onChange={(e) => updateCustomField(field.id, { 
                          options: e.target.value.split(',').map(opt => opt.trim()).filter(Boolean)
                        })}
                        className={`font-sans w-full px-3 py-2 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                          darkMode
                            ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                            : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                        }`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Messages */}
        {error && (
          <StatusMessage
            type="error"
            message={error}
            darkMode={darkMode}
          />
        )}

        {success && (
          <StatusMessage
            type="success"
            message={success}
            darkMode={darkMode}
          />
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => navigate('/dashboard/jobs')}
            darkMode={darkMode}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            disabled={!formData.title || !formData.description}
            icon={Save}
            iconPosition="left"
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