# Report Criteria Scale (0-3) + Score Overview Indicators Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show per-criterion report scores on their native 0-3 scale (not 0-100), and add compact visual score indicators — a criteria overview strip on the report, a mini bar on candidate list rows — so users can gauge performance without reading every detail.

**Architecture:** Pure frontend change in `triagen-web-new` (React + TS + Tailwind). Data-layer change in `src/utils/scoring.ts` stops normalizing per-criterion scores to 0-100. `src/components/ui/Score.tsx` gains a `maxScore`-aware tier system and a new `SegmentedMeter` component (discrete blocks, for the 0-3 scale). Report and candidate-list components consume these.

**Tech Stack:** React, TypeScript, Tailwind CSS, lucide-react icons. No test framework is configured in this project (no jest/vitest, no `test` script in `package.json`) — verification per task uses `npx tsc --noEmit -p tsconfig.app.json` and `npm run lint`, with a final manual browser check in the last task. Do not introduce a new test framework as part of this plan.

## Global Constraints

- Aggregate/overall compatibility scores (`computeOverallScore`, `ScoreRing`, KPI averages) stay on the 0-100 scale everywhere — only **per-criterion** scores move to 0-3. This applies to every task below.
- Follow existing color/tier conventions: strong ≥75%, medium ≥50%, else weak, using `triagen-secondary-green` / amber / red — do not introduce new thresholds or colors.
- Preserve dark-mode support (`darkMode` boolean prop) in every component touched.
- No new dependencies. No new generic `Badge`/`Progress` primitives — extend `src/components/ui/Score.tsx`.
- Run `npx tsc --noEmit -p tsconfig.app.json` and `npm run lint` after every task; both must be clean before moving on.

---

### Task 1: Data layer — expose raw 0-3 criteria scores

**Files:**
- Modify: `src/utils/scoring.ts`

**Interfaces:**
- Consumes: nothing new (uses existing `MIN_RAW_SCORE`/`MAX_RAW_SCORE` constants already in the file).
- Produces: `export const MAX_CRITERION_SCORE = 3;` — later tasks (`InterviewReportView.tsx`) import this instead of hardcoding `3`. `toDisplayCriteriaScores(...)` now returns `DisplayCriterionScore.score` as an integer clamped to `[0, 3]` (previously `[0, 100]`). `computeOverallScore` is unchanged (still 0-100).

- [ ] **Step 1: Update the module doc comment and `DisplayCriterionScore` type comment**

In `src/utils/scoring.ts`, change line 8 from:

```ts
// All scores exposed to the UI are on a 0-100 scale.
```

to:

```ts
// Per-criterion scores exposed to the UI stay on their native 0-3 scale.
// The aggregate score (computeOverallScore) is normalized to 0-100.
```

And change the `DisplayCriterionScore` doc comment (currently `/** Structured per-criterion data ready for rendering (score on 0-100). */`) to:

```ts
/** Structured per-criterion data ready for rendering (score on 0-3). */
```

Add a `// 0-3` comment next to the `score: number;` field in `DisplayCriterionScore`, mirroring the one already on `CriterionScoreEntry.score`.

- [ ] **Step 2: Add `MAX_CRITERION_SCORE` and a clamp helper**

Directly below the existing `normalizeToPercent` function (after line 41), add:

```ts
/** Per-criterion scores are always on this scale (see CriterionScoreEntry.score). */
export const MAX_CRITERION_SCORE = MAX_RAW_SCORE;

function clampCriterionScore(rawScore: number): number {
  return Math.round(Math.min(MAX_RAW_SCORE, Math.max(MIN_RAW_SCORE, rawScore)));
}
```

- [ ] **Step 3: Change `toDisplayCriteriaScores` to stop normalizing to percent**

Replace:

```ts
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
```

with:

```ts
/** Maps raw criteria_scores JSON to structured display entries (0-3 scores). */
export function toDisplayCriteriaScores(criteriaScoresJson: unknown): DisplayCriterionScore[] {
  return parseCriteriaScores(criteriaScoresJson).map((entry) => ({
    criterion: entry.criterion,
    score: clampCriterionScore(entry.score),
    covered: entry.covered ?? true,
    reasoning: typeof entry.reasoning === 'string' && entry.reasoning.trim() !== '' ? entry.reasoning : null,
    evidence: (entry.evidence ?? []).filter((quote) => typeof quote === 'string' && quote.trim() !== ''),
    gaps: typeof entry.gaps === 'string' && entry.gaps.trim() !== '' ? entry.gaps : null,
  }));
}
```

