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
  Clock
} from 'lucide-react';
import useDarkMode from '../../../hooks/useDarkMode';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../integrations/supabase/client';
import Button from '../../ui/Button';
import Card from '../../ui/Card';
import StatusMessage from '../../ui/StatusMessage';
import DashboardHeader from '../DashboardHeader';

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
    salaryInfo: '',
    interview_duration_minutes: 20,
    team_context: ''
  });

  const [preInterviewQuestions, setPreInterviewQuestions] = useState<string[]>([]);
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

  const addPreInterviewQuestion = () => {
    setPreInterviewQuestions(prev => [...prev, '']);
  };

  const removePreInterviewQuestion = (index: number) => {
    setPreInterviewQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const updatePreInterviewQuestion = (index: number, value: string) => {
    setPreInterviewQuestions(prev => prev.map((q, i) => i === index ? value : q));
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
          mandatory_requirements: formData.requirements.filter(req => req.trim() !== ''),
          desirable_requirements: formData.differentials.filter(diff => diff.trim() !== ''),
          pre_interview_questions: preInterviewQuestions
            .filter(q => q.trim() !== '')
            .map((q, i) => ({ id: i, question: q })),
          interview_duration_minutes: formData.interview_duration_minutes,
          team_context: formData.team_context || null,
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

  const inputClass = `font-sans w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
    darkMode
      ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
      : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
  }`;

  const labelClass = `block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`;

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Nova Vaga"
        description="Crie uma nova oportunidade de emprego"
        darkMode={darkMode}
        rightContent={
          <Button
            onClick={() => navigate('/dashboard/jobs')}
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            darkMode={darkMode}
          >
            Voltar
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card darkMode={darkMode}>
          <h2 className={`font-heading text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
            Informações Básicas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={labelClass}>Título da Vaga *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={inputClass}
                placeholder="Ex: Desenvolvedor Full Stack"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Descrição *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className={inputClass}
                placeholder="Descreva a vaga, responsabilidades e expectativas..."
                required
              />
            </div>

            <div>
              <label className={labelClass}>
                <Clock className="h-4 w-4 inline mr-1" />
                Duração da Entrevista (minutos) *
              </label>
              <input
                type="number"
                min={5}
                max={120}
                step={5}
                value={formData.interview_duration_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, interview_duration_minutes: Number(e.target.value) }))}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Localização</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className={inputClass}
                placeholder="Ex: São Paulo, SP, Brasil"
              />
            </div>

            <div>
              <label className={labelClass}>Modelo de Trabalho</label>
              <select
                value={formData.workModel}
                onChange={(e) => setFormData(prev => ({ ...prev, workModel: e.target.value }))}
                className={inputClass}
              >
                <option value="remoto">Remoto</option>
                <option value="presencial">Presencial</option>
                <option value="hibrido">Híbrido</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Tipo de Contrato</label>
              <select
                value={formData.contractType}
                onChange={(e) => setFormData(prev => ({ ...prev, contractType: e.target.value }))}
                className={inputClass}
              >
                <option value="full-time">Tempo Integral</option>
                <option value="part-time">Meio Período</option>
                <option value="contract">Contrato</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Estágio</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                <Calendar className="h-4 w-4 inline mr-1" />
                Prazo Final (Opcional)
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Contexto da Equipe</label>
              <textarea
                value={formData.team_context}
                onChange={(e) => setFormData(prev => ({ ...prev, team_context: e.target.value }))}
                rows={3}
                className={inputClass}
                placeholder="Descreva o time, cultura e ambiente de trabalho..."
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
              <label className={labelClass}>Faixa Salarial</label>
              <input
                type="text"
                value={formData.salaryRange}
                onChange={(e) => setFormData(prev => ({ ...prev, salaryRange: e.target.value }))}
                className={inputClass}
                placeholder="Ex: R$ 5.000 - R$ 8.000"
              />
            </div>

            <div>
              <label className={labelClass}>Informações Salariais Adicionais</label>
              <input
                type="text"
                value={formData.salaryInfo}
                onChange={(e) => setFormData(prev => ({ ...prev, salaryInfo: e.target.value }))}
                className={inputClass}
                placeholder="Ex: CLT, PJ, 13º salário, etc."
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>
                <Gift className="h-4 w-4 inline mr-1" />
                Benefícios
              </label>
              <textarea
                value={formData.benefits}
                onChange={(e) => setFormData(prev => ({ ...prev, benefits: e.target.value }))}
                rows={3}
                className={inputClass}
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
                  >Remover</Button>
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
                  >Remover</Button>
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

        {/* Pre-Interview Questions */}
        <Card darkMode={darkMode}>
          <h2 className={`font-heading text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
            <HelpCircle className="h-5 w-5 inline mr-2" />
            Perguntas Pré-Entrevista
          </h2>
          <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
            Perguntas enviadas ao candidato antes da entrevista. Todas serão obrigatórias.
          </p>

          <div className="space-y-4">
            {preInterviewQuestions.map((question, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => updatePreInterviewQuestion(index, e.target.value)}
                  className={`font-sans flex-1 px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                    darkMode
                      ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                      : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
                  }`}
                  placeholder="Ex: Você tem disponibilidade para o turno da tarde?"
                />
                <Button
                  type="button"
                  onClick={() => removePreInterviewQuestion(index)}
                  variant="outline"
                  size="sm"
                  icon={Minus}
                  darkMode={darkMode}
                >Remover</Button>
              </div>
            ))}
            <Button
              type="button"
              onClick={addPreInterviewQuestion}
              variant="outline"
              size="sm"
              icon={Plus}
              darkMode={darkMode}
            >
              Adicionar Pergunta
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
