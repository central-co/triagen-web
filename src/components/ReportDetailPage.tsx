import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  TrendingUp,
  TrendingDown,
  FileText,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowLeft
} from 'lucide-react';
import useDarkMode from '../hooks/useDarkMode';
import AnimatedBackground from './ui/AnimatedBackground';
import Card from './ui/Card';
import StatusMessage from './ui/StatusMessage';
import PageHeader from './ui/PageHeader';
import Button from './ui/button';
import { getInterviewStatus, InterviewReport } from '../api/interview';

function ReportDetailPage() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { darkMode } = useDarkMode(true);

  useEffect(() => {
    if (!candidateId) {
      navigate('/');
      return;
    }

    fetchReport();
  }, [candidateId, navigate]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await getInterviewStatus(candidateId!);

      if (data.status === 'not_found' || data.status === 'processing') {
        setError('Relatório ainda não está disponível. Por favor, aguarde alguns minutos.');
        return;
      }

      setReport(data);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Erro ao carregar relatório. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-triagen-light-bg'}`}>
        <AnimatedBackground darkMode={darkMode} />
        <PageHeader darkMode={darkMode} />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-triagen-primary-blue"></div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-triagen-light-bg'}`}>
        <AnimatedBackground darkMode={darkMode} />
        <PageHeader darkMode={darkMode} />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <Card darkMode={darkMode}>
            <StatusMessage
              type="error"
              title="Relatório não disponível"
              message={error || 'Não foi possível carregar o relatório.'}
              darkMode={darkMode}
            />
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate('/')}
              icon={ArrowLeft}
              iconPosition="left"
            >
              Voltar ao Início
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const getRecommendationIcon = () => {
    if (report.recommendation === 'approve') return CheckCircle;
    if (report.recommendation === 'reject') return XCircle;
    return AlertCircle;
  };

  const getRecommendationColor = () => {
    if (report.recommendation === 'approve') return 'text-triagen-secondary-green';
    if (report.recommendation === 'reject') return 'text-triagen-error';
    return 'text-triagen-highlight-purple';
  };

  const getRecommendationText = () => {
    if (report.recommendation === 'approve') return '✅ Recomendado para Aprovação';
    if (report.recommendation === 'reject') return '❌ Não Recomendado';
    return '🧪 Teste Técnico Recomendado';
  };

  const RecommendationIcon = getRecommendationIcon();

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-triagen-light-bg'}`}>
      <AnimatedBackground darkMode={darkMode} />
      <PageHeader darkMode={darkMode} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            icon={ArrowLeft}
            iconPosition="left"
            darkMode={darkMode}
          >
            Voltar
          </Button>
        </div>

        {/* Overall Score Card */}
        <Card darkMode={darkMode} className="mb-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-triagen-primary-blue to-triagen-secondary-green mb-4">
              <Award className="w-12 h-12 text-white" />
            </div>

            <h1 className={`font-heading text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
              {report.overallScore ? `${report.overallScore}/10` : 'N/A'}
            </h1>

            <p className={`font-sans text-lg ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              Nota Geral da Entrevista
            </p>
          </div>
        </Card>

        {/* Recommendation */}
        <Card darkMode={darkMode} className="mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
              report.recommendation === 'approve' ? 'bg-triagen-secondary-green/20' :
              report.recommendation === 'reject' ? 'bg-red-500/20' :
              'bg-triagen-highlight-purple/20'
            }`}>
              <RecommendationIcon className={`w-6 h-6 ${getRecommendationColor()}`} />
            </div>
            <div>
              <h3 className={`font-heading text-xl font-bold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                Recomendação Final
              </h3>
              <p className={`font-sans ${getRecommendationColor()} font-semibold`}>
                {getRecommendationText()}
              </p>
            </div>
          </div>
        </Card>

        {/* Criteria Scores */}
        {report.criteriaScores && Object.keys(report.criteriaScores).length > 0 && (
          <Card darkMode={darkMode} className="mb-8">
            <div className="flex items-center mb-6">
              <Star className={`w-6 h-6 mr-3 ${darkMode ? 'text-triagen-primary-blue' : 'text-triagen-dark-bg'}`} />
              <h2 className={`font-heading text-2xl font-bold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                Avaliação por Critério
              </h2>
            </div>

            <div className="space-y-6">
              {Object.entries(report.criteriaScores).map(([criterion, data]) => (
                <div key={criterion} className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800/30' : 'bg-triagen-light-bg/30'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                      {criterion}
                    </h3>
                    <span className={`text-lg font-bold ${darkMode ? 'text-triagen-secondary-green' : 'text-triagen-primary-blue'}`}>
                      {data.score}/10
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className={`h-2 rounded-full mb-3 ${darkMode ? 'bg-gray-700' : 'bg-triagen-border-light'}`}>
                    <div
                      className="h-full bg-gradient-to-r from-triagen-secondary-green to-triagen-primary-blue rounded-full transition-all duration-500"
                      style={{ width: `${(data.score / 10) * 100}%` }}
                    />
                  </div>

                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                    {data.justification}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Category Scores (alternative format) */}
        {report.category_scores && Object.keys(report.category_scores).length > 0 && (
          <Card darkMode={darkMode} className="mb-8">
            <div className="flex items-center mb-6">
              <Star className={`w-6 h-6 mr-3 ${darkMode ? 'text-triagen-primary-blue' : 'text-triagen-dark-bg'}`} />
              <h2 className={`font-heading text-2xl font-bold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                Scores por Categoria
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(report.category_scores).map(([category, score]) => (
                <div key={category} className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800/30' : 'bg-triagen-light-bg/30'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                      {category}
                    </span>
                    <span className={`text-lg font-bold ${darkMode ? 'text-triagen-secondary-green' : 'text-triagen-primary-blue'}`}>
                      {score}/10
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Summary */}
        {report.summary && (
          <Card darkMode={darkMode} className="mb-8">
            <div className="flex items-center mb-6">
              <FileText className={`w-6 h-6 mr-3 ${darkMode ? 'text-triagen-primary-blue' : 'text-triagen-dark-bg'}`} />
              <h2 className={`font-heading text-2xl font-bold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                Resumo da Entrevista
              </h2>
            </div>
            <p className={`font-sans leading-relaxed ${darkMode ? 'text-gray-300' : 'text-triagen-text-light'}`}>
              {report.summary}
            </p>
          </Card>
        )}

        {/* Alignment Analysis */}
        {report.alignment_analysis && (
          <Card darkMode={darkMode} className="mb-8">
            <div className="flex items-center mb-6">
              <FileText className={`w-6 h-6 mr-3 ${darkMode ? 'text-triagen-primary-blue' : 'text-triagen-dark-bg'}`} />
              <h2 className={`font-heading text-2xl font-bold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                Análise de Alinhamento
              </h2>
            </div>
            <p className={`font-sans leading-relaxed ${darkMode ? 'text-gray-300' : 'text-triagen-text-light'}`}>
              {report.alignment_analysis}
            </p>
          </Card>
        )}

        {/* Strengths and Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Strengths */}
          {report.strengths && report.strengths.length > 0 && (
            <Card darkMode={darkMode}>
              <div className="flex items-center mb-6">
                <TrendingUp className={`w-6 h-6 mr-3 text-triagen-secondary-green`} />
                <h2 className={`font-heading text-xl font-bold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                  Pontos Fortes
                </h2>
              </div>
              <ul className="space-y-3">
                {report.strengths.map((strength, index) => (
                  <li key={index} className={`flex items-start ${darkMode ? 'text-gray-300' : 'text-triagen-text-light'}`}>
                    <span className="text-triagen-secondary-green mr-2 flex-shrink-0">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Weaknesses */}
          {report.weaknesses && report.weaknesses.length > 0 && (
            <Card darkMode={darkMode}>
              <div className="flex items-center mb-6">
                <TrendingDown className={`w-6 h-6 mr-3 text-triagen-highlight-purple`} />
                <h2 className={`font-heading text-xl font-bold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                  Áreas de Melhoria
                </h2>
              </div>
              <ul className="space-y-3">
                {report.weaknesses.map((weakness, index) => (
                  <li key={index} className={`flex items-start ${darkMode ? 'text-gray-300' : 'text-triagen-text-light'}`}>
                    <span className="text-triagen-highlight-purple mr-2 flex-shrink-0">•</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Info Message */}
        <StatusMessage
          type="info"
          title="Relatório Completo"
          message="Este relatório foi gerado automaticamente por nossa IA com base na análise da sua entrevista. Uma cópia foi enviada para o seu e-mail."
          darkMode={darkMode}
        />
      </div>
    </div>
  );
}

export default ReportDetailPage;
