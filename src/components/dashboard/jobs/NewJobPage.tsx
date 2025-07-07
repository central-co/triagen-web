import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Minus,
  Calendar,
  DollarSign,
  Gift,
  Target,
  HelpCircle,
  Lock
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
    deadline: '',
    salaryInfo: ''
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
      id: crypto.randomUUID(),
      question: '',
      type: 'text',
      required: false
    };
    setCustomQuestions(prev => [...prev, newQuestion]);
  };

  const removeCustomQuestion = (id: string) => {
    setCustomQuestions(prev => prev.filter(q => q.id !== id));
  };

  const updateCustomQuestion = (id: string, field: keyof CustomQuestion, value: any) => {
    setCustomQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const addQuestionOption = (questionId: string) => {
    setCustomQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, options: [...(q.options || []), ''] }
        : q
    ));
  };

  const updateQuestionOption = (questionId: string, optionIndex: number, value: string) => {
    setCustomQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { 
            ...q, 
            options: q.options?.map((opt, i) => i === optionIndex ? value : opt) 
          }
        : q
    ));
  };

  const removeQuestionOption = (questionId: string, optionIndex: number) => {
    setCustomQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { 
            ...q, 
            options: q.options?.filter((_, i) => i !== optionIndex) 
          }
        : q
    ));
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

      // Validate custom questions
      const validCustomQuestions = customQuestions.filter(q => q.question.trim() !== '');
      for (const question of validCustomQuestions) {
        if (question.type === 'select' && (!question.options || question.options.filter(opt => opt.trim() !== '').length === 0)) {
          throw new Error(`A pergunta "${question.question}" do tipo seleção deve ter pelo menos uma opção.`);
        }
      }

      // Create job with all fields
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
          salary_info: formData.salaryInfo || null,
          benefits: formData.benefits || null,
          requirements: JSON.stringify(formData.requirements.filter(req => req.trim() !== '')),
          differentials: JSON.stringify(formData.differentials.filter(diff => diff.trim() !== '')),
          custom_questions: JSON.stringify(validCustomQuestions),
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
                placeholder="Ex: São Paulo, SP, Brasil"
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

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                Tipo de Contrato
              </label>
              <select
                value={formData.contractType}
                onChange={(e) => setFormData(prev => ({ ...prev, contractType: e.target.value }))}
                className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                  darkMode
                    ? 'bg-gray-800/50 border-triagen-border-dark text-white'
                    : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg'
                }`}
              >
                <option value="full-time">Tempo Integral</option>
                <option value="part-time">Meio Período</option>
                <option value="contract">Contrato</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Estágio</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                <Calendar className="h-4 w-4 inline mr-1" />
                Prazo Final (Opcional)
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                  darkMode
                    ? 'bg-gray-800/50 border-triagen-border-dark text-white'
                    : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg'
                }`}
              />
            </div>
          </div>
        </Card>

        {/* Salary and Benefits */}
        <Card darkMode={darkMode}>
          <h2 className={`font-heading text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
            <DollarSign className="h-5 w-5 inline mr-2" />
            Remuneração e Benefícios
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                Faixa Salarial
              </label>
              <input
                type="text"
                value={formData.salaryRange}
                onChange={(e) => setFormData(prev => ({ ...prev, salaryRange: e.target.value }))}
                className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                  darkMode
                    ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                    : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                }`}
                placeholder="Ex: R$ 5.000 - R$ 8.000"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                Informações Salariais Adicionais
              </label>
              <input
                type="text"
                value={formData.salaryInfo}
                onChange={(e) => setFormData(prev => ({ ...prev, salaryInfo: e.target.value }))}
                className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                  darkMode
                    ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                    : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                }`}
                placeholder="Ex: CLT, PJ, 13º salário, etc."
              />
            </div>

            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                <Gift className="h-4 w-4 inline mr-1" />
                Benefícios
              </label>
              <textarea
                value={formData.benefits}
                onChange={(e) => setFormData(prev => ({ ...prev, benefits: e.target.value }))}
                rows={3}
                className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                  darkMode
                    ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                    : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                }`}
                placeholder="Ex: Vale refeição, plano de saúde, home office, horário flexível..."
              />
            </div>
          </div>
        </Card>

        {/* Requirements */}
        <Card darkMode={darkMode}>
          <h2 className={`font-heading text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
            <Target className="h-5 w-5 inline mr-2" />
            Requisitos Obrigatórios
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

        {/* Differentials */}
        <Card darkMode={darkMode}>
          <h2 className={`font-heading text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
            Diferenciais Desejáveis
          </h2>

          <div className="space-y-4">
            {formData.differentials.map((diff, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={diff}
                  onChange={(e) => updateDifferential(index, e.target.value)}
                  className={`font-sans flex-1 px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                    darkMode
                      ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                      : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                  }`}
                  placeholder="Ex: Conhecimento em TypeScript"
                />
                {formData.differentials.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeDifferential(index)}
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
              onClick={addDifferential}
              variant="outline"
              size="sm"
              icon={Plus}
              darkMode={darkMode}
            >
              Adicionar Diferencial
            </Button>
          </div>
        </Card>

        {/* Custom Questions */}
        <Card darkMode={darkMode}>
          <h2 className={`font-heading text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
            <HelpCircle className="h-5 w-5 inline mr-2" />
            Perguntas Personalizadas
          </h2>

          {/* Subtle development message */}
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium mb-4 ${
            darkMode 
              ? 'bg-gray-800/50 text-gray-400 border border-gray-700/50' 
              : 'bg-gray-100/50 text-gray-600 border border-gray-200/50'
          }`}>
            <Lock className="h-3 w-3" />
            <span>Funcionalidade em Desenvolvimento</span>
          </div>

          <div className="space-y-6 opacity-50">
            {customQuestions.map((question, index) => (
              <div key={question.id} className={`p-4 rounded-xl border ${
                darkMode ? 'border-triagen-border-dark bg-gray-800/30' : 'border-triagen-border-light bg-triagen-light-bg/30'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                    Pergunta {index + 1}
                  </h3>
                  <Button
                    type="button"
                    onClick={() => removeCustomQuestion(question.id)}
                    variant="outline"
                    size="sm"
                    icon={Minus}
                    darkMode={darkMode}
                    disabled
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                      Pergunta
                    </label>
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) => updateCustomQuestion(question.id, 'question', e.target.value)}
                      className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                        darkMode
                          ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                          : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                      }`}
                      placeholder="Ex: Por que você se interessou por esta vaga?"
                      disabled
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                      Tipo de Resposta
                    </label>
                    <select
                      value={question.type}
                      onChange={(e) => updateCustomQuestion(question.id, 'type', e.target.value as 'text' | 'textarea' | 'select')}
                      className={`font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                        darkMode
                          ? 'bg-gray-800/50 border-triagen-border-dark text-white'
                          : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg'
                      }`}
                      disabled
                    >
                      <option value="text">Texto Curto</option>
                      <option value="textarea">Texto Longo</option>
                      <option value="select">Múltipla Escolha</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={question.required}
                        onChange={(e) => updateCustomQuestion(question.id, 'required', e.target.checked)}
                        className="h-4 w-4 text-triagen-secondary-green focus:ring-triagen-secondary-green border-triagen-border-light rounded"
                        disabled
                      />
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                        Obrigatória
                      </span>
                    </label>
                  </div>
                </div>

                {question.type === 'select' && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                      Opções
                    </label>
                    <div className="space-y-2">
                      {(question.options || []).map((option, optionIndex) => (
                        <div key={optionIndex} className="flex gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateQuestionOption(question.id, optionIndex, e.target.value)}
                            className={`font-sans flex-1 px-4 py-2 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                              darkMode
                                ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                                : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                            }`}
                            placeholder={`Opção ${optionIndex + 1}`}
                            disabled
                          />
                          <Button
                            type="button"
                            onClick={() => removeQuestionOption(question.id, optionIndex)}
                            variant="outline"
                            size="sm"
                            icon={Minus}
                            darkMode={darkMode}
                            disabled
                          />
                        </div>
                      ))}
                      <Button
                        type="button"
                        onClick={() => addQuestionOption(question.id)}
                        variant="outline"
                        size="sm"
                        icon={Plus}
                        darkMode={darkMode}
                        disabled
                      >
                        Adicionar Opção
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Button
              type="button"
              onClick={addCustomQuestion}
              variant="outline"
              size="md"
              icon={Plus}
              darkMode={darkMode}
              disabled
            >
              Adicionar Pergunta Personalizada
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
            variant="primary-solid"
            isLoading={isLoading}
          >
            {isLoading ? 'Criando...' : 'Criar Vaga'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default NewJobPage;