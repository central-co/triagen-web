import { DivideIcon as LucideIcon } from 'lucide-react';

export interface StatCardProps {
  icon: typeof LucideIcon;
  value: string;
  label: string;
  darkMode?: boolean;
  className?: string;
  iconColor?: string;
}

function StatCard({
  icon: Icon,
  value,
  label,
  darkMode = false,
  className = '',
  iconColor = 'from-triagen-dark-bg to-triagen-primary-accent'
}: StatCardProps) {
  return (
    <div className={`group relative p-8 rounded-3xl backdrop-blur-xl border transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
      darkMode 
        ? 'bg-gray-800/30 border-triagen-border-dark hover:bg-gray-800/50' 
        : 'bg-triagen-light-bg/30 border-triagen-border-light hover:bg-triagen-light-bg/50'
    } ${className}`}>
      <div className="text-center">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${iconColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
        <div className={`font-heading text-4xl font-bold mb-2 bg-gradient-to-r ${iconColor} bg-clip-text text-transparent`}>
          {value}
        </div>
        <div className={`font-sans transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
          {label}
        </div>
      </div>
    </div>
  );
}

export default StatCard;