import { AlertTriangle, Quote, Sparkles, ThumbsUp, ShieldAlert, XCircle } from 'lucide-react';
import type { DashboardReportData } from '../../../api/reports';
import { parseRecommendation, MAX_CRITERION_SCORE, type Recommendation } from '../../../utils/scoring';
import { SegmentedMeter, scoreTextColor } from '../../ui/Score';

/**
 * Ambient hero accent per recommendation: a border-top color (applied via
 * inline style, since Tailwind's plain `border-{color}` utility already used
 * on hero cards sets all four sides and its cascade order relative to
 * `border-t-{color}` isn't guaranteed) plus a faint background wash class.
 * Same hex values as Score.tsx's tier stroke colors, for one consistent
 * verdict palette across the product.
 */
export const RECOMMENDATION_META: Record<Recommendation, {
  label: string;
  icon: typeof ThumbsUp;
  chip: (darkMode: boolean) => string;
  accent: (darkMode: boolean) => { borderTopColor: string; wash: string };
}> = {
  advance: {
    label: 'Avançar',
    icon: ThumbsUp,
    chip: (d) => d
      ? 'bg-triagen-secondary-green/20 text-emerald-300 border-triagen-secondary-green/30'
      : 'bg-triagen-sage-tint text-triagen-secondary-green border-triagen-secondary-green/25',
    accent: (d) => ({
      borderTopColor: '#3F7A5E',
      wash: d ? 'bg-triagen-secondary-green/5' : 'bg-triagen-sage-tint/40',
    }),
  },
  advance_with_reservations: {
    label: 'Avançar com ressalvas',
    icon: ShieldAlert,
    chip: (d) => d
      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
      : 'bg-triagen-amber-tint text-triagen-amber border-triagen-amber/25',
    accent: (d) => ({
      borderTopColor: '#D97706',
      wash: d ? 'bg-amber-500/5' : 'bg-triagen-amber-tint/40',
    }),
  },
  do_not_advance: {
    label: 'Não avançar',
    icon: XCircle,
    chip: (d) => d
      ? 'bg-red-500/15 text-red-300 border-red-500/30'
      : 'bg-red-50 text-red-700 border-red-200',
    accent: (d) => ({
      borderTopColor: '#DC2626',
      wash: d ? 'bg-red-500/5' : 'bg-red-50/60',
    }),
  },
};

