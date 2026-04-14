import React from 'react';

interface DashboardHeaderProps {
  title: string;
  description?: string;
  darkMode?: boolean;
}

function DashboardHeader({ title, description, darkMode = false }: DashboardHeaderProps) {
  // If the title is generic "Dashboard", we show the welcome message.
  const isDashboard = title.toLowerCase() === 'dashboard';
  
  return (
    <div className="mb-12 mt-4 px-2">
      {isDashboard ? (
        <h1 className={`text-4xl md:text-[3.5rem] leading-[1.1] font-heading font-normal tracking-tight mb-4 ${
          darkMode ? 'text-gray-100' : 'text-triagen-primary'
        }`}>
          Welcome to <span className="italic text-triagen-secondary">TriaGen.</span><br/>
          Your hiring <span className="text-gray-400">ecosystem.</span>
        </h1>
      ) : (
        <h1 className={`text-3xl md:text-4xl font-heading font-normal tracking-tight mb-2 ${
          darkMode ? 'text-gray-100' : 'text-triagen-primary'
        }`}>
          {title}
        </h1>
      )}
      
      {description && (
        <p className={`text-lg font-sans font-medium mt-4 ${
          darkMode ? 'text-gray-400' : 'text-triagen-secondary'
        }`}>
          {description}
        </p>
      )}
    </div>
  );
}

export default DashboardHeader;
