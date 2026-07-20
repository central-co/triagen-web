/**
 * Unified score visualization. Every compatibility score in the product
 * renders through these components so color-coding stays consistent:
 * sage ≥ 75, amber ≥ 50, red below — always on a 0-100 scale.
 */

export type ScoreTier = 'strong' | 'medium' | 'weak';

export function scoreTier(score: number): ScoreTier {
  if (score >= 75) return 'strong';
  if (score >= 50) return 'medium';
  return 'weak';
}

export function scoreTextColor(score: number, darkMode: boolean): string {
  switch (scoreTier(score)) {
    case 'strong': return darkMode ? 'text-emerald-400' : 'text-triagen-secondary-green';
    case 'medium': return darkMode ? 'text-amber-400' : 'text-triagen-amber';
    case 'weak': return darkMode ? 'text-red-400' : 'text-red-600';
  }
}

export function scoreStrokeColor(score: number): string {
  switch (scoreTier(score)) {
    case 'strong': return '#3F7A5E';
    case 'medium': return '#D97706';
    case 'weak': return '#DC2626';
  }
}

export function scoreBarColor(score: number): string {
  switch (scoreTier(score)) {
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
