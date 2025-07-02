
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import useDarkMode from '../../../hooks/useDarkMode';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../integrations/supabase/client';
import Button from '../../ui/button';
import Card from '../../ui/Card';
import StatusMessage from '../../ui/StatusMessage';

function NewJobPage() {
  const navigate = useNavigate();
  const { darkMode } = useDarkMode(true);
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    work_model: 'remoto',
    contract_type: 'full-time',
    salary_range: '',
    benefits: '',
    requirements: [''],
    differentials: [''],
    custom_questions: [{ question: '', type: 'text', required: false }],
    deadline: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const addDifferential = () => {
    setFormData(prev => ({
      ...prev,
      differentials: [...prev.differentials, '']
    }));
  };

  const updateDifferential = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      differentials: prev.differentials.map((diff, i) => i === index ? value : diff)
    }));
  };

  const removeDifferential = (index: number) => {
    setFormData(prev => ({
      ...prev,
      differentials: prev.differentials.filter((_, i) => i !== index)
    }));
  };

  const addCustomQuestion = () => {
    setFormData(prev => ({
      ...prev,
      custom_questions: [...prev.custom_questions, { question: '', type: 'text', required: false }]
    }));
  };

  const removeCustomQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      custom_questions: prev.custom_questions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      setError('Título e descrição são obrigatórios');
      return;
    }

    setLoading(true);
    setError('');

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

      if (!companies) {
        setError('Você precisa ter uma empresa cadastrada para criar vagas');
        return;
      }

      // Create the job
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert({
          company_id: companies.id,
          title: formData.title,
          description: formData.description,
          location: formData.location || null,
          work_model: formData.work_model,
          contract_type: formData.contract_type,
          salary_range: formData.salary_range || null,
          benefits: formData.benefits || null,
          requirements: formData.requirements.filter(req => req.trim() !== ''),
          differentials: formData.differentials.filter(diff => diff.trim() !== ''),
          custom_questions: formData.custom_questions.filter(q => q.question.trim() !== ''),
          deadline: formData.deadline || null,
          status: 'open'
        })
        .select()
        .single();

      if (jobError) {
        throw jobError;
      }

      navigate('/dashboard/jobs');
    } catch (err) {
      console.error('Error creating job:', err);
      setError('Erro ao criar vaga. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dashboard/jobs')}
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
                placeholder="Ex: Desenvolvedor Full Stack"
                className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                  darkMode
                    ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                    : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                }`}
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
                placeholder="Descreva as responsabilidades, objetivos e características da vaga..."
                rows={4}
                className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green resize-none ${
                  darkMode
                    ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                    : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                }`}
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
                  placeholder="Ex: São Paulo, SP"
                  className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                    darkMode
                      ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                      : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                  }`}
                />
              </div>

              <div>
                <label htmlFor="work_model" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                  Modelo de Trabalho
                </label>
                <select
                  id="work_model"
                  name="work_model"
                  value={formData.work_model}
                  onChange={handleInputChange}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                >
                  <option value="full-time">Tempo Integral</option>
                  <option value="part-time">Meio Período</option>
                  <option value="contract">Contrato</option>
                  <option value="internship">Estágio</option>
                </select>
              </div>

              <div>
                <label htmlFor="deadline" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                  Prazo de Inscrição
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
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="salary_range" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                  Faixa Salarial
                </label>
                <input
                  type="text"
                  id="salary_range"
                  name="salary_range"
                  value={formData.salary_range}
                  onChange={handleInputChange}
                  placeholder="Ex: R$ 5.000 - R$ 8.000"
                  className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                    darkMode
                      ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                      : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                  }`}
                />
              </div>

              <div>
                <label htmlFor="benefits" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                  Benefícios
                </label>
                <input
                  type="text"
                  id="benefits"
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleInputChange}
                  placeholder="Ex: Vale alimentação, Plano de saúde"
                  className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                    darkMode
                      ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                      : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                  }`}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Requirements */}
        <Card darkMode={darkMode}>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`font-heading text-xl font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
              Requisitos Obrigatórios
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRequirement}
              icon={Plus}
              darkMode={darkMode}
            >
              Adicionar
            </Button>
          </div>
          
          <div className="space-y-4">
            {formData.requirements.map((requirement, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={requirement}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                  placeholder="Ex: Experiência com React"
                  className={`font-sans flex-1 px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                    darkMode
                      ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                      : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                  }`}
                />
                {formData.requirements.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeRequirement(index)}
                    darkMode={darkMode}
                    className="text-red-500 hover:text-red-600 border-red-500 hover:border-red-600"
                  >
                    Remover
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Differentials */}
        <Card darkMode={darkMode}>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`font-heading text-xl font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
              Diferenciais Desejáveis
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addDifferential}
              icon={Plus}
              darkMode={darkMode}
            >
              Adicionar
            </Button>
          </div>
          
          <div className="space-y-4">
            {formData.differentials.map((differential, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={differential}
                  onChange={(e) => updateDifferential(index, e.target.value)}
                  placeholder="Ex: Conhecimento em Node.js"
                  className={`font-sans flex-1 px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                    darkMode
                      ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                      : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                  }`}
                />
                {formData.differentials.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeDifferential(index)}
                    darkMode={darkMode}
                    className="text-red-500 hover:text-red-600 border-red-500 hover:border-red-600"
                  >
                    Remover
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Custom Questions */}
        <Card darkMode={darkMode}>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`font-heading text-xl font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
              Perguntas Personalizadas
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCustomQuestion}
              icon={Plus}
              darkMode={darkMode}
            >
              Adicionar
            </Button>
          </div>
          
          <div className="space-y-4">
            {formData.custom_questions.map((question, index) => (
              <div key={index} className="space-y-2">
                <input
                  type="text"
                  value={question.question}
                  onChange={(e) => {
                    const newQuestions = [...formData.custom_questions];
                    newQuestions[index].question = e.target.value;
                    setFormData(prev => ({ ...prev, custom_questions: newQuestions }));
                  }}
                  placeholder="Ex: Qual sua experiência com metodologias ágeis?"
                  className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                    darkMode
                      ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                      : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                  }`}
                />
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <select
                      value={question.type}
                      onChange={(e) => {
                        const newQuestions = [...formData.custom_questions];
                        newQuestions[index].type = e.target.value;
                        setFormData(prev => ({ ...prev, custom_questions: newQuestions }));
                      }}
                      className={`font-sans px-3 py-2 rounded-lg border ${
                        darkMode
                          ? 'bg-gray-800/50 border-triagen-border-dark text-white'
                          : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg'
                      }`}
                    >
                      <option value="text">Texto</option>
                      <option value="textarea">Texto Longo</option>
                      <option value="select">Múltipla Escolha</option>
                    </select>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={question.required}
                        onChange={(e) => {
                          const newQuestions = [...formData.custom_questions];
                          newQuestions[index].required = e.target.checked;
                          setFormData(prev => ({ ...prev, custom_questions: newQuestions }));
                        }}
                        className="rounded"
                      />
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                        Obrigatório
                      </span>
                    </label>
                  </div>
                  
                  {formData.custom_questions.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeCustomQuestion(index)}
                      darkMode={darkMode}
                      className="text-red-500 hover:text-red-600 border-red-500 hover:border-red-600"
                    >
                      Remover
                    </Button>
                  )}
                </div>
              </div>
            ))}
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
            variant="outline"
            onClick={() => navigate('/dashboard/jobs')}
            darkMode={darkMode}
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            icon={Save}
            darkMode={darkMode}
            className="bg-triagen-dark-bg hover:bg-triagen-primary-blue"
          >
            {loading ? 'Criando...' : 'Criar Vaga'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default NewJobPage;
