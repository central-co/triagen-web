interface LoadingSpinnerProps {
  fullScreen?: boolean;
  label?: string;
}

function LoadingSpinner({ fullScreen = false, label }: Readonly<LoadingSpinnerProps>) {
  const spinner = (
    <output className="flex flex-col items-center gap-4" aria-live="polite">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-triagen-secondary/30 border-t-triagen-secondary dark:border-gray-600 dark:border-t-gray-300" />
      <span className="text-xs font-semibold uppercase tracking-widest text-triagen-secondary dark:text-gray-400">
        {label || 'Carregando'}
      </span>
    </output>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-triagen-neutral dark:bg-gray-900">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-64 py-16">
      {spinner}
    </div>
  );
}

export default LoadingSpinner;
