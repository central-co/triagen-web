import { Toaster as SonnerToaster, toast } from 'sonner';
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import useDarkMode from '../../hooks/useDarkMode';

/**
 * App-wide toast surface, mounted once.
 *
 * Convention used across the product:
 * - Toast  → confirmation of a completed action (saved, copied, updated).
 * - Inline `StatusMessage` → validation or errors the user must fix in place,
 *   which need to stay on screen next to the field that caused them.
 *
 * Icons mirror StatusMessage so both surfaces read as one system.
 */
export function AppToaster() {
  const { darkMode } = useDarkMode();

  return (
    <SonnerToaster
      theme={darkMode ? 'dark' : 'light'}
      position="bottom-right"
      closeButton
      icons={{
        success: <CheckCircle className="h-[1.1rem] w-[1.1rem] text-triagen-secondary-green dark:text-emerald-400" />,
        error: <AlertCircle className="h-[1.1rem] w-[1.1rem] text-red-600 dark:text-red-400" />,
        warning: <AlertTriangle className="h-[1.1rem] w-[1.1rem] text-triagen-amber dark:text-amber-400" />,
        info: <Info className="h-[1.1rem] w-[1.1rem] text-triagen-primary-blue dark:text-blue-300" />,
      }}
      toastOptions={{
        classNames: {
          toast: '!font-sans !rounded !border !shadow-[0_10px_32px_-12px_rgba(44,62,80,0.28)] !bg-white !border-triagen-border-light dark:!bg-gray-800 dark:!border-gray-700',
          title: '!text-sm !font-semibold !text-triagen-primary dark:!text-gray-100',
          description: '!text-sm !text-triagen-secondary dark:!text-gray-400',
          actionButton: '!rounded !bg-triagen-primary !text-white dark:!bg-gray-100 dark:!text-gray-900',
          cancelButton: '!rounded !bg-transparent !text-triagen-secondary dark:!text-gray-400',
        },
      }}
    />
  );
}

export { toast };
