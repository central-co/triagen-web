import { CheckCircle, Clock, Eye, XCircle, type LucideIcon } from 'lucide-react';

export type CandidateStatus = 'pending' | 'interviewed' | 'completed' | 'rejected' | 'hired';

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed': return 'bg-triagen-secondary-green/20 text-triagen-secondary-green';
    case 'interviewed': return 'bg-triagen-primary-blue/20 text-triagen-primary-blue';
    case 'pending': return 'bg-orange-500/20 text-orange-500';
    case 'rejected': return 'bg-red-500/20 text-red-500';
    case 'hired': return 'bg-purple-500/20 text-purple-500';
    default: return 'bg-gray-500/20 text-gray-500';
  }
}

export function getStatusText(status: string): string {
  switch (status) {
    case 'completed': return 'Concluído';
    case 'interviewed': return 'Entrevistado';
    case 'pending': return 'Pendente';
    case 'rejected': return 'Rejeitado';
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
    case 'hired': return CheckCircle;
    default: return Clock;
  }
}
