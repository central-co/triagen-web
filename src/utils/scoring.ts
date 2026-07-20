// Scoring helpers for interview_reports.criteria_scores, which stores per-criterion
// scores on a 0-3 scale: [{ criterion, covered, score, reasoning, evidence, gaps }, ...].
// jobs.criteria stores the weight (0-1) used to evaluate each named criterion.
//
// All scores exposed to the UI are on a 0-100 scale.

export interface CriterionScoreEntry {
  criterion: string;
  covered?: boolean;
  score: number; // 0-3
  reasoning?: string | null;
  evidence?: string[];
  gaps?: string | null;
}

export interface JobCriterionEntry {
  name: string;
  weight: number; // 0-1
  mandatory?: boolean;
}

/** Structured per-criterion data ready for rendering (score on 0-100). */
export interface DisplayCriterionScore {
  criterion: string;
  score: number;
  covered: boolean;
  reasoning: string | null;
  evidence: string[];
  gaps: string | null;
}

const MIN_RAW_SCORE = 0;
const MAX_RAW_SCORE = 3;

function normalizeToPercent(rawScore: number): number {
  const clamped = Math.min(MAX_RAW_SCORE, Math.max(MIN_RAW_SCORE, rawScore));
  return ((clamped - MIN_RAW_SCORE) / (MAX_RAW_SCORE - MIN_RAW_SCORE)) * 100;
}

export function parseCriteriaScores(value: unknown): CriterionScoreEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (entry): entry is CriterionScoreEntry =>
      !!entry &&
      typeof entry === 'object' &&
      typeof (entry as CriterionScoreEntry).criterion === 'string' &&
      typeof (entry as CriterionScoreEntry).score === 'number',
  );
}

export function parseJobCriteria(value: unknown): JobCriterionEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (entry): entry is JobCriterionEntry =>
      !!entry &&
      typeof entry === 'object' &&
      typeof (entry as JobCriterionEntry).name === 'string' &&
      typeof (entry as JobCriterionEntry).weight === 'number',
  );
}

/**
 * Weighted average of criteria_scores (1-4 scale), using jobs.criteria weights
 * matched by name, normalized to a 0-100 scale. Criteria with no matching
 * weight are split evenly across the remaining weight.
 */
export function computeOverallScore(
  criteriaScoresJson: unknown,
  jobCriteriaJson: unknown,
): number | undefined {
  const scores = parseCriteriaScores(criteriaScoresJson);
  if (scores.length === 0) return undefined;

  const weightByName = new Map(
    parseJobCriteria(jobCriteriaJson).map((c) => [c.name, c.weight]),
  );
  const fallbackWeight = 1 / scores.length;

  let weightedSum = 0;
  let weightTotal = 0;
  for (const entry of scores) {
    const weight = weightByName.get(entry.criterion) ?? fallbackWeight;
    weightedSum += entry.score * weight;
    weightTotal += weight;
  }
  if (weightTotal === 0) return undefined;

  return Math.round(normalizeToPercent(weightedSum / weightTotal));
}

export type Recommendation = 'advance' | 'advance_with_reservations' | 'do_not_advance';

/**
 * The analyzer prompt writes the recommendation as the first words of the
 * summary ("Avançar", "Avançar com ressalvas", "Não avançar"). Extract it so
 * the UI can render a proper verdict chip; returns the summary without the
 * leading recommendation when matched.
 */
export function parseRecommendation(summary: string | undefined): {
  recommendation: Recommendation | null;
  summaryText: string;
} {
  const text = (summary || '').trim();
  const patterns: Array<[RegExp, Recommendation]> = [
    [/^n[ãa]o avan[çc]ar\b/i, 'do_not_advance'],
    [/^avan[çc]ar com ressalvas\b/i, 'advance_with_reservations'],
    [/^avan[çc]ar\b/i, 'advance'],
  ];
  for (const [pattern, recommendation] of patterns) {
    const match = pattern.exec(text);
    if (match) {
      const rest = text.slice(match[0].length).replace(/^[\s.:—–-]+/, '');
      return { recommendation, summaryText: rest || text };
    }
  }
  return { recommendation: null, summaryText: text };
}

/** Maps raw criteria_scores JSON to structured display entries (0-100 scores). */
export function toDisplayCriteriaScores(criteriaScoresJson: unknown): DisplayCriterionScore[] {
  return parseCriteriaScores(criteriaScoresJson).map((entry) => ({
    criterion: entry.criterion,
    score: Math.round(normalizeToPercent(entry.score)),
    covered: entry.covered ?? true,
    reasoning: typeof entry.reasoning === 'string' && entry.reasoning.trim() !== '' ? entry.reasoning : null,
    evidence: (entry.evidence ?? []).filter((quote) => typeof quote === 'string' && quote.trim() !== ''),
    gaps: typeof entry.gaps === 'string' && entry.gaps.trim() !== '' ? entry.gaps : null,
  }));
}
