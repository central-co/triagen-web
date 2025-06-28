import { CheckCircle, AlertCircle, AlertTriangle, Info, DivideIcon as LucideIcon } from 'lucide-react';

export interface StatusMessageProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  darkMode?: boolean;
  className?: string;
  icon?: typeof LucideIcon;
}

function StatusMessage({
  type,
  title,
  message,
  darkMode = false,
  className = '',
  icon
}: StatusMessageProps) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const Icon = icon || icons[type];

  const typeClasses = {
    success: darkMode
      ? 'bg-triagen-secondary-accent/10 border-triagen-secondary-accent/20 text-triagen-secondary-accent'
      : 'bg-triagen-secondary-accent/10 border-triagen-secondary-accent/30 text-green-700',
    error: darkMode
      ? 'bg-triagen-highlight-warm/10 border-triagen-highlight-warm/20 text-triagen-highlight-warm'
      : 'bg-triagen-highlight-warm/10 border-triagen-highlight-warm/30 text-red-700',
    warning: darkMode
      ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
      : 'bg-orange-50/50 border-orange-200/50 text-orange-600',
    info: darkMode
      ? 'bg-triagen-primary-accent/10 border-triagen-primary-accent/20 text-triagen-primary-accent'
      : 'bg-triagen-primary-accent/10 border-triagen-primary-accent/30 text-blue-700'
  };

  const iconColors = {
    success: 'text-triagen-secondary-accent',
    error: 'text-triagen-highlight-warm',
    warning: 'text-orange-500',
    info: 'text-triagen-primary-accent'
  };

  return (
    <div className={`p-4 rounded-2xl border transition-all duration-300 ${typeClasses[type]} ${className}`}>
      <div className="flex items-start space-x-3">
        <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${iconColors[type]} ${type === 'success' ? 'animate-pulse' : ''}`} />
        <div>
          {title && (
            <h4 className="font-semibold mb-1">{title}</h4>
          )}
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default StatusMessage;