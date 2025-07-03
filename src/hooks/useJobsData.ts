
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
    if (user) {
      fetchJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        throw new Error('User not found');
      }
      
      // Get user's company
      const { data: companies, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id);

      if (companyError) {
        throw companyError;
      }

      if (!companies || companies.length === 0) {
        setJobs([]);
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

      if (jobsError) {
        throw jobsError;
      }

      // Transform the data to match JobWithStats interface
      const transformedJobs: JobWithStats[] = (jobsData || []).map(job => ({
        ...job,
        location: job.location || undefined,
        custom_fields: job.custom_fields ? job.custom_fields as Record<string, any> : null,
        requirements: job.requirements ? (Array.isArray(job.requirements) ? job.requirements as string[] : JSON.parse(job.requirements as string)) : null,
        differentials: job.differentials ? (Array.isArray(job.differentials) ? job.differentials as string[] : JSON.parse(job.differentials as string)) : null,
        custom_questions: job.custom_questions ? (Array.isArray(job.custom_questions) ? job.custom_questions : JSON.parse(job.custom_questions as string)) : null,
        evaluation_criteria: job.evaluation_criteria ? (Array.isArray(job.evaluation_criteria) ? job.evaluation_criteria : JSON.parse(job.evaluation_criteria as string)) : null,
        candidatesCount: job.candidates?.[0]?.count || 0,
        candidates: job.candidates,
        status: (job.status as 'open' | 'closed' | 'paused') || 'open',
        created_at: job.created_at || new Date().toISOString(),
        updated_at: job.updated_at || new Date().toISOString()
      }));

      setJobs(transformedJobs);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Erro ao carregar vagas');
    } finally {
      setLoading(false);
    }
  };

  return { jobs, loading, error };
}
