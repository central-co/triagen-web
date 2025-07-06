import { DivideIcon as LucideIcon } from 'lucide-react';

export interface FeatureCardProps {
  icon: typeof LucideIcon;
  title: string;
  description: string;
  darkMode?: boolean;
  className?: string;
  iconColor?: string;
  layout?: 'vertical' | 'horizontal';
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  darkMode = false,
  className = '',
  iconColor = 'bg-triagen-dark-bg',
  layout = 'vertical'
}: FeatureCardProps) {
  const baseClasses = 'group transition-all duration-300 hover:scale-101 hover:shadow-lg';
  
  if (layout === 'horizontal') {
    return (
      <div className={`${baseClasses} flex items-start space-x-4 p-6 rounded-2xl backdrop-blur-sm border ${
        darkMode 
          ? 'bg-gray-800/20 border-triagen-border-dark hover:bg-gray-800/40' 
          : 'bg-triagen-light-bg/20 border-triagen-border-light hover:bg-triagen-light-bg/40'
      } ${className}`}>
        <div className={`w-14 h-14 rounded-2xl ${iconColor} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
        <div>
          <h3 className={`font-heading text-lg font-semibold mb-2 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
            {title}
          </h3>
          <p className={`font-sans transition-colors duration-300 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
            {description}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${baseClasses} p-8 rounded-3xl backdrop-blur-xl border ${
      darkMode 
        ? 'bg-gray-800/30 border-triagen-border-dark hover:bg-gray-800/50' 
        : 'bg-triagen-light-bg/30 border-triagen-border-light hover:bg-triagen-light-bg/50'
    } ${className}`}>
      <div className={`w-20 h-20 rounded-3xl ${iconColor} flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300`}>
        <Icon className="h-10 w-10 text-white" />
      </div>
      <h3 className={`font-heading text-xl font-semibold mb-4 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
        {title}
      </h3>
      <p className={`font-sans transition-colors duration-300 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
        {description}
      </p>
    </div>
  );
}

export default FeatureCard;