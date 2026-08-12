import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, User } from 'lucide-react';
import { getInterviewReport, DashboardReportData } from '../../../api/reports';
import { parseRecommendation } from '../../../utils/scoring';
import useDarkMode from '../../../hooks/useDarkMode';
import Button from '../../ui/Button';
import LoadingSpinner from '../../ui/LoadingSpinner';
import StatusMessage from '../../ui/StatusMessage';
import { ScoreRing } from '../../ui/Score';
import InterviewReportView, { RecommendationChip, RECOMMENDATION_META } from './InterviewReportView';

/**
 * Standalone report route. Evaluations normally live on the candidate's page —
 * this remains for reports whose candidate record can't be resolved.
 */
export default function DashboardReportDetailPage() {
  const { reportId } = useParams<{ reportId?: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<DashboardReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { darkMode } = useDarkMode();

  useEffect(() => {
    if (!reportId) {
      navigate('/dashboard/candidates');
      return;
    }

    let cancelled = false;

    getInterviewReport({ reportId })
      .then((data) => {
        if (cancelled) return;
        if (data === null) {
          setError('O relatório ainda não está disponível. A análise pode levar alguns minutos após o fim da entrevista.');
          return;
        }
        setReport(data);
      })
      .catch((err) => {
        console.error('Failed to fetch report:', err);
        if (!cancelled) setError('Não foi possível carregar o relatório da entrevista.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [reportId, navigate]);

  if (loading) {
    return <LoadingSpinner label="Carregando relatório" />;
  }

  if (error || !report) {
    return (
      <div className="max-w-5xl mx-auto py-12">
        <Button onClick={() => navigate('/dashboard/candidates')} variant="outline" size="sm" icon={ArrowLeft} iconPosition="left">
          Voltar
        </Button>
        <div className="mt-8">
          <StatusMessage
            type="warning"
            title="Relatório indisponível"
            message={error || 'Relatório não encontrado.'}
            darkMode={darkMode}
          />
        </div>
      </div>
    );
  }

  const { overallScore, status, candidate_name, job_title, createdAt, candidateId } = report;
  const isCompleted = status === 'completed';
  const { recommendation } = parseRecommendation(report.summary);

  return (
    <div className="flex flex-col max-w-5xl mx-auto pb-16">

      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 mb-10">
        <button
          onClick={() => navigate('/dashboard/candidates')}
          className={`flex items-center gap-2 text-xs uppercase tracking-widest font-semibold hover:opacity-70 transition-opacity ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}
        >
          <ArrowLeft className="w-4 h-4" /> Candidatos
        </button>
        {candidateId && (
          <Button
            variant="secondary"
            size="sm"
            icon={User}
            iconPosition="left"
            onClick={() => navigate(`/dashboard/candidates/${candidateId}`)}
          >
            Ver perfil do candidato
          </Button>
        )}
      </div>

      {/* Hero: identity + verdict + score. Border-top + wash reflect the AI's
          recommendation, so the verdict reads before any text does. */}
      <div
        className={`rounded-lg border p-8 md:p-10 mb-12 rise-in ${recommendation ? `border-t-4 ${RECOMMENDATION_META[recommendation].accent(darkMode).wash}` : ''} ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-triagen-border-light shadow-[0_2px_16px_-8px_rgba(44,62,80,0.12)]'}`}
        style={recommendation ? { borderTopColor: RECOMMENDATION_META[recommendation].accent(darkMode).borderTopColor } : undefined}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex flex-col gap-4 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-2.5 py-1 rounded-full text-[0.65rem] font-bold tracking-widest uppercase ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-triagen-neutral text-triagen-secondary'}`}>
                Relatório de entrevista
              </span>
              <span className={`flex items-center gap-1.5 text-[0.65rem] uppercase tracking-widest font-semibold ${isCompleted ? (darkMode ? 'text-emerald-400' : 'text-triagen-secondary-green') : (darkMode ? 'text-gray-400' : 'text-triagen-secondary')}`}>
                {isCompleted && <CheckCircle className="w-3 h-3" />}
                {isCompleted ? 'Análise concluída' : 'Em processamento'}
              </span>
              {createdAt && (
                <span className={`text-[0.65rem] uppercase tracking-widest font-semibold ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {new Date(createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              )}
            </div>

            <h1 className={`text-4xl md:text-5xl font-heading font-normal tracking-tight leading-tight break-words ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>
              {candidate_name}
            </h1>
            <p className={`text-sm uppercase tracking-widest font-semibold ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
              {job_title}
            </p>

            {recommendation && (
              <div className="mt-1">
                <RecommendationChip recommendation={recommendation} darkMode={darkMode} />
              </div>
            )}
          </div>

          {overallScore !== undefined && (
            <div className="flex flex-col items-center gap-2 shrink-0 md:pr-4">
              <ScoreRing score={overallScore} size="lg" darkMode={darkMode} label="Compatibilidade" />
            </div>
          )}
        </div>
      </div>

      <InterviewReportView report={report} darkMode={darkMode} />
    </div>
  );
}
