import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Quote,
  AlertTriangle,
  Sparkles,
  User,
  ThumbsUp,
  ShieldAlert,
  XCircle
} from 'lucide-react';
import { getInterviewReport, DashboardReportData } from '../../../api/reports';
import { parseRecommendation, Recommendation } from '../../../utils/scoring';
import useDarkMode from '../../../hooks/useDarkMode';
import Button from '../../ui/Button';
import LoadingSpinner from '../../ui/LoadingSpinner';
import StatusMessage from '../../ui/StatusMessage';
import { ScoreRing, ScoreMeter, scoreTextColor } from '../../ui/Score';

const RECOMMENDATION_META: Record<Recommendation, {
  label: string;
  icon: typeof ThumbsUp;
  chip: (darkMode: boolean) => string;
}> = {
  advance: {
    label: 'Avançar',
    icon: ThumbsUp,
    chip: (d) => d
      ? 'bg-triagen-secondary-green/20 text-emerald-300 border-triagen-secondary-green/30'
      : 'bg-triagen-sage-tint text-triagen-secondary-green border-triagen-secondary-green/25',
  },
  advance_with_reservations: {
    label: 'Avançar com ressalvas',
    icon: ShieldAlert,
    chip: (d) => d
      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
      : 'bg-triagen-amber-tint text-triagen-amber border-triagen-amber/25',
  },
  do_not_advance: {
    label: 'Não avançar',
    icon: XCircle,
    chip: (d) => d
      ? 'bg-red-500/15 text-red-300 border-red-500/30'
      : 'bg-red-50 text-red-700 border-red-200',
  },
};

