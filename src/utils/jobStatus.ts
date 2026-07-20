/**
 * Derived, display-level job status. The database only stores
 * open / paused / closed — "expired" is computed from the deadline so
 * postings stop presenting themselves as active after the deadline passes.
 */

export type JobDisplayStatus = 'active' | 'paused' | 'closed' | 'expired';

interface JobStatusFields {
  status: 'open' | 'closed' | 'paused';
  deadline?: string | null;
}

export function isJobExpired(job: JobStatusFields, now: Date = new Date()): boolean {
  if (job.status !== 'open' || !job.deadline) return false;
  // Deadline is a date — the posting stays open through the end of that day
  const deadline = new Date(job.deadline);
  deadline.setHours(23, 59, 59, 999);
  return deadline.getTime() < now.getTime();
}

export function getJobDisplayStatus(job: JobStatusFields, now: Date = new Date()): JobDisplayStatus {
  if (job.status === 'closed') return 'closed';
  if (job.status === 'paused') return 'paused';
  return isJobExpired(job, now) ? 'expired' : 'active';
}

/** A job accepts new applications only while open and within the deadline. */
export function isJobAcceptingApplications(job: JobStatusFields, now: Date = new Date()): boolean {
  return getJobDisplayStatus(job, now) === 'active';
}

export function getJobStatusLabel(status: JobDisplayStatus): string {
  switch (status) {
    case 'active': return 'Ativa';
    case 'paused': return 'Pausada';
    case 'closed': return 'Encerrada';
    case 'expired': return 'Prazo encerrado';
  }
}

/** Badge classes for both themes (dark handled via `dark:` variants). */
export function getJobStatusColor(status: JobDisplayStatus): string {
  switch (status) {
    case 'active':
      return 'bg-triagen-sage-tint text-triagen-secondary-green dark:bg-triagen-secondary-green/20 dark:text-emerald-300';
    case 'paused':
      return 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300';
    case 'closed':
      return 'bg-neutral-200 text-neutral-600 dark:bg-gray-700 dark:text-gray-300';
    case 'expired':
      return 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-300';
  }
}
