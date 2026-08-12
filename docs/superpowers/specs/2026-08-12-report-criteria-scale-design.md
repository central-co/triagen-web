# Report criteria scale (0-3) + at-a-glance score indicators

## Problem

The interview report shows each evaluation criterion on a 0-100 scale
(`{score} / 100`), even though the underlying model output is 0-3
(`interview_reports.criteria_scores[].score`). The 0-100 display implies
false precision and doesn't match how the score was actually produced.

Separately, reading criteria performance today requires scrolling through
every detailed criterion card one at a time — there's no way to see how a
candidate did across all criteria at a glance, either on the report page or
in the candidate list.

## Goals

- Criteria scores in the report display on their native 0-3 scale.
- The overall/aggregate compatibility score (weighted average) stays 0-100
  everywhere it appears (report hero, candidate list, candidate profile,
  KPI card). Not in scope for this change.
- A compact, scannable visual summary of all criteria scores sits at the
  top of the report's "Critérios avaliados" section, before the detailed
  cards.
- The candidate list gets a lightweight visual complement (mini bar) next
  to each candidate's overall score, without expanding row detail.

## Non-goals

- Changing how `computeOverallScore` is calculated or displayed (stays
  0-100, weighted average).
- Changing the underlying data model or the analyzer's 0-3 scoring.
- Adding a new generic `Badge`/`Progress` primitive outside `ui/Score.tsx`.

## Design

### 1. Data layer — `src/utils/scoring.ts`

`toDisplayCriteriaScores` currently maps raw 0-3 scores through
`normalizeToPercent` before exposing them as `DisplayCriterionScore.score`
(0-100). Change it to expose the raw score directly, clamped to [0, 3] and
rounded to the nearest integer (matching today's rounding behavior, and the
analyzer's output is effectively integer 0-3).

Export a `MAX_CRITERION_SCORE = 3` constant so UI code doesn't hardcode the
literal `3` in multiple places.

`computeOverallScore` is unchanged — it still returns a 0-100 weighted
average via `normalizeToPercent`. Update the doc comment on
`DisplayCriterionScore.score` to say "0-3" instead of "0-100".

### 2. `src/components/ui/Score.tsx`

Generalize the tier/color helpers to take an optional `maxScore` (default
`100`), computing the tier from the percentage (`score / maxScore`) so the
existing ≥75%/≥50% thresholds keep meaning "strong / medium / weak"
consistently across both scales:

```ts
scoreTier(score: number, maxScore = 100): ScoreTier
scoreTextColor(score: number, darkMode: boolean, maxScore = 100): string
scoreStrokeColor(score: number, maxScore = 100): string
scoreBarColor(score: number, maxScore = 100): string
```

All existing call sites (overall score, 0-100) keep working unchanged
since `maxScore` defaults to 100. Criteria call sites pass `maxScore={3}`
(or `MAX_CRITERION_SCORE`) explicitly.

`ScoreRing` and `ScoreMeter` (continuous bar) are unchanged in behavior —
still 0-100, still used for overall scores.

Add a new component, `SegmentedMeter`:

```ts
interface SegmentedMeterProps {
  value: number;
  max: number;
  darkMode?: boolean;
  size?: 'xs' | 'sm';
  className?: string;
}
```

Renders `max` discrete blocks in a row; the first `Math.round(clamped)`
are filled with `scoreBarColor(value, max)`, the rest render as an empty
track (same track color used by `ScoreMeter`). Has `role="img"` and
`aria-label={`${value} de ${max}`}` for accessibility, matching the
pattern in `ScoreRing`. This replaces the continuous `ScoreMeter` for
criterion-level display, since a discrete 0-3 scale reads better as
"2 of 3 filled" than as a 67%-wide bar.

### 3. Report — `src/components/dashboard/reports/InterviewReportView.tsx`

**Per-criterion card** (existing loop, ~line 112-179):
- Score display changes from `{criterion.score} / 100` to
  `{criterion.score} / 3`.
- `<ScoreMeter score={criterion.score} .../>` is replaced with
  `<SegmentedMeter value={criterion.score} max={3} .../>`.
- Each criterion article gets an `id` (slug of `criterion.criterion`) so
  the summary strip (below) can scroll to it.

**New: criteria overview strip.** Inserted directly below the "Critérios
avaliados" section header, above the detailed cards. A bordered container
with a responsive grid (2 columns on mobile, 3-4 on desktop) of compact
items, one per criterion:

- Criterion name (small, uppercase, truncated — same label style used
  elsewhere in the report).
- A small `SegmentedMeter` (`size="xs"`) inline.
- The fraction (`2/3`), color-matched to the tier.

Each item is a `<button>` (or clickable div with `role="button"`,
matching the existing keyboard-accessible pattern used for candidate rows
in `CandidatesPage.tsx`) that smooth-scrolls to the matching detail
card's `id` on click — lets someone scan the whole picture, then jump
straight to the one criterion they want to read about, without scrolling
past the others.

No changes to `reasoning`, `evidence`, or `gaps` rendering — those stay
exactly as they are today, only reachable by scrolling to (or clicking
into) the detail card.

### 4. Candidate list — `src/components/dashboard/candidates/CandidatesPage.tsx`

**Per-row score cell** (~line 312-323): replace the `/ 100` text label
next to `ScoreRing` with a small `ScoreMeter` (existing continuous 0-100
bar, ~56-64px wide), stacked so the row shows the ring (quick glance) plus
a thin fill bar (precise-ish read) without adding a new column. Loosen the
current `hidden lg:block` breakpoint to `md` since the replacement is more
compact than the text label was.

**KPI card "Compatibilidade média"** (~line 224-227): add the same slim
`ScoreMeter` under the number (only rendered when `stats.avgScore !==
null`), for visual consistency with the per-row treatment.

`CandidateProfilePage.tsx` requires no direct changes — it renders
`InterviewReportView`, so it picks up the new criteria overview strip and
0-3 display automatically. Its own `ScoreRing` usage (overall score)
is unaffected.

## Testing

- Manual check in the browser (light + dark mode): report page criteria
  show 0-3 with segmented meters, overview strip renders and scroll-jumps
  correctly, candidate list rows and KPI card show the new mini meter,
  overall/aggregate scores everywhere remain 0-100 and visually unchanged.
- No backend/data changes, so no migration or API contract changes needed.
