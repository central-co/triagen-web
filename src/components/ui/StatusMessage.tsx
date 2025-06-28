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
      ? 'bg-triagen-mint/10 border-triagen-mint/20 text-triagen-mint'
      : 'bg-triagen-mint/10 border-triagen-mint/30 text-green-700',
    error: darkMode
      ? 'bg-triagen-salmon/10 border-triagen-salmon/20 text-triagen-salmon'
      : 'bg-triagen-salmon/10 border-triagen-salmon/30 text-red-700',
    warning: darkMode
      ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
      : 'bg-orange-50/50 border-orange-200/50 text-orange-600',
    info: darkMode
      ? 'bg-triagen-blue/10 border-triagen-blue/20 text-triagen-blue'
      : 'bg-triagen-blue/10 border-triagen-blue/30 text-blue-700'
  };

  const iconColors = {
    success: 'text-triagen-mint',
    error: 'text-triagen-salmon',
    warning: 'text-orange-500',
    info: 'text-triagen-blue'
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