import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon?: LucideIcon; // Made optional as icons might not be needed in minimalist design
  darkMode?: boolean;
}

function StatCard({ title, value, darkMode = false }: StatCardProps) {
  return (
    <div className="flex flex-col items-start justify-center py-4">
      <div 
        className={`text-5xl md:text-6xl font-heading font-normal tracking-tight leading-none mb-3 ${
          darkMode ? 'text-gray-100' : 'text-triagen-primary'
        }`}
      >
        {value.length === 1 ? `0${value}` : value}
      </div>
      <p className={`text-xs font-sans tracking-widest uppercase font-semibold ${
        darkMode ? 'text-gray-500' : 'text-triagen-primary'
      }`}>
        {title}
      </p>
    </div>
  );
}

export default StatCard;
