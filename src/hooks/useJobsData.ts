
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../integrations/supabase/client';
import { JobWithStats } from '../types/company';

export function useJobsData() {
  const [jobs, setJobs] = useState<JobWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;

    const fetchJobs = async () => {
      try {
        setLoading(true);

        // Get user's company
        const { data: companies, error: companyError } = await supabase
          .from('companies')
          .select('id')
          .eq('user_id', user.id);

        if (companyError) throw companyError;

        if (!companies || companies.length === 0) {
          if (!cancelled) setJobs([]);
          return;
        }

        const company = companies[0];

        // Get jobs with candidate count
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select(`
            *,
            candidates(count)
          `)
          .eq('company_id', company.id)
          .order('created_at', { ascending: false });

        if (jobsError) throw jobsError;

        const transformedJobs: JobWithStats[] = (jobsData || []).map(job => ({
          ...job,
          location: job.location || undefined,
          mandatory_requirements: job.mandatory_requirements ? (Array.isArray(job.mandatory_requirements) ? job.mandatory_requirements as string[] : JSON.parse(job.mandatory_requirements as string)) : null,
          desirable_requirements: job.desirable_requirements ? (Array.isArray(job.desirable_requirements) ? job.desirable_requirements as string[] : JSON.parse(job.desirable_requirements as string)) : null,
          pre_interview_questions: job.pre_interview_questions ? (Array.isArray(job.pre_interview_questions) ? job.pre_interview_questions as Array<{ id: number; question: string }> : JSON.parse(job.pre_interview_questions as string)) : null,
          candidatesCount: job.candidates?.[0]?.count || 0,
          candidates: job.candidates,
          status: (job.status as 'open' | 'closed' | 'paused') || 'open',
          created_at: job.created_at || new Date().toISOString(),
          updated_at: job.updated_at || new Date().toISOString(),
        }));

        if (!cancelled) setJobs(transformedJobs);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        if (!cancelled) setError('Erro ao carregar vagas');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchJobs();
    return () => { cancelled = true; };
  }, [user]);

  return { jobs, loading, error };
}
