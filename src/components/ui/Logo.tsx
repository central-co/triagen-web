
import { Bot, Sparkles } from 'lucide-react';

interface LogoProps {
  darkMode: boolean;
  onClick?: () => void;
  className?: string;
}

function Logo({ darkMode, onClick, className = '' }: LogoProps) {
  const content = (
    <>
      <div className="relative flex-shrink-0">
        <Bot className={`h-8 w-8 transition-all duration-300 group-hover:scale-110 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
        <div className={`absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${darkMode ? 'bg-blue-400/20' : 'bg-blue-600/20'} blur-sm`}></div>
      </div>
      <span className={`text-2xl font-bold transition-colors duration-300 whitespace-nowrap ${darkMode ? 'text-white' : 'text-gray-900'}`}>TriaGen</span>
      <Sparkles className={`h-5 w-5 flex-shrink-0 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'} animate-pulse`} />
    </>
  );

  const classes = `flex items-center space-x-3 group ${className}`;

  return onClick ? (
    <button onClick={onClick} className={`${classes} transition-all duration-300 hover:scale-105`}>
      {content}
    </button>
  ) : (
    <div className={classes}>{content}</div>
  );
}

export default Logo;
