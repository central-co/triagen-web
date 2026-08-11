import { AlertTriangle, Quote, Sparkles, ThumbsUp, ShieldAlert, XCircle } from 'lucide-react';
import type { DashboardReportData } from '../../../api/reports';
import { parseRecommendation, type Recommendation } from '../../../utils/scoring';
import { ScoreMeter, scoreTextColor } from '../../ui/Score';

export const RECOMMENDATION_META: Record<Recommendation, {
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

interface InterviewReportViewProps {
  report: DashboardReportData;
  darkMode: boolean;
}

/**
 * The body of an interview evaluation: summary, highlights and per-criterion
 * analysis with evidence. Rendered inside the candidate profile, and reused by
 * the standalone report route for reports with no candidate attached.
 */
function InterviewReportView({ report, darkMode }: Readonly<InterviewReportViewProps>) {
  const { summary, highlights, criteriaScores } = report;
  const { summaryText } = parseRecommendation(summary);

  const highlightItems = (highlights || '')
    .split('\n')
    .map((line) => line.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);

  const sectionTitle = (text: string) => (
    <h2 className={`font-heading text-2xl pb-3 border-b ${darkMode ? 'text-white border-gray-800' : 'text-triagen-primary border-triagen-border-light'}`}>
      {text}
    </h2>
  );

  return (
    <div className="flex flex-col gap-12">
      {summaryText && (
        <section className="flex flex-col gap-5">
          {sectionTitle('Resumo executivo')}
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
  );
}

export default InterviewReportView;
