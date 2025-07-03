
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../integrations/supabase/client';

interface DashboardStats {
  totalCandidates: number;
  activeJobs: number;
  completedInterviews: number;
  pendingReviews: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCandidates: 0,
    activeJobs: 0,
    completedInterviews: 0,
    pendingReviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
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
        setStats({
          totalCandidates: 0,
          activeJobs: 0,
          completedInterviews: 0,
          pendingReviews: 0
        });
        return;
      }

      const company = companies[0];

      // Get jobs count
      const { count: jobsCount, error: jobsError } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', company.id)
        .eq('status', 'open');

      if (jobsError) {
        throw jobsError;
      }

      // Get candidates count
      const { count: candidatesCount, error: candidatesError } = await supabase
        .from('candidates')
        .select('*, jobs!inner(*)', { count: 'exact', head: true })
        .eq('jobs.company_id', company.id);

      if (candidatesError) {
        throw candidatesError;
      }

      // Get completed interviews count
      const { count: completedCount, error: completedError } = await supabase
        .from('candidates')
        .select('*, jobs!inner(*)', { count: 'exact', head: true })
        .eq('jobs.company_id', company.id)
        .not('interview_completed_at', 'is', null);

      if (completedError) {
        throw completedError;
      }

      // Get pending reviews (candidates with status pending)
      const { count: pendingCount, error: pendingError } = await supabase
        .from('candidates')
        .select('*, jobs!inner(*)', { count: 'exact', head: true })
        .eq('jobs.company_id', company.id)
        .eq('status', 'pending');

      if (pendingError) {
        throw pendingError;
      }

      setStats({
        totalCandidates: candidatesCount || 0,
        activeJobs: jobsCount || 0,
        completedInterviews: completedCount || 0,
        pendingReviews: pendingCount || 0
      });

    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error };
}
