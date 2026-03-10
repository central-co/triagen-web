interface LoadingSpinnerProps {
  fullScreen?: boolean;
}

function LoadingSpinner({ fullScreen = false }: LoadingSpinnerProps) {
  const spinner = (
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-triagen-primary-blue" />
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-64">
      {spinner}
    </div>
  );
}

export default LoadingSpinner;
