import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Star,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { getInterviewReport, DashboardReportData } from '../../../api/reports';
import useDarkMode from '../../../hooks/useDarkMode';
import Button from '../../ui/Button';
import LoadingSpinner from '../../ui/LoadingSpinner';

type CriteriaScore = { score: number; justification: string };

export default function DashboardReportDetailPage() {
  const { candidateId, reportId } = useParams<{ candidateId?: string; reportId?: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<DashboardReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { darkMode } = useDarkMode(true);

  useEffect(() => {
    if (!candidateId && !reportId) {
      navigate('/dashboard/reports');
      return;
    }

    const fetchReport = async () => {
      try {
        setLoading(true);
        const id = candidateId || reportId;

        const data = await getInterviewReport(id!);

        if (data === null || data.status === 'not_found') {
          setError('Report is not available yet. Please check back later.');
          return;
        }

        setReport(data);
      } catch (err) {
        console.error('Failed to fetch report:', err);
        setError('Failed to fetch the interview report.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [candidateId, reportId, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !report) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <Button onClick={() => navigate(candidateId ? `/dashboard/candidates/${candidateId}` : '/dashboard/reports')} variant="outline" size="sm" icon={ArrowLeft} darkMode={darkMode}>Back</Button>
        <div className={`mt-8 p-6 text-center text-xl font-bold rounded border ${darkMode ? 'border-red-900 bg-red-900/20 text-red-400' : 'border-red-200 bg-red-50 text-red-600'}`}>
          {error || 'Report not found.'}
        </div>
      </div>
    );
  }

  const {
    summary,
    overallScore = 0,
    highlights,
    criteriaScores = {},
    status
  } = report;

  const parsedCriteriaScores = criteriaScores as Record<string, number | CriteriaScore>;

  const getScoreColor = (score: number) => {
    if (score >= 80) return darkMode ? 'text-green-400' : 'text-green-600';
    if (score >= 60) return darkMode ? 'text-yellow-400' : 'text-yellow-600';
    return darkMode ? 'text-red-400' : 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200';
    if (score >= 60) return darkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200';
    return darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200';
  };

  const getPercentageScore = (val: number | CriteriaScore) => {
    const raw = typeof val === 'number' ? val : val.score;
    return raw <= 10 ? raw * 10 : raw;
  };

  return (
    <div className="flex flex-col max-w-[1200px] mx-auto pb-16">

      {/* Breadcrumb / Top Bar */}
      <div className="flex items-center justify-between px-2 pt-6 mb-12">
        <button
          onClick={() => navigate(candidateId ? `/dashboard/candidates/${candidateId}` : '/dashboard/reports')}
          className={`flex items-center gap-2 text-xs uppercase tracking-widest font-semibold hover:opacity-70 transition-opacity ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Context
        </button>
      </div>

      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 px-2 pb-10 border-b border-neutral-200 dark:border-gray-800">
         <div className="flex flex-col gap-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-sm text-[0.65rem] font-bold tracking-widest uppercase ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-neutral-200 text-triagen-secondary'}`}>
                Synthesis Report
              </span>
              <span className={`flex items-center gap-1.5 text-[0.65rem] uppercase tracking-widest font-semibold ${status === 'completed' || status === 'hired' ? (darkMode ? 'text-green-400' : 'text-green-600') : (darkMode ? 'text-gray-400' : 'text-triagen-secondary')}`}>
                {status === 'completed' || status === 'hired' ? <CheckCircle className="w-3 h-3" /> : null}
                {status || 'Analyzed'}
              </span>
            </div>
            <h1 className={`text-4xl md:text-6xl font-heading font-normal tracking-tight leading-tight ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>
              Intelligence Assessment
            </h1>
         </div>

         {/* Hero Score Block */}
         <div className="flex justify-start md:justify-end">
            <div className={`p-8 border rounded flex flex-col items-center justify-center min-w-[200px] ${getScoreBgColor(getPercentageScore(overallScore))}`}>
               <span className={`text-xs uppercase tracking-widest font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Overall Index</span>
               <div className="flex items-baseline gap-1">
                 <span className={`text-6xl font-heading ${getScoreColor(getPercentageScore(overallScore))}`}>{getPercentageScore(overallScore)}</span>
                 <span className={`text-2xl font-heading ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>/ 100</span>
               </div>
            </div>
         </div>
      </div>

      {/* Assessment Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 px-2">

         {/* Main Summary Column (WIDER NOW) */}
         <div className="lg:col-span-8 flex flex-col gap-12">

            {summary && (
              <section className="flex flex-col gap-5">
                 <h2 className={`font-heading text-2xl pb-3 border-b ${darkMode ? 'text-white border-gray-800' : 'text-triagen-primary border-neutral-200'}`}>
                   Executive Summary
                 </h2>
                 <p className={`text-base md:text-lg leading-relaxed whitespace-pre-wrap ${darkMode ? 'text-gray-300' : 'text-triagen-secondary'}`}>
                   {summary}
                 </p>
              </section>
            )}

         </div>

         {/* Sidebar Scores Column (NARROWER NOW, less vertical text compression) */}
         <div className="lg:col-span-4 flex flex-col gap-10">

            {Object.keys(parsedCriteriaScores).length > 0 && (
              <section className="flex flex-col gap-5">
                 <h3 className={`text-xs uppercase tracking-widest font-bold ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>
                   Evaluated Criteria
                 </h3>
                 <div className="flex flex-col gap-4">
                    {Object.entries(parsedCriteriaScores).map(([criteria, val]) => {
                       const score = getPercentageScore(val);
                       const justification = typeof val === 'object' && val.justification ? val.justification : null;

                       return (
                         <div key={criteria} className={`p-4 rounded border ${darkMode ? 'bg-gray-800/30 border-gray-800' : 'bg-white border-neutral-200'}`}>
                            <div className="flex justify-between items-start mb-2">
                               <h4 className={`text-sm font-semibold pr-4 leading-snug capitalize ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>{criteria.replace(/_/g, ' ')}</h4>
                               <span className={`font-heading text-xl shrink-0 ${getScoreColor(score)}`}>{score}</span>
                            </div>
                            {justification && (
                              <p className={`text-[0.7rem] leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {justification}
                              </p>
                            )}
                            <div className={`mt-2 h-1 w-full rounded-full ${darkMode ? 'bg-gray-800' : 'bg-neutral-200'}`}>
                              <div
                                className={`h-full rounded-full ${score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                              />
                            </div>
                         </div>
                       );
                    })}
                 </div>
              </section>
            )}
         </div>

      </div>

      {/* Highlights */}
      {highlights && (
        <section className={`mt-16 mx-2 p-6 rounded border ${darkMode ? 'bg-gray-800/30 border-gray-800' : 'bg-white border-neutral-200'}`}>
          <h3 className={`flex items-center gap-2 text-xs uppercase tracking-widest font-bold mb-4 ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
            <Sparkles className="w-4 h-4" /> Highlights
          </h3>
          <p className={`text-sm leading-relaxed whitespace-pre-wrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {highlights}
          </p>
        </section>
      )}

    </div>
  );
}