/** The AI's verdict, shown next to the candidate's name. */
export function RecommendationChip({ recommendation, darkMode }: Readonly<{
  recommendation: Recommendation;
  darkMode: boolean;
}>) {
  const meta = RECOMMENDATION_META[recommendation];
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${meta.chip(darkMode)}`}>
      <meta.icon className="w-4 h-4" aria-hidden="true" />
      {meta.label}
    </span>
  );
}

function criterionSlug(criterion: string): string {
  return `criterio-${criterion.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`;
}

interface InterviewReportViewProps {
  report: DashboardReportData;
  darkMode: boolean;
}

const sectionTitle = (text: string, darkMode: boolean) => (
  <h2 className={`font-heading text-2xl pb-3 border-b ${darkMode ? 'text-white border-gray-800' : 'text-triagen-primary border-triagen-border-light'}`}>
    {text}
  </h2>
);

/** Executive summary + interview highlights — the narrative half of a report. */
export function ReportSummarySection({ report, darkMode }: Readonly<InterviewReportViewProps>) {
  const { summary, highlights } = report;
  const { summaryText } = parseRecommendation(summary);

  const highlightItems = (highlights || '')
    .split('\n')
    .map((line) => line.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);

  if (!summaryText && highlightItems.length === 0) return null;

  return (
    <div className="flex flex-col gap-12 rise-in rise-in-delay-1">
      {summaryText && (
        <section className="flex flex-col gap-5">
          {sectionTitle('Resumo executivo', darkMode)}
          <p className={`text-base md:text-lg leading-relaxed whitespace-pre-line max-w-3xl ${darkMode ? 'text-gray-300' : 'text-triagen-secondary'}`}>
            {summaryText}
          </p>
        </section>
      )}

      {highlightItems.length > 0 && (
        <section className={`p-8 rounded-lg border ${darkMode ? 'bg-triagen-secondary-green/5 border-triagen-secondary-green/20' : 'bg-triagen-sage-tint/45 border-triagen-secondary-green/20'}`}>
          <h2 className={`flex items-center gap-2 text-xs uppercase tracking-widest font-bold mb-5 ${darkMode ? 'text-emerald-300' : 'text-triagen-secondary-green'}`}>
            <Sparkles className="w-4 h-4" aria-hidden="true" /> Destaques da entrevista
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
    </div>
  );
}

/**
 * Per-criterion analysis: the at-a-glance overview strip plus full evidence
 * cards. Kept separate from ReportSummarySection so pages with a narrow
 * sidebar (candidate profile) can give this section the full page width
 * instead of squeezing it into the same column as the summary.
 */
export function ReportCriteriaSection({ report, darkMode }: Readonly<InterviewReportViewProps>) {
  const { criteriaScores } = report;

  if (criteriaScores.length === 0) return null;

  return (
    <section className="flex flex-col gap-6">
      <div className={`flex items-baseline justify-between pb-3 border-b rise-in rise-in-delay-2 ${darkMode ? 'border-gray-800' : 'border-triagen-border-light'}`}>
        <h2 className={`font-heading text-2xl ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>
          Critérios avaliados
        </h2>
        <span className={`text-xs uppercase tracking-widest font-semibold ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          {criteriaScores.length} {criteriaScores.length === 1 ? 'critério' : 'critérios'}
        </span>
      </div>

      <div
        className={`grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3 p-5 rounded-lg border rise-in rise-in-delay-2 ${darkMode ? 'bg-gray-800/20 border-gray-800' : 'bg-neutral-50/60 border-triagen-border-light'}`}
      >
        {criteriaScores.map((criterion) => (
          <button
            key={criterion.criterion}
            type="button"
            onClick={() => {
              document.getElementById(criterionSlug(criterion.criterion))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className={`flex items-center gap-3 p-3 rounded text-left transition-colors ${darkMode ? 'hover:bg-gray-700/40' : 'hover:bg-white'}`}
          >
            <span className={`flex-1 min-w-0 text-xs font-semibold uppercase tracking-wide leading-snug line-clamp-2 ${darkMode ? 'text-gray-300' : 'text-triagen-primary'}`}>
              {criterion.criterion.replace(/_/g, ' ')}
            </span>
            <SegmentedMeter value={criterion.score} max={MAX_CRITERION_SCORE} darkMode={darkMode} size="xs" className="w-12 shrink-0" />
            <span className={`shrink-0 text-xs font-heading ${scoreTextColor(criterion.score, darkMode, MAX_CRITERION_SCORE)}`}>
              {criterion.score}/{MAX_CRITERION_SCORE}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {criteriaScores.map((criterion, index) => (
          <article
            key={criterion.criterion}
            id={criterionSlug(criterion.criterion)}
            className={`p-6 md:p-8 rounded-lg border scroll-mt-24 rise-in ${darkMode ? 'bg-gray-800/30 border-gray-800' : 'bg-white border-triagen-border-light'}`}
            style={{ animationDelay: `${240 + Math.min(index, 6) * 40}ms` }}
          >
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
                <span className={`font-heading text-3xl ${scoreTextColor(criterion.score, darkMode, MAX_CRITERION_SCORE)}`}>{criterion.score}</span>
                <span className={`text-sm font-heading ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>/ {MAX_CRITERION_SCORE}</span>
              </div>
            </div>

            <SegmentedMeter value={criterion.score} max={MAX_CRITERION_SCORE} darkMode={darkMode} className="mb-6 max-w-xs" />

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

            {criterion.evidence.length > 0 && (
              <div className={criterion.gaps ? 'mb-6' : ''}>
                <h4 className={`flex items-center gap-1.5 text-[0.65rem] uppercase tracking-widest font-bold mb-3 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>
                  <Quote className="w-3 h-3" /> Evidências da entrevista
                </h4>
                <div className="flex flex-col gap-4">
                  {criterion.evidence.map((quote) => (
                    <blockquote key={quote} className="relative pl-8">
                      <span
                        aria-hidden="true"
                        className={`select-none absolute -left-1 -top-3 font-heading text-6xl leading-none ${darkMode ? 'text-triagen-secondary-green/20' : 'text-triagen-secondary-green/15'}`}
                      >
                        “
                      </span>
                      <p className={`relative text-sm leading-relaxed italic ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
                        {quote}
                      </p>
                    </blockquote>
                  ))}
                </div>
              </div>
            )}

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
  );
}

/**
 * The full body of an interview evaluation: summary, highlights and
 * per-criterion analysis with evidence, stacked in reading order. Used by
 * the standalone report route, which has no sidebar to work around. Pages
 * with a narrow sidebar (candidate profile) compose ReportSummarySection
 * and ReportCriteriaSection directly instead, so criteria can span the
 * full page width.
 */
function InterviewReportView({ report, darkMode }: Readonly<InterviewReportViewProps>) {
  return (
    <div className="flex flex-col gap-12">
      <ReportSummarySection report={report} darkMode={darkMode} />
      <ReportCriteriaSection report={report} darkMode={darkMode} />
    </div>
  );
}

export default InterviewReportView;
