import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, X, DollarSign, Gift, Target, Trash2, Users, MapPin, Briefcase } from 'lucide-react';
import useDarkMode from '../../../hooks/useDarkMode';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../lib/supabase';
import Button from '../../ui/button';
import Card from '../../ui/card';
import StatusMessage from '../../ui/StatusMessage';

interface RequirementItem {
  id: string;
  text: string;
}

interface CustomQuestion {
  id: string;
  question: string;
  type: 'text' | 'select' | 'multiselect';
  options?: string[];
  required: boolean;
}

function NewJobPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    work_model: 'remoto',
    salary_range: '',
    benefits: '',
    deadline: ''
  });
  
  const [requirements, setRequirements] = useState<RequirementItem[]>([]);
  const [differentials, setDifferentials] = useState<RequirementItem[]>([]);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingCriteria, setIsGeneratingCriteria] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { darkMode } = useDarkMode(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Funções para gerenciar requisitos
  const addRequirement = () => {
    const newRequirement: RequirementItem = {
      id: Date.now().toString(),
      text: ''
    };
    setRequirements(prev => [...prev, newRequirement]);
  };

  const updateRequirement = (id: string, text: string) => {
    setRequirements(prev => prev.map(req => 
      req.id === id ? { ...req, text } : req
    ));
  };

  const removeRequirement = (id: string) => {
    setRequirements(prev => prev.filter(req => req.id !== id));
  };

  // Funções para gerenciar diferenciais
  const addDifferential = () => {
    const newDifferential: RequirementItem = {
      id: Date.now().toString(),
      text: ''
    };
    setDifferentials(prev => [...prev, newDifferential]);
  };

  const updateDifferential = (id: string, text: string) => {
    setDifferentials(prev => prev.map(diff => 
      diff.id === id ? { ...diff, text } : diff
    ));
  };

  const removeDifferential = (id: string) => {
    setDifferentials(prev => prev.filter(diff => diff.id !== id));
  };

  // Funções para gerenciar perguntas customizadas
  const addCustomQuestion = () => {
    const newQuestion: CustomQuestion = {
      id: Date.now().toString(),
      question: '',
      type: 'text',
      required: false
    };
    setCustomQuestions(prev => [...prev, newQuestion]);
  };

  const updateCustomQuestion = (id: string, updates: Partial<CustomQuestion>) => {
    setCustomQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, ...updates } : q
    ));
  };

  const removeCustomQuestion = (id: string) => {
    setCustomQuestions(prev => prev.filter(q => q.id !== id));
  };

  // Função para gerar critérios de avaliação com LLM 1
  const generateEvaluationCriteria = async (jobData: any) => {
    setIsGeneratingCriteria(true);
    
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/generate-evaluation-criteria`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          job: {
            title: jobData.title,
            description: jobData.description,
            work_model: jobData.work_model,
            requirements: requirements.filter(r => r.text.trim()).map(r => r.text),
            differentials: differentials.filter(d => d.text.trim()).map(d => d.text),
            salary_range: jobData.salary_range,
            benefits: jobData.benefits
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao gerar critérios de avaliação');
      }

      const result = await response.json();
      return result.evaluation_criteria || [];
    } catch (error) {
      console.error('Erro ao gerar critérios:', error);
      return [];
    } finally {
      setIsGeneratingCriteria(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      setError('Título e descrição são obrigatórios');
      return;
    }

    if (requirements.length === 0) {
      setError('Adicione pelo menos um requisito obrigatório');
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

      if (!companies || companies.length === 0) {
        setError('Nenhuma empresa encontrada para o usuário. Por favor, configure sua empresa nas configurações.');
        return;
      }

      // Gerar critérios de avaliação com LLM 1
      const evaluationCriteria = await generateEvaluationCriteria(formData);

      // Preparar dados para inserção
      const jobData = {
        company_id: companies[0].id,
        title: formData.title,
        description: formData.description,
        location: formData.location || null,
        work_model: formData.work_model,
        salary_range: formData.salary_range || null,
        benefits: formData.benefits || null,
        deadline: formData.deadline || null,
        requirements: requirements.filter(r => r.text.trim()).map(r => r.text),
        differentials: differentials.filter(d => d.text.trim()).map(d => d.text),
        evaluation_criteria: evaluationCriteria,
        custom_questions: customQuestions.filter(q => q.question.trim()).map(q => ({
          question: q.question,
          type: q.type,
          options: q.options,
          required: q.required
        }))
      };

      // Create the job
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert(jobData)
        .select()
        .single();

      if (jobError) {
        throw jobError;
      }

      setSuccess('Vaga criada com sucesso! Critérios de avaliação foram gerados automaticamente.');
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
            Crie uma nova vaga e nossa IA gerará automaticamente os critérios de avaliação
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informações Básicas */}
        <Card darkMode={darkMode}>
          <h2 className={`font-heading text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
            <Briefcase className="h-6 w-6 inline mr-2" />
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
                placeholder="Descreva as responsabilidades, o que a pessoa fará no dia a dia, contexto da empresa..."
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
                <label htmlFor="work_model" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                  <MapPin className="h-4 w-4 inline mr-1" />
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
                  disabled={isLoading}
                >
                  <option value="remoto">Remoto</option>
                  <option value="hibrido">Híbrido</option>
                  <option value="presencial">Presencial</option>
                </select>
              </div>

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
                  disabled={isLoading}
                />
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

        {/* Requisitos Obrigatórios */}
        <Card darkMode={darkMode}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`font-heading text-xl font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
              <Target className="h-6 w-6 inline mr-2" />
              Requisitos Obrigatórios
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRequirement}
              icon={Plus}
              iconPosition="left"
              darkMode={darkMode}
            >
              Adicionar Requisito
            </Button>
          </div>

          {requirements.length === 0 ? (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              <p className="font-sans">
                Adicione os requisitos obrigatórios para a vaga. Ex: "Experiência com React", "Inglês intermediário"
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requirements.map((requirement) => (
                <div key={requirement.id} className={`flex items-center space-x-3 p-4 rounded-xl border ${
                  darkMode ? 'border-triagen-border-dark' : 'border-triagen-border-light'
                }`}>
                  <input
                    type="text"
                    placeholder="Ex: Experiência com React"
                    value={requirement.text}
                    onChange={(e) => updateRequirement(requirement.id, e.target.value)}
                    className={`font-sans flex-1 px-3 py-2 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                      darkMode
                        ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                        : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => removeRequirement(requirement.id)}
                    className={`p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Diferenciais Desejáveis */}
        <Card darkMode={darkMode}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`font-heading text-xl font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
              <Plus className="h-6 w-6 inline mr-2" />
              Diferenciais Desejáveis
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addDifferential}
              icon={Plus}
              iconPosition="left"
              darkMode={darkMode}
            >
              Adicionar Diferencial
            </Button>
          </div>

          {differentials.length === 0 ? (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              <p className="font-sans">
                Adicione diferenciais que seriam interessantes mas não obrigatórios. Ex: "Conhecimento em acessibilidade", "Experiência com testes"
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {differentials.map((differential) => (
                <div key={differential.id} className={`flex items-center space-x-3 p-4 rounded-xl border ${
                  darkMode ? 'border-triagen-border-dark' : 'border-triagen-border-light'
                }`}>
                  <input
                    type="text"
                    placeholder="Ex: Conhecimento em acessibilidade"
                    value={differential.text}
                    onChange={(e) => updateDifferential(differential.id, e.target.value)}
                    className={`font-sans flex-1 px-3 py-2 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                      darkMode
                        ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                        : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => removeDifferential(differential.id)}
                    className={`p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Salário e Benefícios */}
        <Card darkMode={darkMode}>
          <h2 className={`font-heading text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
            <DollarSign className="h-6 w-6 inline mr-2" />
            Salário e Benefícios
          </h2>
          
          <div className="space-y-6">
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

        {/* Perguntas Customizadas - DESABILITADA */}
        <div className={`rounded-3xl border transition-all duration-500 backdrop-blur-xl ${
          darkMode 
            ? 'bg-gray-800/40 border-triagen-border-dark' 
            : 'bg-triagen-light-bg/50 border-triagen-border-light'
        } p-6 relative overflow-hidden`}>
          {/* Overlay para desabilitar interação */}
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-6xl mb-4 ${darkMode ? 'text-gray-600' : 'text-triagen-text-light'}`}>
                🚧
              </div>
              <h3 className={`font-heading text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                Em Desenvolvimento
              </h3>
              <p className={`font-sans ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                Esta seção estará disponível em breve
              </p>
            </div>
          </div>

          {/* Conteúdo original (visível mas não interativo) */}
          <div className="opacity-30">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`font-heading text-xl font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                <Users className="h-6 w-6 inline mr-2" />
                Perguntas Customizadas
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCustomQuestion}
                icon={Plus}
                iconPosition="left"
                darkMode={darkMode}
                disabled
              >
                Adicionar Pergunta
              </Button>
            </div>

            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              <p className="font-sans">
                Adicione perguntas específicas que os candidatos devem responder no formulário de inscrição
              </p>
            </div>
          </div>
        </div>

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

        {isGeneratingCriteria && (
          <StatusMessage
            type="info"
            title="Gerando critérios de avaliação..."
            message="Nossa IA está analisando a vaga e criando critérios personalizados para a entrevista."
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
            disabled={!formData.title || !formData.description || requirements.length === 0}
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