Leave `computeOverallScore` untouched — it must keep calling `normalizeToPercent` and returning 0-100.

- [ ] **Step 4: Verify**

Run:
```bash
npx tsc --noEmit -p tsconfig.app.json && npm run lint
```
Expected: no errors. Then sanity-check the logic by inspection: `parseCriteriaScores` output has `score` 0-3 (per `CriterionScoreEntry`), `clampCriterionScore` clamps to `[0,3]` and rounds, so `toDisplayCriteriaScores(...)[i].score` is now an integer in `[0,3]`. `computeOverallScore` still calls `normalizeToPercent`, unchanged.

- [ ] **Step 5: Commit**

```bash
git add src/utils/scoring.ts
git commit -m "feat: expose per-criterion report scores on native 0-3 scale"
```

---

### Task 2: `ui/Score.tsx` — maxScore-aware tiers + `SegmentedMeter`

**Files:**
- Modify: `src/components/ui/Score.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces:
  - `scoreTier(score: number, maxScore?: number): ScoreTier` (was `(score: number)`)
  - `scoreTextColor(score: number, darkMode: boolean, maxScore?: number): string`
  - `scoreStrokeColor(score: number, maxScore?: number): string`
  - `scoreBarColor(score: number, maxScore?: number): string`
  - New: `SegmentedMeter({ value, max, darkMode, size, className }: SegmentedMeterProps)` — discrete block meter, used by Task 3 for per-criterion display with `max={3}`.
  - `ScoreRing` and `ScoreMeter` keep their existing signatures and 0-100 behavior (call sites are unaffected since `maxScore` defaults to `100`).

- [ ] **Step 1: Generalize the tier/color helpers to accept `maxScore`**

Replace lines 9-37 (the `scoreTier` through `scoreBarColor` functions) with:

```ts
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
```

This is a pure signature widening (new optional trailing parameter), so every existing call site (`ScoreRing`, `ScoreMeter`, `InterviewReportView.tsx`, `CandidatesPage.tsx`, `CandidateProfilePage.tsx`) keeps compiling and behaving exactly as before.

- [ ] **Step 2: Update the file's top doc comment**

Replace the file header comment (lines 1-5):

```ts
/**
 * Unified score visualization. Every compatibility score in the product
 * renders through these components so color-coding stays consistent:
 * sage ≥ 75, amber ≥ 50, red below — always on a 0-100 scale.
 */
```

with:

```ts
/**
 * Unified score visualization. Every compatibility score in the product
 * renders through these components so color-coding stays consistent:
 * sage ≥ 75%, amber ≥ 50%, red below — computed as a percentage of
 * maxScore, so the same thresholds apply whether a score is 0-100
 * (aggregate/overall scores) or 0-3 (per-criterion scores).
 */
```

- [ ] **Step 3: Add the `SegmentedMeter` component**

At the end of the file (after the existing `ScoreMeter` function), add:

```ts
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
```

- [ ] **Step 4: Verify**

Run:
```bash
npx tsc --noEmit -p tsconfig.app.json && npm run lint
```
Expected: no errors. `SegmentedMeter` is not yet imported anywhere, so confirm there's no "unused export" lint rule tripping (this codebase's `noUnusedLocals`/`noUnusedParameters` in `tsconfig.app.json` only flag unused *locals*, not unused exports, so this is safe).

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Score.tsx
git commit -m "feat: generalize Score.tsx tiers to any scale, add SegmentedMeter"
```

---

### Task 3: Report — 0-3 display, `SegmentedMeter`, and criteria overview strip

**Files:**
- Modify: `src/components/dashboard/reports/InterviewReportView.tsx`

**Interfaces:**
- Consumes: `SegmentedMeter`, `scoreTextColor` from `../../ui/Score` (Task 2); `MAX_CRITERION_SCORE` from `../../../utils/scoring` (Task 1). `DashboardReportData.criteriaScores[i].score` is now 0-3 (Task 1).
- Produces: no new exports — `InterviewReportView` default export signature is unchanged.

- [ ] **Step 1: Update imports**

Change:

```ts
import { parseRecommendation, type Recommendation } from '../../../utils/scoring';
import { ScoreMeter, scoreTextColor } from '../../ui/Score';
```

to:

```ts
import { parseRecommendation, MAX_CRITERION_SCORE, type Recommendation } from '../../../utils/scoring';
import { SegmentedMeter, scoreTextColor } from '../../ui/Score';
```

