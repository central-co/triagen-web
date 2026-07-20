import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../integrations/supabase/client';
import { JobWithStats } from '../types/company';

function parseJsonArray<T>(value: unknown): T[] | null {
  if (!value) return null;
  if (Array.isArray(value)) return value as T[];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed as T[] : null;
    } catch {
      return null;
    }
  }
  return null;
}

export function useJobsData() {
  const [jobs, setJobs] = useState<JobWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const fetchJobs = async () => {
      try {
        const { data: companies, error: companyError } = await supabase
          .from('companies')
          .select('id')
          .eq('user_id', userId);

        if (companyError) throw companyError;

        if (!companies || companies.length === 0) {
          if (!cancelled) setJobs([]);
          return;
        }

        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select(`
            *,
            candidates(count)
          `)
          .eq('company_id', companies[0].id)
          .order('created_at', { ascending: false });

        if (jobsError) throw jobsError;

        const transformedJobs: JobWithStats[] = (jobsData || []).map(job => ({
          ...job,
          location: job.location || undefined,
          mandatory_requirements: parseJsonArray<string>(job.mandatory_requirements),
          desirable_requirements: parseJsonArray<string>(job.desirable_requirements),
          pre_interview_questions: parseJsonArray<{ id: number; question: string }>(job.pre_interview_questions),
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
  }, [userId]);

  return { jobs, loading, error };
}
