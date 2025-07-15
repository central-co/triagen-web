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
    <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
      <div className="flex-1">
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 mb-2">
          <h1 className={`font-heading text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
            {title}
          </h1>
          {statusContent && (
            <div className="flex-shrink-0">
              {statusContent}
            </div>
          )}
        </div>
        <p className={`font-sans text-sm sm:text-base ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
          {description}
        </p>
      </div>
      {rightContent && (
        <div className="flex-shrink-0 w-full sm:w-auto">
          {rightContent}
        </div>
      )}
    </div>
  );
}

export default DashboardHeader;
