import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import useDarkMode from '../../../hooks/useDarkMode';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../integrations/supabase/client';
import Button from '../../ui/Button';
import Card from '../../ui/Card';
import StatusMessage from '../../ui/StatusMessage';
import { Input, Textarea, Select } from '../../ui/Field';

interface DynamicListProps {
  items: string[];
  placeholder: string;
  addLabel: string;
  darkMode: boolean;
  onChange: (items: string[]) => void;
  /** When false, the last remaining row cannot be removed. */
  allowEmpty?: boolean;
}

function DynamicList({ items, placeholder, addLabel, darkMode, onChange, allowEmpty = false }: Readonly<DynamicListProps>) {
  const canRemove = allowEmpty || items.length > 1;

  return (
    <div className="space-y-3">
      {items.map((value, index) => (
        <div key={index} className="flex gap-2 items-center">
          <div className="flex-1">
            <Input
              darkMode={darkMode}
              value={value}
              placeholder={placeholder}
              onChange={(e) => onChange(items.map((item, i) => i === index ? e.target.value : item))}
            />
          </div>
          {canRemove && (
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              aria-label="Remover item"
              title="Remover"
              className={`p-2 rounded transition-colors ${darkMode ? 'text-gray-500 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-400 hover:text-triagen-primary hover:bg-neutral-100'}`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
      <Button
        type="button"
        onClick={() => onChange([...items, ''])}
        variant="outline"
        size="sm"
        icon={Plus}
        iconPosition="left"
        darkMode={darkMode}
      >
        {addLabel}
      </Button>
    </div>
  );
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
    deadline: '',
    salaryInfo: '',
    interview_duration_minutes: 20,
    team_context: ''
  });

  const [requirements, setRequirements] = useState<string[]>(['']);
  const [differentials, setDifferentials] = useState<string[]>(['']);
  const [preInterviewQuestions, setPreInterviewQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { darkMode } = useDarkMode();
  const { user } = useAuth();
  const navigate = useNavigate();

  const setField = (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      setError('Usuário não encontrado');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data: companies, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id);

      if (companyError) throw companyError;

      if (!companies || companies.length === 0) {
        throw new Error('Empresa não encontrada. Configure os dados da sua empresa em Configurações antes de criar uma vaga.');
      }

      const { error: jobError } = await supabase
        .from('jobs')
        .insert({
          company_id: companies[0].id,
          title: formData.title,
          description: formData.description,
          location: formData.location || null,
          work_model: formData.workModel,
          contract_type: formData.contractType,
          salary_range: formData.salaryRange || null,
          salary_info: formData.salaryInfo || null,
          benefits: formData.benefits || null,
          mandatory_requirements: requirements.filter(req => req.trim() !== ''),
          desirable_requirements: differentials.filter(diff => diff.trim() !== ''),
          pre_interview_questions: preInterviewQuestions
            .filter(q => q.trim() !== '')
            .map((q, i) => ({ id: i, question: q })),
          interview_duration_minutes: Number(formData.interview_duration_minutes),
          team_context: formData.team_context || null,
          deadline: formData.deadline || null,
          status: 'open'
        });

      if (jobError) throw jobError;

      navigate('/dashboard/jobs');
    } catch (err) {
      console.error('Error creating job:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar vaga');
    } finally {
      setIsLoading(false);
    }
  };

  const sectionHeading = (title: string, description?: string) => (
    <div className="mb-6">
      <h2 className={`font-heading text-xl ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>
        {title}
      </h2>
      {description && (
        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
          {description}
        </p>
      )}
    </div>
  );

  return (
    <div className="flex flex-col max-w-3xl mx-auto pb-16">

      {/* Breadcrumb */}
      <div className="flex items-center justify-between pt-6 mb-10">
        <button
          onClick={() => navigate('/dashboard/jobs')}
          className={`flex items-center gap-2 text-xs uppercase tracking-widest font-semibold hover:opacity-70 transition-opacity ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}
        >
          <ArrowLeft className="w-4 h-4" /> Vagas
        </button>
      </div>

      {/* Header */}
      <div className="mb-10">
        <h1 className={`text-4xl md:text-5xl font-heading font-normal tracking-tight mb-3 ${darkMode ? 'text-gray-100' : 'text-triagen-primary'}`}>
          Nova <span className="italic text-triagen-secondary">Vaga</span>
        </h1>
        <p className={`text-lg font-sans ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
          Descreva a posição — a IA usará essas informações para conduzir e avaliar as entrevistas.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card darkMode={darkMode} padding="lg">
          {sectionHeading('Informações básicas')}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Título da vaga *"
                darkMode={darkMode}
                value={formData.title}
                onChange={setField('title')}
                placeholder="Ex.: Desenvolvedor(a) Full Stack"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Textarea
                label="Descrição *"
                darkMode={darkMode}
                value={formData.description}
                onChange={setField('description')}
                rows={5}
                placeholder="Descreva a vaga, responsabilidades e expectativas..."
                required
              />
            </div>

            <Input
              label="Localização"
              darkMode={darkMode}
              value={formData.location}
              onChange={setField('location')}
              placeholder="Ex.: São Paulo, SP"
            />

            <Select
              label="Modelo de trabalho"
              darkMode={darkMode}
              value={formData.workModel}
              onChange={setField('workModel')}
            >
              <option value="remoto">Remoto</option>
              <option value="presencial">Presencial</option>
              <option value="hibrido">Híbrido</option>
            </Select>

            <Select
              label="Tipo de contrato"
              darkMode={darkMode}
              value={formData.contractType}
              onChange={setField('contractType')}
            >
              <option value="full-time">Tempo integral</option>
              <option value="part-time">Meio período</option>
              <option value="contract">Contrato</option>
              <option value="freelance">Freelance</option>
              <option value="internship">Estágio</option>
            </Select>

            <Input
              label="Prazo para candidaturas"
              type="date"
              darkMode={darkMode}
              value={formData.deadline}
              onChange={setField('deadline')}
              hint="Após essa data, a vaga deixa de aceitar candidaturas."
            />

            <div className="md:col-span-2">
              <Textarea
                label="Contexto do time"
                darkMode={darkMode}
                value={formData.team_context}
                onChange={setField('team_context')}
                rows={3}
                placeholder="Descreva o time, a cultura e o ambiente de trabalho..."
              />
            </div>
          </div>
        </Card>

        {/* Interview */}
        <Card darkMode={darkMode} padding="lg">
          {sectionHeading('Entrevista com IA', 'Configure a conversa que a IA terá com cada candidato.')}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Duração da entrevista (minutos) *"
              type="number"
              min={5}
              max={120}
              step={5}
              darkMode={darkMode}
              value={formData.interview_duration_minutes}
              onChange={setField('interview_duration_minutes')}
              required
            />
          </div>

          <div className="mt-6">
            <p className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-triagen-primary'}`}>
              Perguntas de triagem
            </p>
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
              Respondidas pelo candidato no formulário de candidatura. Todas são obrigatórias.
            </p>
            <DynamicList
              items={preInterviewQuestions}
              onChange={setPreInterviewQuestions}
              placeholder="Ex.: Você tem disponibilidade para o turno da tarde?"
              addLabel="Adicionar pergunta"
              darkMode={darkMode}
              allowEmpty
            />
          </div>
        </Card>

        {/* Requirements */}
        <Card darkMode={darkMode} padding="lg">
          {sectionHeading('Requisitos obrigatórios', 'Critérios essenciais que a IA priorizará na avaliação.')}
          <DynamicList
            items={requirements}
            onChange={setRequirements}
            placeholder="Ex.: Experiência com React"
            addLabel="Adicionar requisito"
            darkMode={darkMode}
          />
        </Card>

        {/* Differentials */}
        <Card darkMode={darkMode} padding="lg">
          {sectionHeading('Diferenciais desejáveis')}
          <DynamicList
            items={differentials}
            onChange={setDifferentials}
            placeholder="Ex.: Conhecimento em TypeScript"
            addLabel="Adicionar diferencial"
            darkMode={darkMode}
          />
        </Card>

        {/* Salary and Benefits */}
        <Card darkMode={darkMode} padding="lg">
          {sectionHeading('Remuneração e benefícios')}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Faixa salarial"
              darkMode={darkMode}
              value={formData.salaryRange}
              onChange={setField('salaryRange')}
              placeholder="Ex.: R$ 5.000 – R$ 8.000"
            />

            <Input
              label="Informações adicionais"
              darkMode={darkMode}
              value={formData.salaryInfo}
              onChange={setField('salaryInfo')}
              placeholder="Ex.: CLT, PJ, 13º salário"
            />

            <div className="md:col-span-2">
              <Textarea
                label="Benefícios"
                darkMode={darkMode}
                value={formData.benefits}
                onChange={setField('benefits')}
                rows={3}
                placeholder="Ex.: Vale-refeição, plano de saúde, horário flexível..."
              />
            </div>
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

        {/* Actions */}
        <div className="flex justify-end gap-3">
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
          >
            {isLoading ? 'Criando vaga...' : 'Criar vaga'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default NewJobPage;
