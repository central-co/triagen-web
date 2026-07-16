// Scoring helpers for interview_reports.criteria_scores, which stores per-criterion
// scores on a 1-4 scale: [{ criterion, covered, score, evidence, gaps }, ...].
// jobs.criteria stores the weight (0-1) used to evaluate each named criterion.

export interface CriterionScoreEntry {
  criterion: string;
  covered?: boolean;
  score: number; // 1-4
  evidence?: string[];
  gaps?: string | null;
}

export interface JobCriterionEntry {
  name: string;
  weight: number; // 0-1
  mandatory?: boolean;
}

const MIN_RAW_SCORE = 1;
const MAX_RAW_SCORE = 4;

function normalizeToTen(rawScore: number): number {
  const clamped = Math.min(MAX_RAW_SCORE, Math.max(MIN_RAW_SCORE, rawScore));
  return ((clamped - MIN_RAW_SCORE) / (MAX_RAW_SCORE - MIN_RAW_SCORE)) * 10;
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
 * matched by name, normalized to a 0-10 scale. Criteria with no matching weight
 * are split evenly across the remaining weight.
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

  return Math.round(normalizeToTen(weightedSum / weightTotal) * 10) / 10;
}

/** Maps criteria_scores entries to the {score, justification} shape the report UIs render. */
export function toDisplayCriteriaScores(
  criteriaScoresJson: unknown,
): Record<string, { score: number; justification: string }> {
  const scores = parseCriteriaScores(criteriaScoresJson);
  const result: Record<string, { score: number; justification: string }> = {};
  for (const entry of scores) {
    result[entry.criterion] = {
      score: Math.round(normalizeToTen(entry.score) * 10) / 10,
      justification: entry.evidence?.join(' ') || entry.gaps || '',
    };
  }
  return result;
}
