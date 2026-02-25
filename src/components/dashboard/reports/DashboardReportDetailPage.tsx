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
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { getInterviewReport, DashboardReportData } from '../../../api/reports';

type CriteriaScore = { score: number; justification: string };

export default function DashboardReportDetailPage() {
  const { candidateId, reportId } = useParams<{ candidateId?: string; reportId?: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<DashboardReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!candidateId && !reportId) {
      navigate('/dashboard/reports');
      return;
    }

    const fetchReport = async () => {
      try {
        setLoading(true);
        const id = candidateId || reportId;

        const data = await getInterviewReport(id!);

        if (data === null || data.status === 'not_found') {
          setError('Relatório ainda não está disponível. Por favor, aguarde alguns minutos.');
          return;
        }

        if (data.status === 'processing') {
          setError('O relatório está sendo processado. Por favor, aguarde alguns minutos e recarregue a página.');
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

    fetchReport();
  }, [candidateId, reportId, navigate]);

  const getCriteriaScore = (value: number | CriteriaScore): number => {
    if (typeof value === 'number') return value;
    return value.score;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 7) return 'bg-green-500';
    if (score >= 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Relatório não disponível</h3>
              <p className="text-red-600 mt-1">{error || 'Não foi possível carregar o relatório.'}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard/reports')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Voltar para Relatórios
          </button>
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
    if (report.recommendation === 'approve') return 'text-green-600';
    if (report.recommendation === 'reject') return 'text-red-600';
    return 'text-purple-600';
  };

  const getRecommendationBgColor = () => {
    if (report.recommendation === 'approve') return 'bg-green-50 border-green-200';
    if (report.recommendation === 'reject') return 'bg-red-50 border-red-200';
    return 'bg-purple-50 border-purple-200';
  };

  const getRecommendationText = () => {
    if (report.recommendation === 'approve') return '✅ Recomendado para Aprovação';
    if (report.recommendation === 'reject') return '❌ Não Recomendado';
    return '🧪 Teste Técnico Recomendado';
  };

  const RecommendationIcon = getRecommendationIcon();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </button>
      </div>

      {/* Overall Score Card */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-green-500 mb-4">
            <Award className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-4xl font-bold mb-2 text-gray-900">
            {report.overallScore ? `${report.overallScore}/10` : 'N/A'}
          </h1>

          <p className="text-lg text-gray-600">
            Pontuação Geral
          </p>
        </div>
      </div>

      {/* Recommendation Card */}
      {report.recommendation && (
        <div className={`rounded-lg border-2 p-6 mb-8 ${getRecommendationBgColor()}`}>
          <div className="flex items-center">
            <RecommendationIcon className={`w-8 h-8 mr-4 ${getRecommendationColor()}`} />
            <div>
              <h2 className={`text-2xl font-bold ${getRecommendationColor()}`}>
                {getRecommendationText()}
              </h2>
            </div>
          </div>
        </div>
      )}

      {/* Summary Card */}
      {report.summary && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <FileText className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Resumo da Entrevista</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">{report.summary}</p>
        </div>
      )}

      {/* Criteria Scores */}
      {report.criteriaScores && Object.keys(report.criteriaScores).length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center mb-6">
            <Star className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Avaliação por Critérios</h2>
          </div>

          <div className="space-y-4">
            {Object.entries(report.criteriaScores).map(([key, value]) => {
              const score = getCriteriaScore(value);
              const percentage = (score / 10) * 100;

              return (
                <div key={key}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-800 capitalize">
                      {key.split('_').join(' ')}
                    </span>
                    <span className="text-lg font-bold text-blue-600">{score}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${getScoreColor(score)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  {typeof value === 'object' && value.justification && (
                    <p className="text-sm text-gray-600 mt-1">{value.justification}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Strengths */}
        {report.strengths && report.strengths.length > 0 && (
          <div className="bg-green-50 rounded-lg border-2 border-green-200 p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-xl font-bold text-green-800">Pontos Fortes</h2>
            </div>
            <ul className="space-y-3">
              {report.strengths.map((strength) => (
                <li key={crypto.randomUUID()} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {report.weaknesses && report.weaknesses.length > 0 && (
          <div className="bg-red-50 rounded-lg border-2 border-red-200 p-6">
            <div className="flex items-center mb-4">
              <TrendingDown className="w-6 h-6 text-red-600 mr-3" />
              <h2 className="text-xl font-bold text-red-800">Pontos de Melhoria</h2>
            </div>
            <ul className="space-y-3">
              {report.weaknesses.map((weakness) => (
                <li key={crypto.randomUUID()} className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/dashboard/candidates')}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          Ver Todos os Candidatos
        </button>
        <button
          onClick={() => navigate('/dashboard/reports')}
          className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
        >
          Ver Todos os Relatórios
        </button>
      </div>
    </div>
  );
}
