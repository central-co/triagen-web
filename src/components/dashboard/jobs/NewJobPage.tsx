import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
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

function NewJobPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    contract_type: 'full-time',
    deadline: ''
  });
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      setError('Título e descrição são obrigatórios');
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
        .eq('user_id', user?.id)
        .single();

      if (companyError) {
        throw companyError;
      }

      // Create the job
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert({
          company_id: companies.id,
          title: formData.title,
          description: formData.description,
          location: formData.location || null,
          contract_type: formData.contract_type,
          deadline: formData.deadline || null,
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