(`ScoreMeter` is no longer used in this file — it's replaced by `SegmentedMeter` for criteria; it stays used elsewhere for overall scores.)

- [ ] **Step 2: Add a slug helper for scroll-to anchors**

Above the `InterviewReportView` function definition, add:

```ts
function criterionSlug(criterion: string): string {
  return `criterio-${criterion.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`;
}
```

- [ ] **Step 3: Update the per-criterion score display and meter**

Replace (current lines 128-134):

```jsx
<div className="flex items-baseline gap-1 shrink-0">
  <span className={`font-heading text-3xl ${scoreTextColor(criterion.score, darkMode)}`}>{criterion.score}</span>
  <span className={`text-sm font-heading ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>/ 100</span>
</div>
```
```jsx
                <ScoreMeter score={criterion.score} darkMode={darkMode} className="mb-6" />
```

with:

```jsx
<div className="flex items-baseline gap-1 shrink-0">
  <span className={`font-heading text-3xl ${scoreTextColor(criterion.score, darkMode, MAX_CRITERION_SCORE)}`}>{criterion.score}</span>
  <span className={`text-sm font-heading ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>/ {MAX_CRITERION_SCORE}</span>
</div>
```
```jsx
                <SegmentedMeter value={criterion.score} max={MAX_CRITERION_SCORE} darkMode={darkMode} className="mb-6" />
```

- [ ] **Step 4: Add the `id` anchor to each criterion `<article>`**

Change the `<article>` opening tag (current lines 113-116):

```jsx
<article
  key={criterion.criterion}
  className={`p-6 md:p-8 rounded-lg border ${darkMode ? 'bg-gray-800/30 border-gray-800' : 'bg-white border-triagen-border-light'}`}
>
```

to:

```jsx
<article
  key={criterion.criterion}
  id={criterionSlug(criterion.criterion)}
  className={`p-6 md:p-8 rounded-lg border scroll-mt-24 ${darkMode ? 'bg-gray-800/30 border-gray-800' : 'bg-white border-triagen-border-light'}`}
>
```

(`scroll-mt-24` gives the anchored scroll target breathing room above a sticky header, matching common Tailwind scroll-anchor practice.)

- [ ] **Step 5: Add the criteria overview strip**

Insert it right after the section header block and before the detail-cards `<div>` (i.e., after the closing `</div>` of the header block that currently ends around line 109, before `<div className="flex flex-col gap-6">` at line 111):

```jsx
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-5 rounded-lg border ${darkMode ? 'bg-gray-800/20 border-gray-800' : 'bg-neutral-50/60 border-triagen-border-light'}`}
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
                <span className={`flex-1 min-w-0 text-xs font-semibold uppercase tracking-wide truncate ${darkMode ? 'text-gray-300' : 'text-triagen-primary'}`}>
                  {criterion.criterion.replace(/_/g, ' ')}
                </span>
                <SegmentedMeter value={criterion.score} max={MAX_CRITERION_SCORE} darkMode={darkMode} size="xs" className="w-12 shrink-0" />
                <span className={`shrink-0 text-xs font-heading ${scoreTextColor(criterion.score, darkMode, MAX_CRITERION_SCORE)}`}>
                  {criterion.score}/{MAX_CRITERION_SCORE}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-6">
```

(This replaces the plain opening `<div className="flex flex-col gap-6">` with the same tag preceded by the new overview grid — the closing `</div>` for the detail-cards wrapper stays where it already is.)

- [ ] **Step 6: Verify**

Run:
```bash
npx tsc --noEmit -p tsconfig.app.json && npm run lint
```
Expected: no errors, no unused imports (`ScoreMeter` import removed, `SegmentedMeter` and `MAX_CRITERION_SCORE` used).

- [ ] **Step 7: Commit**

```bash
git add src/components/dashboard/reports/InterviewReportView.tsx
git commit -m "feat: show report criteria on 0-3 scale with an at-a-glance overview strip"
```

---

### Task 4: Candidate list — mini bar on rows and KPI card

**Files:**
- Modify: `src/components/dashboard/candidates/CandidatesPage.tsx`

**Interfaces:**
- Consumes: `ScoreMeter` from `../../ui/Score` (existing import in this file already brings in `ScoreRing`; add `ScoreMeter` to that import). No changes to `candidate.score` or `stats.avgScore` — both stay 0-100 (`computeOverallScore` output).
- Produces: no new exports.

- [ ] **Step 1: Add `ScoreMeter` to the existing import**

Find the import of `ScoreRing` near the top of the file (reported at line 11: `import { ... } from '../../ui/Score';`) and add `ScoreMeter` to it, e.g. change:

```ts
import { ScoreRing } from '../../ui/Score';
```

to:

```ts
import { ScoreRing, ScoreMeter } from '../../ui/Score';
```

(Match whatever the exact existing import line looks like — just add `ScoreMeter` to the named imports from `'../../ui/Score'`.)

- [ ] **Step 2: Replace the row's "/100" label with a mini meter**

Replace (current lines 312-323):

```jsx
<div className="col-span-4 md:col-span-3 flex items-center gap-3">
  {candidate.score !== undefined ? (
    <>
      <ScoreRing score={candidate.score} size="sm" darkMode={darkMode} />
      <span className={`hidden lg:block text-[0.65rem] uppercase tracking-widest font-semibold ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        / 100
      </span>
    </>
  ) : (
    <span className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>Aguardando entrevista</span>
  )}
</div>
```

with:

```jsx
<div className="col-span-4 md:col-span-3 flex items-center gap-3">
  {candidate.score !== undefined ? (
    <>
      <ScoreRing score={candidate.score} size="sm" darkMode={darkMode} />
      <div className="hidden md:flex flex-col gap-1 w-16">
        <span className={`text-[0.65rem] uppercase tracking-widest font-semibold ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          / 100
        </span>
        <ScoreMeter score={candidate.score} darkMode={darkMode} />
      </div>
    </>
  ) : (
    <span className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>Aguardando entrevista</span>
  )}
</div>
```

- [ ] **Step 3: Add the mini meter to the "Compatibilidade média" KPI card**

Replace (current lines 224-227):

```jsx
{kpiCard('Compatibilidade média', stats.avgScore !== null
  ? <>{stats.avgScore}<span className={`text-lg ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>/100</span></>
  : <span className={darkMode ? 'text-gray-600' : 'text-gray-300'}>—</span>, Gauge,
  darkMode ? 'bg-triagen-secondary-green/20 text-emerald-300' : 'bg-triagen-sage-tint text-triagen-secondary-green')}
```

with:

```jsx
{kpiCard('Compatibilidade média', stats.avgScore !== null
  ? (
    <span className="flex flex-col gap-1.5">
      <span>{stats.avgScore}<span className={`text-lg ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>/100</span></span>
      <ScoreMeter score={stats.avgScore} darkMode={darkMode} className="max-w-24" />
    </span>
  )
  : <span className={darkMode ? 'text-gray-600' : 'text-gray-300'}>—</span>, Gauge,
  darkMode ? 'bg-triagen-secondary-green/20 text-emerald-300' : 'bg-triagen-sage-tint text-triagen-secondary-green')}
```

Note `kpiCard`'s `value: React.ReactNode` parameter already accepts arbitrary JSX (it renders `{value}` inside a `<span>` at line 198), so wrapping in a `<span className="flex flex-col ...">` (block-level flex layout via an inline element) works the same way `<>...</>` did before — no signature change needed.

- [ ] **Step 4: Verify**

Run:
```bash
npx tsc --noEmit -p tsconfig.app.json && npm run lint
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/candidates/CandidatesPage.tsx
git commit -m "feat: add mini score meter to candidate list rows and KPI card"
```

---

### Task 5: Manual browser verification

**Files:** none (verification only).

**Interfaces:**
- Consumes: the running app (`npm run dev`), a candidate with an existing interview report (criteria scores populated).

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Check the candidate list page** (`/dashboard/candidates`)

- Confirm rows with a score show the `ScoreRing` plus a slim mini bar (from `md` breakpoint up) instead of the old `/100` text-only label, in both light and dark mode.
- Confirm the "Compatibilidade média" KPI card shows the average number plus a mini bar beneath it.
- Confirm candidates without a score still show "Aguardando entrevista" with no meter.

- [ ] **Step 3: Check a candidate's report** (open a candidate profile with an evaluation, or the standalone report route)

- Confirm the "Critérios avaliados" section shows a new overview strip above the detailed cards, with one row per criterion: name, small segmented meter, and `score/3`.
- Click a few overview strip items and confirm the page smooth-scrolls to the matching detailed card.
- Confirm each detailed criterion card now shows `{score} / 3` and a segmented (blocked) meter instead of a continuous 0-100 bar, with tier colors (green/amber/red) matching the strip above.
- Confirm the report's overall/hero score (`ScoreRing`, "Compatibilidade") is still shown on a 0-100 scale, unchanged.
- Toggle dark mode and repeat the checks above.

- [ ] **Step 4: Report findings**

If everything matches, this task is done — no code changes expected here. If something looks wrong, note the specific file/line and fix it as a follow-up commit before considering the plan complete.
