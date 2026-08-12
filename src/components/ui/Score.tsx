/**
 * Unified score visualization. Every compatibility score in the product
 * renders through these components so color-coding stays consistent:
 * sage ≥ 75%, amber ≥ 50%, red below — computed as a percentage of
 * maxScore, so the same thresholds apply whether a score is 0-100
 * (aggregate/overall scores) or 0-3 (per-criterion scores).
 */

export type ScoreTier = 'strong' | 'medium' | 'weak';

export function scoreTier(score: number, maxScore = 100): ScoreTier {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  if (pct >= 75) return 'strong';
  if (pct >= 50) return 'medium';
  return 'weak';
}

export function scoreTextColor(score: number, darkMode: boolean, maxScore = 100): string {
  switch (scoreTier(score, maxScore)) {
    case 'strong': return darkMode ? 'text-emerald-400' : 'text-triagen-secondary-green';
    case 'medium': return darkMode ? 'text-amber-400' : 'text-triagen-amber';
    case 'weak': return darkMode ? 'text-red-400' : 'text-red-600';
  }
}

export function scoreStrokeColor(score: number, maxScore = 100): string {
  switch (scoreTier(score, maxScore)) {
    case 'strong': return '#3F7A5E';
    case 'medium': return '#D97706';
    case 'weak': return '#DC2626';
  }
}

export function scoreBarColor(score: number, maxScore = 100): string {
  switch (scoreTier(score, maxScore)) {
    case 'strong': return 'bg-triagen-secondary-green';
    case 'medium': return 'bg-amber-500';
    case 'weak': return 'bg-red-500';
  }
}

interface ScoreRingProps {
  /** 0-100 */
  score: number;
  size?: 'sm' | 'md' | 'lg';
  darkMode?: boolean;
  /** Small label under the number (lg only). */
  label?: string;
}

const RING_SIZES = {
  sm: { box: 44, stroke: 4, text: 'text-[0.8rem]' },
  md: { box: 64, stroke: 5, text: 'text-lg' },
  lg: { box: 132, stroke: 8, text: 'text-4xl' },
};

export function ScoreRing({ score, size = 'md', darkMode = false, label }: Readonly<ScoreRingProps>) {
  const clamped = Math.min(100, Math.max(0, score));
  const { box, stroke, text } = RING_SIZES[size];
  const radius = (box - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (clamped / 100) * circumference;
  const trackColor = darkMode ? 'rgba(148,163,184,0.18)' : 'rgba(44,62,80,0.09)';

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: box, height: box }}
      role="img"
      aria-label={`${Math.round(clamped)} de 100`}
    >
      <svg width={box} height={box} className="-rotate-90" aria-hidden="true">
        <circle
          cx={box / 2} cy={box / 2} r={radius}
          fill="none" stroke={trackColor} strokeWidth={stroke}
        />
        <circle
          cx={box / 2} cy={box / 2} r={radius}
          fill="none" stroke={scoreStrokeColor(clamped)} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference - filled}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-heading leading-none ${text} ${scoreTextColor(clamped, darkMode)}`}>
          {Math.round(clamped)}
        </span>
        {label && size === 'lg' && (
          <span className={`text-[0.6rem] uppercase tracking-widest font-semibold mt-1.5 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

interface ScoreMeterProps {
  /** 0-100 */
  score: number;
  darkMode?: boolean;
  className?: string;
}

/** Slim horizontal meter, color-coded by tier. */
export function ScoreMeter({ score, darkMode = false, className = '' }: Readonly<ScoreMeterProps>) {
  const clamped = Math.min(100, Math.max(0, score));
  return (
    <div className={`h-1.5 w-full rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-triagen-primary/10'} ${className}`}>
      <div
        className={`h-full rounded-full ${scoreBarColor(clamped)}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

interface SegmentedMeterProps {
  /** Current value, on the same scale as `max`. */
  value: number;
  /** Number of discrete segments (e.g. 3 for a 0-3 criterion score). */
  max: number;
  darkMode?: boolean;
  size?: 'xs' | 'sm';
  className?: string;
}

/** Discrete block meter for small integer scales (e.g. 0-3 criterion scores). */
export function SegmentedMeter({ value, max, darkMode = false, size = 'sm', className = '' }: Readonly<SegmentedMeterProps>) {
  const clamped = Math.min(max, Math.max(0, value));
  const filled = Math.round(clamped);
  const color = scoreBarColor(clamped, max);
  const trackColor = darkMode ? 'bg-gray-700' : 'bg-triagen-primary/10';
  const height = size === 'xs' ? 'h-1' : 'h-1.5';

  return (
    <div
      className={`flex gap-1 ${className}`}
      role="img"
      aria-label={`${Math.round(clamped)} de ${max}`}
    >
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`flex-1 ${height} rounded-full ${i < filled ? color : trackColor}`}
        />
      ))}
    </div>
  );
}
