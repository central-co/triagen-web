import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  FileText,
  Briefcase,
  Calendar,
  Star,
  StarOff,
  Edit,
  MessageSquare,
  CheckCircle,
} from 'lucide-react';
import { getStatusColor, getStatusText, getStatusIcon } from '../../../utils/candidateStatus';
import useDarkMode from '../../../hooks/useDarkMode';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../integrations/supabase/client';
import Button from '../../ui/Button';
import StatusMessage from '../../ui/StatusMessage';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { Candidate } from '../../../types/company';

interface Job {
  id: string;
  title: string;
  description: string;
  company: {
    id: string;
    name: string;
  };
}

interface CandidateWithJob extends Candidate {
  job: Job;
  score?: number;
  reportId?: string;
}

function CandidateProfilePage() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<CandidateWithJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);
  const { darkMode } = useDarkMode(true);
  const { user } = useAuth();

  useEffect(() => {
    if (candidateId && user) {
      fetchCandidate();
    }
  }, [candidateId, user]);

  const fetchCandidate = async () => {
    try {
      setLoading(true);

      if (!user?.id || !candidateId) {
        throw new Error('Dados necessários não encontrados');
      }

      // First get the user's company
      const { data: companies, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id);

      if (companyError) {
        throw companyError;
      }

      if (!companies || companies.length === 0) {
        throw new Error('Empresa não encontrada');
      }

      const { data: candidateData, error: candidateError } = await supabase
        .from('candidates')
        .select(`
          *,
          job:jobs(
            id,
            title,
            description,
            company:companies(id, name)
          ),
          interview_reports(id, overall_score, created_at)
        `)
        .eq('id', candidateId)
        .single();

      if (candidateError) {
        throw candidateError;
      }

      if (!candidateData) {
        throw new Error('Candidato não encontrado');
      }

      // Verify that this candidate belongs to a job from the user's company
      if (candidateData.job.company.id !== companies[0].id) {
        throw new Error('Acesso negado');
      }

      const report = candidateData.interview_reports && candidateData.interview_reports.length > 0 
                     ? candidateData.interview_reports[0] : null;

      // Transform the data to match our interface
      const transformedCandidate: CandidateWithJob = {
        ...candidateData,
        phone: candidateData.phone || undefined,
        resume_url: candidateData.resume_url || undefined,
        notes: candidateData.notes || undefined,
        interview_token: candidateData.interview_token || undefined,
        interview_started_at: candidateData.interview_started_at || undefined,
        interview_completed_at: candidateData.interview_completed_at || undefined,
        status: (candidateData.status || 'pending') as 'pending' | 'interviewed' | 'completed' | 'rejected' | 'hired',
        is_favorite: candidateData.is_favorite || false,
        custom_answers: candidateData.custom_answers as Record<string, unknown> | null,
        created_at: candidateData.created_at || new Date().toISOString(),
        updated_at: candidateData.updated_at || new Date().toISOString(),
        job: candidateData.job,
        score: report ? report.overall_score : undefined,
        reportId: report ? report.id : undefined,
      };

      setCandidate(transformedCandidate);
    } catch (err) {
      console.error('Error fetching candidate:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar candidato');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!candidate) return;

    setIsUpdatingFavorite(true);
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ is_favorite: !candidate.is_favorite })
        .eq('id', candidate.id);

      if (error) {
        throw error;
      }

      setCandidate(prev => prev ? { ...prev, is_favorite: !prev.is_favorite } : null);
    } catch (err) {
      console.error('Error updating favorite:', err);
    } finally {
      setIsUpdatingFavorite(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !candidate) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <Button onClick={() => navigate('/dashboard/candidates')} variant="outline" size="sm" icon={ArrowLeft} darkMode={darkMode}>Back to Pipeline</Button>
        <div className="mt-8">
           <StatusMessage type="error" title="Candidato não encontrado" message={error || 'O candidato solicitado não foi encontrado'} darkMode={darkMode} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-6xl mx-auto pb-16">
      
      {/* Breadcrumb / Top Bar */}
      <div className="flex items-center justify-between px-2 pt-6 mb-12">
        <button 
          onClick={() => navigate('/dashboard/candidates')}
          className={`flex items-center gap-2 text-xs uppercase tracking-widest font-semibold hover:opacity-70 transition-opacity ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}
        >
          <ArrowLeft className="w-4 h-4" /> Pipeline
        </button>
        <div className="flex items-center justify-end gap-3">
           <Button
             variant={candidate.is_favorite ? "primary-solid" : "secondary"}
             size="sm"
             onClick={toggleFavorite}
             isLoading={isUpdatingFavorite}
             icon={candidate.is_favorite ? Star : StarOff}
             darkMode={darkMode}
           >
             {candidate.is_favorite ? 'Shortlisted' : 'Shortlist'}
           </Button>
           {candidate.reportId && (
             <Button
               variant="primary-solid"
               size="sm"
               onClick={() => navigate(`/dashboard/candidates/${candidate.id}/report`)}
               icon={FileText}
               darkMode={darkMode}
             >
               View Report
             </Button>
           )}
        </div>
      </div>

      {/* Profile Header */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 px-2 mb-12 items-end">
         <div className="md:col-span-8 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className={`px-2.5 py-1 rounded-sm text-[0.65rem] font-bold tracking-widest uppercase ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-neutral-200 text-triagen-secondary'}`}>
                {candidate.status}
              </span>
              <span className={`text-[0.65rem] uppercase tracking-widest font-semibold ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
                {candidate.job.title}
              </span>
            </div>
            <h1 className={`text-5xl md:text-7xl font-heading font-normal tracking-tight leading-none ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>
              {candidate.name}
            </h1>
         </div>
         <div className="md:col-span-4 flex md:justify-end">
            <div className={`flex flex-col items-start md:items-end w-full md:w-auto p-6 border rounded ${darkMode ? 'border-gray-800 bg-gray-900/50' : 'border-neutral-200 bg-[#f8f9fa]'}`}>
               <span className={`text-[0.65rem] tracking-widest uppercase font-semibold mb-2 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>AI Intelligence Score</span>
               <div className="flex items-baseline gap-2">
                 <span className={`text-5xl font-heading ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>{Math.round(candidate.score || 0) || '--'}</span>
                 {candidate.score && <span className={`text-lg font-heading ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>/ 100</span>}
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 px-2">
         {/* Left Sidebar: Contact & Metadata */}
         <div className="lg:col-span-4 flex flex-col gap-8">
            <div className={`p-6 rounded border ${darkMode ? 'border-gray-800 bg-gray-900/50' : 'border-neutral-200 bg-white'}`}>
               <h3 className={`text-xs uppercase tracking-widest font-bold mb-6 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>Applicant Details</h3>
               <div className="flex flex-col gap-5">
                  <div className="flex items-start gap-3">
                     <Mail className={`w-4 h-4 mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                     <div className="flex flex-col">
                        <span className={`text-[0.65rem] uppercase tracking-wider font-semibold mb-0.5 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>Email</span>
                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-triagen-primary'}`}>{candidate.email}</span>
                     </div>
                  </div>
                  {candidate.phone && (
                     <div className="flex items-start gap-3">
                        <Phone className={`w-4 h-4 mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <div className="flex flex-col">
                           <span className={`text-[0.65rem] uppercase tracking-wider font-semibold mb-0.5 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>Phone</span>
                           <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-triagen-primary'}`}>{candidate.phone}</span>
                        </div>
                     </div>
                  )}
                  <div className="flex items-start gap-3">
                     <Calendar className={`w-4 h-4 mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                     <div className="flex flex-col">
                        <span className={`text-[0.65rem] uppercase tracking-wider font-semibold mb-0.5 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>Date Applied</span>
                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-triagen-primary'}`}>{new Date(candidate.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                     </div>
                  </div>
                  {candidate.interview_completed_at && (
                     <div className="flex items-start gap-3">
                        <CheckCircle className={`w-4 h-4 mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <div className="flex flex-col">
                           <span className={`text-[0.65rem] uppercase tracking-wider font-semibold mb-0.5 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>Interview Completed</span>
                           <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-triagen-primary'}`}>{new Date(candidate.interview_completed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                     </div>
                  )}
               </div>
            </div>

            {/* Application Data */}
            <div className={`p-6 rounded border ${darkMode ? 'border-gray-800 bg-gray-900/50' : 'border-neutral-200 bg-[#f8f9fa]'}`}>
               <h3 className={`text-xs uppercase tracking-widest font-bold mb-4 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>Role Context</h3>
               <div className="flex flex-col gap-4">
                  <div className="flex flex-col">
                     <span className={`text-[0.65rem] uppercase tracking-wider font-semibold mb-1 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>Target Role</span>
                     <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-triagen-primary'}`}>{candidate.job.title}</span>
                  </div>
                  <div className="flex flex-col">
                     <span className={`text-[0.65rem] uppercase tracking-wider font-semibold mb-1 ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>Entity</span>
                     <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-triagen-primary'}`}>{candidate.job.company.name}</span>
                  </div>
               </div>
               <div className="mt-6 pt-6 border-t border-dashed border-neutral-300 dark:border-gray-700 flex flex-col gap-3">
                 <Button
                   variant="secondary"
                   size="sm"
                   fullWidth
                   onClick={() => navigate(`/dashboard/jobs/${candidate.job_id}`)}
                   darkMode={darkMode}
                 >
                   View Role Brief
                 </Button>
               </div>
            </div>
         </div>

         {/* Main Content Area: Dossier / Answers */}
         <div className="lg:col-span-8 flex flex-col gap-10">
            {candidate.resume_text && (
              <div className="flex flex-col gap-4">
                 <h2 className={`font-heading text-2xl pb-4 border-b ${darkMode ? 'text-white border-gray-800' : 'text-triagen-primary border-neutral-200'}`}>
                   Resume Extract & Summary
                 </h2>
                 <div className={`prose max-w-none prose-sm sm:prose-base ${darkMode ? 'prose-invert prose-p:text-gray-300' : 'prose-p:text-triagen-secondary'}`}>
                   <p className="whitespace-pre-wrap leading-relaxed">{candidate.resume_text}</p>
                 </div>
              </div>
            )}

            {candidate.custom_answers && Object.keys(candidate.custom_answers).length > 0 && (
              <div className="flex flex-col gap-4">
                 <h2 className={`font-heading text-2xl pb-4 border-b ${darkMode ? 'text-white border-gray-800' : 'text-triagen-primary border-neutral-200'}`}>
                   Prequalification Questionnaire
                 </h2>
                 <div className="flex flex-col gap-6">
                    {Object.entries(candidate.custom_answers as Record<string, any>).map(([question, answer], index) => (
                      <div key={index} className="flex flex-col gap-2">
                        <h4 className={`text-sm font-bold tracking-tight ${darkMode ? 'text-gray-300' : 'text-triagen-primary'}`}>{question}</h4>
                        <p className={`text-sm md:text-base leading-relaxed ${darkMode ? 'text-gray-400' : 'text-triagen-secondary'}`}>
                          {typeof answer === 'string' ? answer : JSON.stringify(answer)}
                        </p>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {candidate.notes && (
              <div className="flex flex-col gap-4">
                 <h2 className={`font-heading text-2xl pb-4 border-b ${darkMode ? 'text-white border-gray-800' : 'text-triagen-primary border-neutral-200'}`}>
                   Internal Notes
                 </h2>
                 <div className={`p-6 rounded border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-[#fcfdfd] border-neutral-200'}`}>
                   <p className={`text-sm md:text-base leading-relaxed whitespace-pre-wrap ${darkMode ? 'text-gray-300' : 'text-triagen-secondary'}`}>
                     {candidate.notes}
                   </p>
                 </div>
              </div>
            )}

            {/* Empty state if nothing to show */}
            {!candidate.resume_text && (!candidate.custom_answers || Object.keys(candidate.custom_answers).length === 0) && !candidate.notes && (
              <div className={`py-16 px-4 text-center border border-dashed rounded ${darkMode ? 'border-gray-800 text-gray-500' : 'border-neutral-300 text-gray-400'}`}>
                 <p className="font-heading text-xl">No dossier content available.</p>
                 <p className="text-sm mt-2">Resume, notes, and screening questions will appear here.</p>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}

export default CandidateProfilePage;
