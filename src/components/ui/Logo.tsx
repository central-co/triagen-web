interface LogoProps {
  darkMode: boolean;
  onClick?: () => void;
  className?: string;
}

/** Text wordmark used across the whole product: serif, with a green full stop. */
function Logo({ darkMode, onClick, className = '' }: Readonly<LogoProps>) {
  const content = (
    <span
      className={`font-heading text-xl font-semibold tracking-tight whitespace-nowrap ${
        darkMode ? 'text-white' : 'text-triagen-primary'
      }`}
    >
      TriaGen<span className="text-triagen-secondary-green">.</span>
    </span>
  );

  return onClick ? (
    <button onClick={onClick} className={`inline-flex items-center ${className}`}>
      {content}
    </button>
  ) : (
    <div className={`inline-flex items-center ${className}`}>{content}</div>
  );
}

export default Logo;
