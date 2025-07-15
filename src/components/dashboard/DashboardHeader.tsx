import React from 'react';

interface DashboardHeaderProps {
  title: string;
  description: string;
  darkMode: boolean;
  rightContent?: React.ReactNode;
  statusContent?: React.ReactNode;
}

function DashboardHeader({ title, description, darkMode, rightContent, statusContent }: DashboardHeaderProps) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <div className="flex items-center space-x-4 mb-2">
          <h1 className={`font-heading text-3xl font-bold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
            {title}
          </h1>
          {statusContent && (
            <div>
              {statusContent}
            </div>
          )}
        </div>
        <p className={`font-sans ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
          {description}
        </p>
      </div>
      {rightContent && (
        <div className="flex-shrink-0">
          {rightContent}
        </div>
      )}
    </div>
  );
}

export default DashboardHeader;
