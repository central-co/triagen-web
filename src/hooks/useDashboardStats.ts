import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../integrations/supabase/client';

interface DashboardStats {
  totalCandidates: number;
  activeJobs: number;
  completedInterviews: number;
  pendingReviews: number;
}

const EMPTY_STATS: DashboardStats = {
  totalCandidates: 0,
  activeJobs: 0,
  completedInterviews: 0,
  pendingReviews: 0,
};

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const fetchStats = async () => {
      try {
        const { data: companies, error: companyError } = await supabase
          .from('companies')
          .select('id')
          .eq('user_id', userId);

        if (companyError) throw companyError;

        if (!companies || companies.length === 0) {
          if (!cancelled) setStats(EMPTY_STATS);
          return;
        }

        const companyId = companies[0].id;

        const [jobsRes, candidatesRes, completedRes, pendingRes] = await Promise.all([
          supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId)
            .eq('status', 'open'),
          supabase
            .from('candidates')
            .select('*, jobs!inner(*)', { count: 'exact', head: true })
            .eq('jobs.company_id', companyId),
          supabase
            .from('candidates')
            .select('*, jobs!inner(*)', { count: 'exact', head: true })
            .eq('jobs.company_id', companyId)
            .not('interview_completed_at', 'is', null),
          supabase
            .from('candidates')
            .select('*, jobs!inner(*)', { count: 'exact', head: true })
            .eq('jobs.company_id', companyId)
            .eq('status', 'pending'),
        ]);

        const firstError = jobsRes.error || candidatesRes.error || completedRes.error || pendingRes.error;
        if (firstError) throw firstError;

        if (!cancelled) {
          setStats({
            totalCandidates: candidatesRes.count || 0,
            activeJobs: jobsRes.count || 0,
            completedInterviews: completedRes.count || 0,
            pendingReviews: pendingRes.count || 0,
          });
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        if (!cancelled) setError('Erro ao carregar estatísticas');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStats();
    return () => { cancelled = true; };
  }, [userId]);

  return { stats, loading, error };
}