export default function DashboardReportDetailPage() {
  const { candidateId, reportId } = useParams<{ candidateId?: string; reportId?: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<DashboardReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { darkMode } = useDarkMode();

  useEffect(() => {
    if (!candidateId && !reportId) {
      navigate('/dashboard/reports');
      return;
    }

    let cancelled = false;

    getInterviewReport({ candidateId, reportId })
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
  }, [candidateId, reportId, navigate]);

  const backPath = candidateId ? `/dashboard/candidates/${candidateId}` : '/dashboard/reports';

  if (loading) {
    return <LoadingSpinner label="Carregando relatório" />;
  }

  if (error || !report) {
    return (
      <div className="max-w-6xl mx-auto py-12">
        <Button onClick={() => navigate(backPath)} variant="outline" size="sm" icon={ArrowLeft} iconPosition="left" darkMode={darkMode}>
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

  const { summary, overallScore, highlights, criteriaScores, status, candidate_name, job_title, createdAt } = report;
  const isCompleted = status === 'completed';
  const { recommendation, summaryText } = parseRecommendation(summary);
  const recommendationMeta = recommendation ? RECOMMENDATION_META[recommendation] : null;
  const highlightItems = (highlights || '')
    .split('\n')
    .map((line) => line.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);

  return (
    <div className="flex flex-col max-w-5xl mx-auto pb-16">

      {/* Breadcrumb / Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 mb-10">
        <button
          onClick={() => navigate(backPath)}
          className={`flex items-center gap-2 text-xs uppercase tracking-widest font-semibold hover:opacity-70 transition-opacity ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}
        >
          <ArrowLeft className="w-4 h-4" /> {candidateId ? 'Perfil do candidato' : 'Relatórios'}
        </button>
        {report.candidateId && !candidateId && (
          <Button
            variant="secondary"
            size="sm"
            icon={User}
            iconPosition="left"
            darkMode={darkMode}
            onClick={() => navigate(`/dashboard/candidates/${report.candidateId}`)}
          >
            Ver perfil do candidato
          </Button>
        )}
      </div>

      {/* Hero: identity + verdict + score */}
      <div className={`rounded-lg border p-8 md:p-10 mb-12 ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-triagen-border-light shadow-[0_2px_16px_-8px_rgba(44,62,80,0.12)]'}`}>
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

            {recommendationMeta && (
              <div className="mt-1">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${recommendationMeta.chip(darkMode)}`}>
                  <recommendationMeta.icon className="w-4 h-4" aria-hidden="true" />
                  {recommendationMeta.label}
                </span>
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

      <div className="flex flex-col gap-14">

        {/* Executive Summary */}
        {summaryText && (
          <section className="flex flex-col gap-5">
            <h2 className={`font-heading text-2xl pb-3 border-b ${darkMode ? 'text-white border-gray-800' : 'text-triagen-primary border-triagen-border-light'}`}>
              Resumo executivo
            </h2>
            <p className={`text-base md:text-lg leading-relaxed whitespace-pre-line max-w-3xl ${darkMode ? 'text-gray-300' : 'text-triagen-secondary'}`}>
              {summaryText}
            </p>
          </section>
        )}

        {/* Highlights */}
        {highlightItems.length > 0 && (
          <section className={`p-8 rounded-lg border ${darkMode ? 'bg-triagen-secondary-green/5 border-triagen-secondary-green/20' : 'bg-triagen-sage-tint/45 border-triagen-secondary-green/20'}`}>
            <h2 className={`flex items-center gap-2 text-xs uppercase tracking-widest font-bold mb-5 ${darkMode ? 'text-emerald-300' : 'text-triagen-secondary-green'}`}>
              <Sparkles className="w-4 h-4" /> Destaques da entrevista
            </h2>
            <ul className="flex flex-col gap-3">
              {highlightItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className={`mt-[0.55rem] w-1.5 h-1.5 rounded-full shrink-0 ${darkMode ? 'bg-emerald-400' : 'bg-triagen-secondary-green'}`} />
                  <span className={`text-sm md:text-base leading-relaxed ${darkMode ? 'text-gray-200' : 'text-triagen-primary'}`}>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Criteria */}
        {criteriaScores.length > 0 && (
          <section className="flex flex-col gap-6">
            <div className={`flex items-baseline justify-between pb-3 border-b ${darkMode ? 'border-gray-800' : 'border-triagen-border-light'}`}>
              <h2 className={`font-heading text-2xl ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>
                Critérios avaliados
              </h2>
              <span className={`text-xs uppercase tracking-widest font-semibold ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {criteriaScores.length} {criteriaScores.length === 1 ? 'critério' : 'critérios'}
              </span>
            </div>

            <div className="flex flex-col gap-6">
              {criteriaScores.map((criterion) => (
                <article
                  key={criterion.criterion}
                  className={`p-6 md:p-8 rounded-lg border ${darkMode ? 'bg-gray-800/30 border-gray-800' : 'bg-white border-triagen-border-light'}`}
                >
                  {/* Criterion header */}
                  <div className="flex items-start justify-between gap-6 mb-5">
                    <div className="min-w-0">
                      <h3 className={`font-heading text-xl leading-snug ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>
                        {criterion.criterion.replace(/_/g, ' ')}
                      </h3>
                      {!criterion.covered && (
                        <span className={`inline-flex items-center gap-1 mt-2 text-[0.65rem] uppercase tracking-widest font-semibold ${darkMode ? 'text-amber-400' : 'text-triagen-amber'}`}>
                          <AlertTriangle className="w-3 h-3" /> Cobertura parcial na entrevista
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 shrink-0">
                      <span className={`font-heading text-3xl ${scoreTextColor(criterion.score, darkMode)}`}>{criterion.score}</span>
                      <span className={`text-sm font-heading ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>/ 100</span>
                    </div>
                  </div>

                  <ScoreMeter score={criterion.score} darkMode={darkMode} className="mb-6" />

                  {/* Reasoning */}
                  {criterion.reasoning && (
                    <div className="mb-6">
                      <h4 className={`text-[0.65rem] uppercase tracking-widest font-bold mb-2 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>
                        Análise
                      </h4>
                      <p className={`text-sm md:text-base leading-relaxed ${darkMode ? 'text-gray-300' : 'text-triagen-primary'}`}>
                        {criterion.reasoning}
                      </p>
                    </div>
                  )}

                  {/* Evidence — dedicated section below the reasoning */}
                  {criterion.evidence.length > 0 && (
                    <div className={criterion.gaps ? 'mb-6' : ''}>
                      <h4 className={`flex items-center gap-1.5 text-[0.65rem] uppercase tracking-widest font-bold mb-3 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>
                        <Quote className="w-3 h-3" /> Evidências da entrevista
                      </h4>
                      <div className="flex flex-col gap-3">
                        {criterion.evidence.map((quote) => (
                          <blockquote
                            key={quote}
                            className={`border-l-2 pl-4 py-1 text-sm leading-relaxed italic ${darkMode ? 'border-triagen-secondary-green/50 text-gray-400' : 'border-triagen-secondary-green/40 text-triagen-secondary'}`}
                          >
                            “{quote}”
                          </blockquote>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gaps */}
                  {criterion.gaps && (
                    <div className={`flex items-start gap-3 p-4 rounded ${darkMode ? 'bg-amber-500/10' : 'bg-triagen-amber-tint/60'}`}>
                      <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${darkMode ? 'text-amber-400' : 'text-triagen-amber'}`} />
                      <div>
                        <h4 className={`text-[0.65rem] uppercase tracking-widest font-bold mb-1 ${darkMode ? 'text-amber-400' : 'text-triagen-amber'}`}>
                          Pontos de atenção
                        </h4>
                        <p className={`text-sm leading-relaxed ${darkMode ? 'text-amber-200/80' : 'text-amber-900/80'}`}>
                          {criterion.gaps}
                        </p>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
