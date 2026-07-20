import { CheckCircle, AlertCircle, AlertTriangle, Info, type LucideIcon } from 'lucide-react';

interface StatusMessageProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: React.ReactNode;
  darkMode?: boolean;
  className?: string;
  icon?: LucideIcon;
}

function StatusMessage({
  type,
  title,
  message,
  darkMode = false,
  className = '',
  icon
}: Readonly<StatusMessageProps>) {
  const icons: Record<StatusMessageProps['type'], LucideIcon> = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const Icon = icon || icons[type];

  const typeClasses = {
    success: darkMode
      ? 'bg-triagen-secondary-green/10 border-triagen-secondary-green/30 text-emerald-300'
      : 'bg-triagen-sage-tint/60 border-triagen-secondary-green/30 text-triagen-secondary-green',
    error: darkMode
      ? 'bg-triagen-error/10 border-triagen-error/30 text-red-300'
      : 'bg-red-50 border-red-200 text-red-700',
    warning: darkMode
      ? 'bg-amber-500/10 border-amber-500/25 text-amber-300'
      : 'bg-amber-50 border-amber-200 text-amber-800',
    info: darkMode
      ? 'bg-triagen-primary-blue/15 border-triagen-primary-blue/30 text-blue-200'
      : 'bg-triagen-primary-blue/5 border-triagen-primary-blue/20 text-triagen-primary-blue'
  };

  const role = type === 'error' || type === 'warning' ? 'alert' : 'status';

  return (
    <div role={role} className={`p-4 rounded border ${typeClasses[type]} ${className}`}>
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-semibold mb-1">{title}</h4>
          )}
          <div className="text-sm">{message}</div>
        </div>
      </div>
    </div>
  );
}

export default StatusMessage;
