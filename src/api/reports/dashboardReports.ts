import { supabase } from '../../integrations/supabase/client';
import { Report } from '../../types/company';
import { computeOverallScore } from '../../utils/scoring';

type CandidateRow = {
  id: string;
  name: string;
  job_id: string;
  interview_id: string;
};

type JobRow = {
  id: string;
  title: string;
  criteria?: unknown;
};

type ReportRow = {
  id: string;
  interview_id: string;
  created_at?: string | null;
  criteria_scores?: unknown;
  summary?: string | null;
  highlights?: string | null;
  status?: string | null;
};

export type DashboardReportListItem = Report & {
  report_id: string;
  candidate_id: string;
};

function toReportStatus(value: string | null | undefined): Report['status'] {
  if (value === 'processing' || value === 'completed' || value === 'failed') {
    return value;
  }
  return 'pending';
}

export async function fetchDashboardReports(userId: string, limit?: number): Promise<DashboardReportListItem[]> {

  const { data: companies, error: companyError } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', userId);

  if (companyError) {
    console.error('[dashboardReports] Company fetch error:', companyError);
    throw companyError;
  }

  const companyIds = (companies || []).map((company) => company.id);
  if (companyIds.length === 0) {
    return [];
  }

  const { data: jobs, error: jobsError } = await supabase
    .from('jobs')
    .select('id,title,criteria')
    .in('company_id', companyIds);

  if (jobsError) {
    console.error('[dashboardReports] Jobs fetch error:', jobsError);
    throw jobsError;
  }

  const typedJobs = (jobs || []) as JobRow[];
  const jobIds = typedJobs.map((job) => job.id);
  if (jobIds.length === 0) {
    return [];
  }

  const { data: candidates, error: candidatesError } = await supabase
    .from('candidates')
    .select('id,name,job_id,interview_id')
    .in('job_id', jobIds);

  if (candidatesError) {
    console.error('[dashboardReports] Candidates fetch error:', candidatesError);
    throw candidatesError;
  }

  const typedCandidates = (candidates || []) as CandidateRow[];

  const interviewIds = typedCandidates
    .filter((candidate) => candidate.interview_id)
    .map((candidate) => candidate.interview_id);

  if (interviewIds.length === 0) {
    return [];
  }

  const candidateByInterviewId = new Map(
    typedCandidates.map((candidate) => [candidate.interview_id, candidate])
  );
  const jobTitleById = new Map(typedJobs.map((job) => [job.id, job.title]));
  const jobCriteriaById = new Map(typedJobs.map((job) => [job.id, job.criteria]));

  let reportQuery = supabase
    .from('interview_reports')
    .select('*')
    .in('interview_id', interviewIds)
    .order('created_at', { ascending: false });

  if (typeof limit === 'number') {
    reportQuery = reportQuery.limit(limit);
  }

  const { data: reportsData, error: reportsError } = await reportQuery;
  if (reportsError) {
    console.error('[dashboardReports] Reports fetch error:', reportsError);
    throw reportsError;
  }

  const typedReports = (reportsData || []) as ReportRow[];

  const mappedReports = typedReports
    .map((report) => {
      const candidate = candidateByInterviewId.get(report.interview_id);

      if (!candidate) {
        console.warn('[dashboardReports] No candidate found for interview_id:', report.interview_id);
        return null;
      }

      return {
        id: report.id,
        report_id: report.id,
        candidate_id: candidate.id,
        candidate_name: candidate.name,
        job_title: jobTitleById.get(candidate.job_id) || 'N/A',
        overall_score: computeOverallScore(report.criteria_scores, jobCriteriaById.get(candidate.job_id)) || 0,
        created_at: report.created_at || '',
        highlights: report.highlights || '',
        summary: report.summary || '',
        status: toReportStatus(report.status),
      } as DashboardReportListItem;
    })
    .filter((report): report is DashboardReportListItem => report !== null);
  return mappedReports;
}
