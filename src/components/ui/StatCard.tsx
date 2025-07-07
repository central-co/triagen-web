
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  darkMode?: boolean;
  iconColor?: string;
}

function StatCard({ title, value, icon: Icon, darkMode = false, iconColor }: StatCardProps) {
  return (
    <div className={`p-6 rounded-3xl border transition-all duration-500 ${
      darkMode 
        ? 'bg-gray-800/40 border-gray-700/50' 
        : 'bg-white/50 border-triagen-petrol/10'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${
          iconColor || (darkMode ? 'bg-triagen-primary-blue/20' : 'bg-triagen-primary-blue/10')
        }`}>
          <Icon className="h-6 w-6 text-triagen-primary-blue" />
        </div>
      </div>
      <div>
        <h3 className={`text-2xl font-bold mb-1 ${
          darkMode ? 'text-white' : 'text-triagen-dark-bg'
        }`}>
          {value}
        </h3>
        <p className={`text-sm ${
          darkMode ? 'text-gray-400' : 'text-triagen-text-light'
        }`}>
          {title}
        </p>
      </div>
    </div>
  );
}

export default StatCard;
