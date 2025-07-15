import React from 'react';

interface DashboardHeaderProps {
  title: string;
  description: string;
  darkMode: boolean;
  rightContent?: React.ReactNode;
}

function DashboardHeader({ title, description, darkMode, rightContent }: DashboardHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className={`font-heading text-3xl font-bold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
          {title}
        </h1>
        <p className={`font-sans mt-2 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
          {description}
        </p>
      </div>
      {rightContent && (
        <div>
          {rightContent}
        </div>
      )}
    </div>
  );
}

export default DashboardHeader;
