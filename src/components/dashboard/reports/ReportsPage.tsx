import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText } from 'lucide-react';
import useDarkMode from '../../../hooks/useDarkMode';
import { useAuth } from '../../../hooks/useAuth';
import StatusMessage from '../../ui/StatusMessage';
import Avatar from '../../ui/Avatar';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { ScoreRing } from '../../ui/Score';
import { fetchDashboardReports, DashboardReportListItem } from '../../../api/reports/dashboardReports';

function ReportsPage() {
  const [reports, setReports] = useState<DashboardReportListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { darkMode } = useDarkMode();
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    fetchDashboardReports(userId)
      .then((data) => { if (!cancelled) setReports(data); })
      .catch((err) => {
        console.error('Error fetching reports:', err);
        if (!cancelled) setError('Erro ao carregar relatórios. Tente novamente.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [userId]);

  const filteredReports = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return reports;
    return reports.filter(report =>
      report.candidate_name.toLowerCase().includes(term) ||
      report.job_title.toLowerCase().includes(term)
    );
  }, [reports, searchTerm]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const openReport = (report: DashboardReportListItem) => {
    if (report.candidate_id) {
      navigate(`/dashboard/candidates/${report.candidate_id}/report`);
    } else {
      navigate(`/dashboard/reports/${report.report_id}`);
    }
  };

  return (
    <div className="flex flex-col gap-10 max-w-6xl mx-auto pb-12">

      {/* Header */}
      <div className="flex flex-col gap-4 mt-4">
        <h1 className={`text-4xl md:text-[3.5rem] leading-[1.1] font-heading font-normal tracking-tight ${darkMode ? 'text-gray-100' : 'text-triagen-primary'}`}>
          Relatórios de <span className="italic text-triagen-secondary">Entrevistas</span>
        </h1>
        <p className={`text-lg font-sans max-w-xl ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
          Avaliações geradas pela IA após cada entrevista, com análise por critério e evidências da conversa.
        </p>
      </div>

      {error && <StatusMessage type="error" message={error} darkMode={darkMode} />}

      {/* Search */}
      {reports.length > 0 && (
        <div className={`flex justify-end border-b ${darkMode ? 'border-gray-800' : 'border-triagen-border-light'}`}>
          <div className="relative w-full md:w-64 pb-3">
            <Search strokeWidth={1.5} aria-hidden="true" className={`absolute left-3 top-[calc(50%-0.375rem)] -translate-y-1/2 h-4 w-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="search"
              placeholder="Buscar por candidato ou vaga..."
              aria-label="Buscar relatórios"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-sm rounded bg-transparent border-0 border-b transition-colors focus:ring-0 focus:outline-none ${darkMode ? 'border-gray-700 text-white placeholder-gray-600 focus:border-gray-500' : 'border-triagen-border-light text-triagen-primary placeholder-gray-400 focus:border-triagen-primary'}`}
            />
          </div>
        </div>
      )}

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className={`flex flex-col items-center gap-4 text-center py-20 px-6 border border-dashed rounded ${darkMode ? 'border-gray-700' : 'border-neutral-300'}`}>
          <FileText className={`h-10 w-10 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
          <div>
            <p className={`font-heading text-xl mb-1 ${darkMode ? 'text-gray-200' : 'text-triagen-primary'}`}>
              {reports.length === 0 ? 'Nenhum relatório ainda' : 'Nenhum relatório encontrado'}
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
              {reports.length === 0
                ? 'Os relatórios são gerados automaticamente assim que os candidatos concluem as entrevistas.'
                : 'Tente ajustar o termo de busca.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredReports.map((report) => (
            <button
              key={report.id}
              onClick={() => openReport(report)}
              className={`flex items-center justify-between gap-6 p-5 rounded border text-left transition-colors group ${darkMode ? 'bg-gray-800/20 border-gray-800 hover:border-gray-600' : 'bg-white border-triagen-border-light hover:border-neutral-300 hover:bg-neutral-50/60'}`}
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <Avatar name={report.candidate_name} size="lg" />
                <div className="flex flex-col min-w-0">
                  <span className={`font-heading text-lg leading-tight truncate ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>
                    {report.candidate_name}
                  </span>
                  <span className={`text-[0.65rem] uppercase tracking-wider font-semibold truncate mt-0.5 ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
                    {report.job_title}
                    {report.created_at && ` • ${new Date(report.created_at).toLocaleDateString('pt-BR')}`}
                  </span>
                  {report.summary && (
                    <span className={`text-sm mt-2 line-clamp-2 hidden sm:block ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
                      {report.summary}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0">
                {report.overall_score
                  ? <ScoreRing score={report.overall_score} size="md" darkMode={darkMode} />
                  : (
                    <span className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>Sem score</span>
                  )}
                <span className={`text-[0.65rem] font-semibold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity hidden md:block ${darkMode ? 'text-gray-300' : 'text-triagen-primary'}`}>
                  Abrir
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReportsPage;
