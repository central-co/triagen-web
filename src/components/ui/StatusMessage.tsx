
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
      ? 'bg-green-500/10 border-green-500/20 text-green-400'
      : 'bg-green-50/50 border-green-200/50 text-green-600',
    error: darkMode
      ? 'bg-red-500/10 border-red-500/20 text-red-400'
      : 'bg-red-50/50 border-red-200/50 text-red-600',
    warning: darkMode
      ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
      : 'bg-orange-50/50 border-orange-200/50 text-orange-600',
    info: darkMode
      ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
      : 'bg-blue-50/50 border-blue-200/50 text-blue-600'
  };

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-orange-500',
    info: 'text-blue-500'
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
