import React, { useId } from 'react';

/**
 * Shared form controls with the editorial input style used across the app:
 * quiet borders, flat corners, and a clear focus state in both themes.
 */

const controlClasses = (darkMode: boolean, extra = '') =>
  `font-sans w-full px-4 py-2.5 rounded border text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-triagen-secondary/30 focus:border-triagen-secondary disabled:opacity-60 disabled:cursor-not-allowed ${
    darkMode
      ? 'bg-gray-800/60 border-gray-700 text-white placeholder-gray-500'
      : 'bg-white border-triagen-border-light text-triagen-primary placeholder-gray-400'
  } ${extra}`;

const labelClasses = (darkMode: boolean) =>
  `block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-triagen-primary'}`;

const hintClasses = (darkMode: boolean) =>
  `text-xs mt-1.5 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`;

interface BaseFieldProps {
  label?: React.ReactNode;
  hint?: string;
  darkMode?: boolean;
}

type InputProps = BaseFieldProps & React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ label, hint, darkMode = false, id, className = '', ...rest }: Readonly<InputProps>) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <div>
      {label && <label htmlFor={inputId} className={labelClasses(darkMode)}>{label}</label>}
      <input id={inputId} className={controlClasses(darkMode, className)} {...rest} />
      {hint && <p className={hintClasses(darkMode)}>{hint}</p>}
    </div>
  );
}

type TextareaProps = BaseFieldProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ label, hint, darkMode = false, id, className = '', ...rest }: Readonly<TextareaProps>) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <div>
      {label && <label htmlFor={inputId} className={labelClasses(darkMode)}>{label}</label>}
      <textarea id={inputId} className={controlClasses(darkMode, `resize-none ${className}`)} {...rest} />
      {hint && <p className={hintClasses(darkMode)}>{hint}</p>}
    </div>
  );
}

type SelectProps = BaseFieldProps & React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ label, hint, darkMode = false, id, className = '', children, ...rest }: Readonly<SelectProps>) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <div>
      {label && <label htmlFor={inputId} className={labelClasses(darkMode)}>{label}</label>}
      <select id={inputId} className={controlClasses(darkMode, className)} {...rest}>
        {children}
      </select>
      {hint && <p className={hintClasses(darkMode)}>{hint}</p>}
    </div>
  );
}
