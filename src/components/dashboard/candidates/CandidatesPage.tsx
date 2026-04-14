import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import useDarkMode from '../../../hooks/useDarkMode';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../integrations/supabase/client';
import Button from '../../ui/Button';
import LoadingSpinner from '../../ui/LoadingSpinner';

interface Job {
  id: string;
  title: string;
}

interface CandidateWithJob {
  id: string;
  name: string;
  email: string;
  status: string;
  job: Job;
  score?: number;
  is_favorite: boolean;
}

const DUMMY_SCORE = 86; // Fallback score if none exist

function CandidatesPage() {
  const [candidates, setCandidates] = useState<CandidateWithJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'All Candidates' | 'Shortlisted' | 'Archived'>('All Candidates');

  const { darkMode } = useDarkMode(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (!user?.id) return;

      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id);

      if (!companies || companies.length === 0) {
        setCandidates([]);
        return;
      }

      const company = companies[0];

      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('id, title')
        .eq('company_id', company.id)
        .order('title');

      if (jobsError) throw jobsError;
      if (!jobsData || jobsData.length === 0) {
        setCandidates([]);
        return;
      }

      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select(`
          *,
          job:jobs(*),
          interview_reports(overall_score)
        `)
        .in('job_id', jobsData.map(job => job.id))
        .order('created_at', { ascending: false });

      if (candidatesError) {
        console.error('Supabase fetch error:', candidatesError);
        throw candidatesError;
      }

      if (candidatesData) {
        const transformedCandidates = candidatesData.map(candidate => ({
           id: candidate.id,
           name: candidate.name || 'Unnamed',
           email: candidate.email,
           status: candidate.status || 'pending',
           job: candidate.job as Job,
           is_favorite: candidate.is_favorite || false,
           score: candidate.interview_reports && candidate.interview_reports.length > 0
                  ? candidate.interview_reports[0].overall_score
                  : undefined
        }));
        console.log('Transformed candidates!', transformedCandidates);
        setCandidates(transformedCandidates);
        setError(null);
      }
    } catch (err: any) {
      console.log('Candidates Data Fetch Error:', err);
      setError(err?.message || 'Error fetching candidates');
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
       const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (c.job?.title && c.job.title?.toLowerCase().includes(searchTerm.toLowerCase()));
       if (!matchesSearch) return false;

       if (activeTab === 'Shortlisted') return c.is_favorite;
       if (activeTab === 'Archived') return c.status === 'rejected';
       return true; // 'All Candidates' shows all
    });
  }, [candidates, searchTerm, activeTab]);

  const stats = useMemo(() => {
     const nonRejected = candidates.filter(c => c.status !== 'rejected');
     const scored = candidates.filter(c => c.score !== undefined);
     const avgScore = scored.length > 0 ? scored.reduce((acc, curr) => acc + (curr.score || 0), 0) / scored.length : DUMMY_SCORE;
     const topMatch = scored.length > 0 ? Math.max(...scored.map(c => c.score || 0)) : (candidates.length > 0 ? 94 : 0);

     return {
       total: nonRejected.length,
       interviewed: candidates.filter(c => c.status === 'interviewed' || c.status === 'completed').length,
       avgScore: Math.round(avgScore),
       topMatch: Math.round(topMatch)
     };
  }, [candidates]);

   if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="p-12 text-center text-red-500 font-bold">Error loading candidates: {error}</div>;
  }

  return (
    <div className="flex flex-col gap-10 max-w-6xl mx-auto pb-12">

      {/* Header matching the Lead Designer page */}
      <div className="flex flex-col gap-4 px-2 mb-4 mt-6">
         <div className={`text-[0.65rem] font-semibold tracking-widest uppercase ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>
            DEBUG: candidates={candidates.length}, filtered={filteredCandidates.length}, jobsData(if any), search="{searchTerm}"
         </div>
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <h1 className={`text-4xl md:text-[3.5rem] leading-[1.1] font-heading font-normal tracking-tight ${darkMode ? 'text-gray-100' : 'text-triagen-primary'}`}>
              Candidate Pipeline
            </h1>
            <div className="flex items-center gap-3">
               <Button variant="secondary" size="sm" darkMode={darkMode}>Manage Filters</Button>
               <Button variant="primary-solid" size="sm" darkMode={darkMode}>Generate Shortlist</Button>
            </div>
         </div>
         <p className={`text-lg font-sans font-medium italic mt-2 ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
            Curating the next generation of leadership for global impact.
         </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-2 mb-8">
         <div className={`p-6 rounded border flex flex-col items-start justify-center ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-[#f8f9fa] border-neutral-100'}`}>
            <span className={`text-[0.65rem] tracking-widest uppercase font-semibold mb-2 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>Total Candidates</span>
            <span className={`text-4xl font-heading ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>{stats.total}</span>
         </div>
         <div className={`p-6 rounded border flex flex-col items-start justify-center ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-[#f8f9fa] border-neutral-100'}`}>
            <span className={`text-[0.65rem] tracking-widest uppercase font-semibold mb-2 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>Interviewed</span>
            <span className={`text-4xl font-heading ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>{stats.interviewed}</span>
         </div>
         <div className={`p-6 rounded border flex flex-col items-start justify-center ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-[#f8f9fa] border-neutral-100'}`}>
            <span className={`text-[0.65rem] tracking-widest uppercase font-semibold mb-2 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>Avg AI Score</span>
            <span className={`text-4xl font-heading ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>{stats.avgScore}<span className={`text-xl ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>/100</span></span>
         </div>
         <div className={`p-6 rounded border flex flex-col items-start justify-center ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-[#f8f9fa] border-neutral-100'}`}>
            <span className={`text-[0.65rem] tracking-widest uppercase font-semibold mb-2 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>Top Match Found</span>
            <span className={`text-4xl font-heading ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>{stats.topMatch}%</span>
         </div>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-2 border-b border-neutral-200 pb-6">
         <div className="flex items-center gap-8 w-full md:w-auto overflow-x-auto">
            {['All Candidates', 'Shortlisted', 'Archived'].map(tab => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab as any)}
                 className={`text-sm font-semibold tracking-wide transition-colors whitespace-nowrap ${activeTab === tab ? (darkMode ? 'text-white border-b-2 border-white pb-1 -mb-[3px]' : 'text-triagen-primary border-b-2 border-triagen-primary pb-1 -mb-[3px]') : (darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-triagen-secondary hover:text-triagen-primary')}`}
               >
                 {tab}
               </button>
            ))}
         </div>

         <div className="relative w-full md:w-64">
           <Search strokeWidth={1.5} className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
           <input
             type="text"
             placeholder="Search dossier..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className={`w-full pl-9 pr-4 py-2 text-sm rounded bg-transparent border-0 border-b transition-colors focus:ring-0 focus:outline-none ${darkMode ? 'border-gray-700 text-white placeholder-gray-600 focus:border-gray-500' : 'border-neutral-200 text-triagen-primary placeholder-gray-400 focus:border-triagen-primary'}`}
           />
         </div>
      </div>

      {/* Candidate List/Table */}
      <div className="px-2">
         {/* Table Header */}
         <div className={`grid grid-cols-12 gap-4 pb-4 border-b text-[0.65rem] tracking-widest uppercase font-semibold ${darkMode ? 'border-gray-800 text-gray-500' : 'border-neutral-200 text-triagen-secondary'}`}>
            <div className="col-span-5 md:col-span-5">Candidate Information</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-4 md:col-span-3">AI Intelligence Score</div>
            <div className="col-span-1 hidden md:block text-right">Actions</div>
         </div>

         {/* Items */}
         <div className="flex flex-col mt-4 gap-4">
            {filteredCandidates.length === 0 ? (
               <div className="py-12 text-center text-sm font-semibold text-gray-400">No candidates found in this view.</div>
            ) : (
               filteredCandidates.map(candidate => (
                  <div key={candidate.id} onClick={() => navigate(`/dashboard/candidates/${candidate.id}`)} className={`grid grid-cols-12 gap-4 items-center p-4 rounded border transition-colors cursor-pointer group ${darkMode ? 'bg-gray-800/20 border-gray-800 hover:border-gray-600' : 'bg-white border-transparent hover:border-neutral-200 hover:bg-[#f8f9fa]'}`}>

                     <div className="col-span-5 md:col-span-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded bg-neutral-200 overflow-hidden shrink-0">
                           <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${candidate.name}`} alt={candidate.name} className="w-full h-full object-cover grayscale" />
                        </div>
                        <div className="flex flex-col">
                           <span className={`font-heading text-lg font-normal mb-0.5 leading-tight ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>{candidate.name}</span>
                           <span className={`text-[0.65rem] uppercase tracking-wider font-semibold truncate ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
                             {candidate.job?.title || 'Direct Application'}
                           </span>
                        </div>
                     </div>

                     <div className="col-span-3 flex items-center">
                        <span className={`px-3 py-1 rounded-full text-[0.6rem] font-bold tracking-widest uppercase ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-[#e2e8e4] text-[#4d6b63]'}`}>
                           {candidate.status}
                        </span>
                     </div>

                     <div className="col-span-4 md:col-span-3 flex items-center gap-4">
                        <span className={`font-heading text-xl md:text-2xl ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>{candidate.score || '--'}</span>
                        {candidate.score && (
                           <div className={`hidden md:flex flex-1 items-center gap-1`}>
                              <div className={`flex-1 h-[2px] rounded-full ${darkMode ? 'bg-gray-700' : 'bg-neutral-200'}`}>
                                 <div className={`h-full rounded-full transition-all duration-500 ${darkMode ? 'bg-white' : 'bg-triagen-primary'}`} style={{ width: `${candidate.score}%` }} />
                              </div>
                           </div>
                        )}
                     </div>

                     <div className="col-span-1 hidden md:flex items-center justify-end text-[0.65rem] font-semibold uppercase tracking-widest text-triagen-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        View
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>

    </div>
  );
}

export default CandidatesPage;
