import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Star, Users, CheckCircle, Gauge, type LucideIcon } from 'lucide-react';
import useDarkMode from '../../../hooks/useDarkMode';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../integrations/supabase/client';
import LoadingSpinner from '../../ui/LoadingSpinner';
import StatusMessage from '../../ui/StatusMessage';
import Avatar from '../../ui/Avatar';
import { ScoreRing } from '../../ui/Score';
import { computeOverallScore } from '../../../utils/scoring';
import { getStatusColor, getStatusShortText } from '../../../utils/candidateStatus';

interface Job {
  id: string;
  title: string;
  criteria?: unknown;
}

interface CandidateWithJob {
  id: string;
  name: string;
  email: string;
  status: string;
  job: Job | null;
  score?: number;
  is_favorite: boolean;
}

type TabKey = 'all' | 'shortlisted' | 'archived';

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'all', label: 'Todos' },
  { key: 'shortlisted', label: 'Pré-selecionados' },
  { key: 'archived', label: 'Arquivados' },
];

function CandidatesPage() {
  const [candidates, setCandidates] = useState<CandidateWithJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [searchParams] = useSearchParams();
  const jobFilter = searchParams.get('job');

  const { darkMode } = useDarkMode();
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const fetchData = async () => {
      try {
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('id')
          .eq('user_id', userId);

        if (companiesError) throw companiesError;
        if (!companies || companies.length === 0) {
          if (!cancelled) setCandidates([]);
          return;
        }

        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('id, title')
          .eq('company_id', companies[0].id);

        if (jobsError) throw jobsError;
        if (!jobsData || jobsData.length === 0) {
          if (!cancelled) setCandidates([]);
          return;
        }

        const { data: candidatesData, error: candidatesError } = await supabase
          .from('candidates')
          .select(`
            *,
            job:jobs(id, title, criteria),
            interview_reports(criteria_scores)
          `)
          .in('job_id', jobsData.map(job => job.id))
          .order('created_at', { ascending: false });

        if (candidatesError) throw candidatesError;

        const transformed = (candidatesData || []).map(candidate => {
          const job = candidate.job as Job | null;
          const reports = candidate.interview_reports as Array<{ criteria_scores: unknown }> | null;
          return {
            id: candidate.id,
            name: candidate.name || 'Sem nome',
            email: candidate.email,
            status: candidate.status || 'pending',
            job,
            is_favorite: candidate.is_favorite || false,
            score: reports && reports.length > 0
              ? computeOverallScore(reports[0].criteria_scores, job?.criteria)
              : undefined,
          };
        });

        if (!cancelled) {
          setCandidates(transformed);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching candidates:', err);
        if (!cancelled) setError('Erro ao carregar candidatos. Tente novamente.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [userId]);

  const toggleShortlist = async (candidate: CandidateWithJob, event: React.MouseEvent) => {
    event.stopPropagation();
    const nextValue = !candidate.is_favorite;

    // Optimistic update
    setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, is_favorite: nextValue } : c));

    const { error: updateError } = await supabase
      .from('candidates')
      .update({ is_favorite: nextValue })
      .eq('id', candidate.id);

    if (updateError) {
      console.error('Error updating shortlist:', updateError);
      setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, is_favorite: !nextValue } : c));
    }
  };

  const filteredCandidates = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return candidates.filter(c => {
      if (jobFilter && c.job?.id !== jobFilter) return false;

      const matchesSearch = !term ||
        c.name.toLowerCase().includes(term) ||
        (c.job?.title || '').toLowerCase().includes(term);
      if (!matchesSearch) return false;

      if (activeTab === 'shortlisted') return c.is_favorite;
      if (activeTab === 'archived') return c.status === 'rejected';
      return c.status !== 'rejected';
    });
  }, [candidates, searchTerm, activeTab, jobFilter]);

  const stats = useMemo(() => {
    const active = candidates.filter(c => c.status !== 'rejected');
    const scored = candidates.filter(c => c.score !== undefined);
    const avgScore = scored.length > 0
      ? Math.round(scored.reduce((acc, curr) => acc + (curr.score || 0), 0) / scored.length)
      : null;

    return {
      total: active.length,
      interviewed: candidates.filter(c => c.status === 'interviewed' || c.status === 'completed').length,
      shortlisted: candidates.filter(c => c.is_favorite).length,
      avgScore,
    };
  }, [candidates]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-12">
        <StatusMessage type="error" title="Erro ao carregar candidatos" message={error} darkMode={darkMode} />
      </div>
    );
  }

  const kpiCard = (label: string, value: React.ReactNode, Icon: LucideIcon, chipClass: string) => (
    <div className={`p-5 md:p-6 rounded-lg border flex items-center gap-4 ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-triagen-border-light'}`}>
      <div className={`hidden sm:flex w-10 h-10 rounded-lg items-center justify-center shrink-0 ${chipClass}`}>
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <span className={`block text-[0.65rem] tracking-widest uppercase font-semibold mb-1 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>{label}</span>
        <span className={`text-3xl md:text-4xl font-heading leading-none ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>{value}</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-10 max-w-6xl mx-auto pb-12">

      {/* Header */}
      <div className="flex flex-col gap-4 mt-4">
        <h1 className={`text-4xl md:text-[3.5rem] leading-[1.1] font-heading font-normal tracking-tight ${darkMode ? 'text-gray-100' : 'text-triagen-primary'}`}>
          Funil de <span className="italic text-triagen-secondary">Candidatos</span>
        </h1>
        <p className={`text-lg font-sans max-w-xl ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
          Acompanhe cada candidatura, compare avaliações e monte sua pré-seleção.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {kpiCard('Candidatos ativos', stats.total, Users,
          darkMode ? 'bg-gray-700 text-gray-300' : 'bg-triagen-primary/10 text-triagen-primary')}
        {kpiCard('Entrevistados', stats.interviewed, CheckCircle,
          darkMode ? 'bg-triagen-primary-blue/25 text-blue-300' : 'bg-triagen-primary-blue/10 text-triagen-primary-blue')}
        {kpiCard('Pré-selecionados', stats.shortlisted, Star,
          darkMode ? 'bg-amber-500/20 text-amber-300' : 'bg-triagen-amber-tint text-triagen-amber')}
        {kpiCard('Compatibilidade média', stats.avgScore !== null
          ? <>{stats.avgScore}<span className={`text-lg ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>/100</span></>
          : <span className={darkMode ? 'text-gray-600' : 'text-gray-300'}>—</span>, Gauge,
          darkMode ? 'bg-triagen-secondary-green/20 text-emerald-300' : 'bg-triagen-sage-tint text-triagen-secondary-green')}
      </div>

      {/* Tabs and Search */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-0 ${darkMode ? 'border-gray-800' : 'border-triagen-border-light'}`}>
        <div className="flex flex-wrap items-center gap-8" role="tablist" aria-label="Filtrar candidatos">
          {TABS.map(tab => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`text-sm font-semibold tracking-wide transition-colors whitespace-nowrap border-b-2 pb-3 -mb-px ${
                activeTab === tab.key
                  ? (darkMode ? 'text-white border-white' : 'text-triagen-primary border-triagen-primary')
                  : (darkMode ? 'text-gray-500 border-transparent hover:text-gray-300' : 'text-triagen-secondary border-transparent hover:text-triagen-primary')
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64 pb-3">
          <Search strokeWidth={1.5} aria-hidden="true" className={`absolute left-3 top-[calc(50%-0.375rem)] -translate-y-1/2 h-4 w-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
            type="search"
            placeholder="Buscar por nome ou vaga..."
            aria-label="Buscar candidatos"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 text-sm rounded bg-transparent border-0 border-b transition-colors focus:ring-0 focus:outline-none ${darkMode ? 'border-gray-700 text-white placeholder-gray-600 focus:border-gray-500' : 'border-triagen-border-light text-triagen-primary placeholder-gray-400 focus:border-triagen-primary'}`}
          />
        </div>
      </div>

      {/* Candidate List */}
      <div>
        {/* Table Header */}
        <div className={`grid grid-cols-12 gap-4 pb-4 border-b text-[0.65rem] tracking-widest uppercase font-semibold ${darkMode ? 'border-gray-800 text-gray-500' : 'border-triagen-border-light text-triagen-secondary'}`}>
          <div className="col-span-6 md:col-span-5">Candidato</div>
          <div className="col-span-3 hidden md:block">Status</div>
          <div className="col-span-4 md:col-span-3">Compatibilidade</div>
          <div className="col-span-2 md:col-span-1 text-right">Favorito</div>
        </div>

        {/* Items */}
        <div className="flex flex-col mt-4 gap-3">
          {filteredCandidates.length === 0 ? (
            <div className={`py-14 text-center text-sm ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>
              {candidates.length === 0
                ? 'Nenhum candidato ainda. Compartilhe o link de candidatura de uma vaga para começar.'
                : 'Nenhum candidato encontrado com os filtros atuais.'}
            </div>
          ) : (
            filteredCandidates.map(candidate => (
              <div
                key={candidate.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/dashboard/candidates/${candidate.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/dashboard/candidates/${candidate.id}`);
                  }
                }}
                className={`grid grid-cols-12 gap-4 items-center p-4 rounded border transition-colors cursor-pointer group ${darkMode ? 'bg-gray-800/20 border-gray-800 hover:border-gray-600' : 'bg-white border-triagen-border-light hover:border-neutral-300 hover:bg-neutral-50/60'}`}
              >
                <div className="col-span-6 md:col-span-5 flex items-center gap-4 min-w-0">
                  <Avatar name={candidate.name} size="lg" />
                  <div className="flex flex-col min-w-0">
                    <span className={`font-heading text-lg font-normal mb-0.5 leading-tight truncate ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>{candidate.name}</span>
                    <span className={`text-[0.65rem] uppercase tracking-wider font-semibold truncate ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
                      {candidate.job?.title || 'Candidatura direta'}
                    </span>
                  </div>
                </div>

                <div className="col-span-3 hidden md:flex items-center">
                  <span className={`px-3 py-1 rounded-full text-[0.6rem] font-bold tracking-widest uppercase ${getStatusColor(candidate.status)}`}>
                    {getStatusShortText(candidate.status)}
                  </span>
                </div>

                <div className="col-span-4 md:col-span-3 flex items-center gap-3">
                  {candidate.score !== undefined ? (
                    <>
                      <ScoreRing score={candidate.score} size="sm" darkMode={darkMode} />
                      <span className={`hidden lg:block text-[0.65rem] uppercase tracking-widest font-semibold ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        / 100
                      </span>
                    </>
                  ) : (
                    <span className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>Aguardando entrevista</span>
                  )}
                </div>

                <div className="col-span-2 md:col-span-1 flex items-center justify-end">
                  <button
                    onClick={(e) => toggleShortlist(candidate, e)}
                    aria-pressed={candidate.is_favorite}
                    aria-label={candidate.is_favorite ? `Remover ${candidate.name} da pré-seleção` : `Adicionar ${candidate.name} à pré-seleção`}
                    title={candidate.is_favorite ? 'Remover da pré-seleção' : 'Adicionar à pré-seleção'}
                    className={`p-2 rounded-full transition-colors ${
                      candidate.is_favorite
                        ? 'text-amber-500 hover:text-amber-600'
                        : (darkMode ? 'text-gray-600 hover:text-gray-300' : 'text-gray-300 hover:text-triagen-secondary')
                    }`}
                  >
                    <Star className="w-5 h-5" fill={candidate.is_favorite ? 'currentColor' : 'none'} />
                  </button>
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
