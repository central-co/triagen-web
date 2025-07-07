import { CheckCircle, AlertCircle, AlertTriangle, Info, DivideIcon as LucideIcon } from 'lucide-react';

interface StatusMessageProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: React.ReactNode;
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
      ? 'bg-triagen-secondary-green/10 border-triagen-secondary-green/20 text-triagen-secondary-green'
      : 'bg-triagen-secondary-green/10 border-triagen-secondary-green/30 text-green-700',
    error: darkMode
      ? 'bg-triagen-error/10 border-triagen-error/20 text-triagen-error'
      : 'bg-triagen-error/10 border-triagen-error/30 text-red-700',
    warning: darkMode
      ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
      : 'bg-orange-50/50 border-orange-200/50 text-orange-600',
    info: darkMode
      ? 'bg-triagen-primary-blue/10 border-triagen-primary-blue/20 text-triagen-primary-blue'
      : 'bg-triagen-primary-blue/10 border-triagen-primary-blue/30 text-blue-700'
  };

  const iconColors = {
    success: 'text-triagen-secondary-green',
    error: 'text-triagen-error',
    warning: 'text-orange-500',
    info: 'text-triagen-primary-blue'
  };

  return (
    <div className={`p-4 rounded-2xl border transition-all duration-300 ${typeClasses[type]} ${className}`}>
      <div className="flex items-start space-x-3">
        <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${iconColors[type]} ${type === 'success' ? 'animate-pulse' : ''}`} />
        <div className="flex-1">
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