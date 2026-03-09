import { supabase } from '../../integrations/supabase/client';
import { Report } from '../../types/company';

type CandidateRow = {
  id: string;
  name: string;
  job_id: string;
  interview_id: string;
};

type JobRow = {
  id: string;
  title: string;
};

type ReportRow = {
  id: string;
  interview_id: string;
  created_at?: string | null;
  overall_score?: number | string | null;
  alignment_analysis?: string | null;
  summary?: string | null;
  category_scores?: unknown;
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

function parseCategoryScores(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, score]) => typeof score === 'number')
    .map(([key, score]) => [key, score as number]);

  return Object.fromEntries(entries);
}

export async function fetchDashboardReports(userId: string, limit?: number): Promise<DashboardReportListItem[]> {
  console.log('[dashboardReports] Fetching reports for userId:', userId);

  const { data: companies, error: companyError } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', userId);

  if (companyError) {
    console.error('[dashboardReports] Company fetch error:', companyError);
    throw companyError;
  }

  const companyIds = (companies || []).map((company) => company.id);
  console.log('[dashboardReports] Found companies:', companyIds);
  if (companyIds.length === 0) {
    console.log('[dashboardReports] No companies found');
    return [];
  }

  const { data: jobs, error: jobsError } = await supabase
    .from('jobs')
    .select('id,title')
    .in('company_id', companyIds);

  if (jobsError) {
    console.error('[dashboardReports] Jobs fetch error:', jobsError);
    throw jobsError;
  }

  const typedJobs = (jobs || []) as JobRow[];
  const jobIds = typedJobs.map((job) => job.id);
  console.log('[dashboardReports] Found jobs:', jobIds);
  if (jobIds.length === 0) {
    console.log('[dashboardReports] No jobs found');
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
  console.log('[dashboardReports] Found candidates:', typedCandidates.map(c => ({ id: c.id, interview_id: c.interview_id })));

  const interviewIds = typedCandidates
    .filter((candidate) => candidate.interview_id)
    .map((candidate) => candidate.interview_id);
  console.log('[dashboardReports] Interview IDs to query:', interviewIds);

  if (interviewIds.length === 0) {
    console.log('[dashboardReports] No interview IDs found');
    return [];
  }

  const candidateByInterviewId = new Map(
    typedCandidates.map((candidate) => [candidate.interview_id, candidate])
  );
  const jobTitleById = new Map(typedJobs.map((job) => [job.id, job.title]));

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
  console.log('[dashboardReports] Found reports:', typedReports.length, typedReports);

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
        overall_score: Number(report.overall_score || 0),
        created_at: report.created_at || '',
        alignment_analysis: report.alignment_analysis || '',
        summary: report.summary || '',
        category_scores: parseCategoryScores(report.category_scores),
        status: toReportStatus(report.status),
      } as DashboardReportListItem;
    })
    .filter((report): report is DashboardReportListItem => report !== null);

  console.log('[dashboardReports] Returning', mappedReports.length, 'mapped reports');
  return mappedReports;
}
