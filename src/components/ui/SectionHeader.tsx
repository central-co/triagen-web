import { DivideIcon as LucideIcon } from 'lucide-react';

export interface SectionHeaderProps {
  icon?: typeof LucideIcon;
  label?: string;
  title: string;
  description?: string;
  darkMode?: boolean;
  className?: string;
  alignment?: 'left' | 'center';
}

function SectionHeader({
  icon: Icon,
  label,
  title,
  description,
  darkMode = false,
  className = '',
  alignment = 'center'
}: SectionHeaderProps) {
  const alignmentClasses = alignment === 'center' ? 'text-center' : 'text-left';
  const containerClasses = alignment === 'center' ? 'text-center mb-20' : 'mb-12';

  return (
    <div className={`${containerClasses} ${className}`}>
      {label && Icon && (
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border ${
          darkMode 
            ? 'bg-gray-800/30 border-gray-700/50 text-gray-300' 
            : 'bg-white/30 border-triagen-petrol/20 text-triagen-petrol'
        }`}>
          <Icon className="h-4 w-4 mr-2 text-triagen-salmon" />
          {label}
        </div>
      )}
      
      <h2 className={`font-heading text-4xl md:text-5xl font-bold mb-6 transition-colors duration-300 ${
        darkMode ? 'text-white' : 'text-triagen-petrol'
      } ${alignmentClasses}`}>
        {title}
      </h2>
      
      {description && (
        <p className={`font-sans text-xl transition-colors duration-300 ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        } ${alignmentClasses}`}>
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeader;