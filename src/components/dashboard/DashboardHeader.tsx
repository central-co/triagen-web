interface DashboardHeaderProps {
  title: React.ReactNode;
  description?: string;
  darkMode?: boolean;
  /** Small badge/status rendered above the title (e.g. job status). */
  statusContent?: React.ReactNode;
  /** Actions rendered to the right of the title on desktop. */
  rightContent?: React.ReactNode;
}

/** Standard dashboard page header: serif display title, muted description, optional actions. */
function DashboardHeader({ title, description, darkMode = false, statusContent, rightContent }: Readonly<DashboardHeaderProps>) {
  return (
    <div className="mb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="min-w-0">
          {statusContent && (
            <div className="flex items-center gap-3 mb-4">
              {statusContent}
            </div>
          )}
          <h1 className={`text-4xl md:text-5xl leading-[1.1] font-heading font-normal tracking-tight ${
            darkMode ? 'text-gray-100' : 'text-triagen-primary'
          }`}>
            {title}
          </h1>
          {description && (
            <p className={`text-lg font-sans mt-4 max-w-2xl ${
              darkMode ? 'text-gray-400' : 'text-triagen-secondary'
            }`}>
              {description}
            </p>
          )}
        </div>
        {rightContent && (
          <div className="flex items-center gap-3 shrink-0">
            {rightContent}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardHeader;
