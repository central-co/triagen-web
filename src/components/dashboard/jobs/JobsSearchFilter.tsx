
import { Search } from 'lucide-react';
import Card from '../../ui/Card';

interface JobsSearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  darkMode: boolean;
}

function JobsSearchFilter({ searchTerm, onSearchChange, darkMode }: JobsSearchFilterProps) {
  return (
    <Card darkMode={darkMode}>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
              darkMode ? 'text-gray-400' : 'text-triagen-text-light'
            }`} />
            <input
              type="text"
              placeholder="Buscar vagas..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`font-sans w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-triagen-secondary-green/50 focus:border-triagen-secondary-green ${
                darkMode
                  ? 'bg-gray-800/50 border-triagen-border-dark text-white placeholder-gray-400'
                  : 'bg-white/70 border-triagen-border-light text-triagen-dark-bg placeholder-triagen-text-light'
              }`}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default JobsSearchFilter;
