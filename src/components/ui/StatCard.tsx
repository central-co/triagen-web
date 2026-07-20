interface StatCardProps {
  title: string;
  value: string;
  darkMode?: boolean;
  /** Tailwind bg-* class for the short accent rule under the number. */
  accentClass?: string;
}

function StatCard({ title, value, darkMode = false, accentClass = 'bg-triagen-secondary-green' }: Readonly<StatCardProps>) {
  return (
    <div className="flex flex-col items-start justify-center py-4">
      <div
        className={`text-5xl md:text-6xl font-heading font-normal tracking-tight leading-none ${
          darkMode ? 'text-gray-100' : 'text-triagen-primary'
        }`}
      >
        {value.length === 1 ? `0${value}` : value}
      </div>
      <span aria-hidden="true" className={`block w-8 h-[3px] rounded-full my-3 ${accentClass}`} />
      <p className={`text-xs font-sans tracking-widest uppercase font-semibold ${
        darkMode ? 'text-gray-500' : 'text-triagen-secondary'
      }`}>
        {title}
      </p>
    </div>
  );
}

export default StatCard;
