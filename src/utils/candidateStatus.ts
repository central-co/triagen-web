import { CheckCircle, Clock, Eye, XCircle, Award, type LucideIcon } from 'lucide-react';

export type CandidateStatus = 'pending' | 'interviewed' | 'completed' | 'rejected' | 'hired';

/** Badge classes for both themes (dark handled via `dark:` variants). */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-triagen-sage-tint text-triagen-secondary-green dark:bg-triagen-secondary-green/20 dark:text-emerald-300';
    case 'interviewed':
      return 'bg-triagen-primary-blue/10 text-triagen-primary-blue dark:bg-triagen-primary-blue/25 dark:text-blue-200';
    case 'pending':
      return 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300';
    case 'rejected':
      return 'bg-neutral-200 text-neutral-600 dark:bg-gray-700 dark:text-gray-300';
    case 'hired':
      return 'bg-triagen-primary/10 text-triagen-primary dark:bg-gray-200/10 dark:text-gray-100';
    default:
      return 'bg-gray-500/10 text-gray-600 dark:bg-gray-600/30 dark:text-gray-300';
  }
}

export function getStatusText(status: string): string {
  switch (status) {
    case 'completed': return 'Entrevista concluída';
    case 'interviewed': return 'Entrevistado';
    case 'pending': return 'Aguardando entrevista';
    case 'rejected': return 'Arquivado';
    case 'hired': return 'Contratado';
    default: return status;
  }
}

/** Short label for tight spaces (tables, chips). */
export function getStatusShortText(status: string): string {
  switch (status) {
    case 'completed': return 'Concluída';
    case 'interviewed': return 'Entrevistado';
    case 'pending': return 'Pendente';
    case 'rejected': return 'Arquivado';
    case 'hired': return 'Contratado';
    default: return status;
  }
}

export function getStatusIcon(status: string): LucideIcon {
  switch (status) {
    case 'completed': return CheckCircle;
    case 'interviewed': return Eye;
    case 'pending': return Clock;
    case 'rejected': return XCircle;
    case 'hired': return Award;
    default: return Clock;
  }
}
