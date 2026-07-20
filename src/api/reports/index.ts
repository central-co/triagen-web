/**
 * Reports API module
 *
 * Fetching interview reports directly from Supabase.
 */

import { supabase } from "../../integrations/supabase/client";
import type { DashboardReportData } from "../types";
import { computeOverallScore, toDisplayCriteriaScores } from "../../utils/scoring";

export type { DashboardReportData } from "../types";

type ReportRow = {
    id: string;
    interview_id: string;
    created_at?: string | null;
    criteria_scores?: unknown;
    summary?: string | null;
    highlights?: string | null;
    status?: string | null;
};

type CandidateRow = {
    id: string;
    name: string;
    interview_id: string | null;
    jobs: { id: string; title: string; criteria?: unknown } | null;
};

function mapReport(report: ReportRow, candidate: CandidateRow): DashboardReportData {
    return {
        id: report.id,
        candidateId: candidate.id,
        candidate_name: candidate.name,
        job_title: candidate.jobs?.title || 'N/A',
        overallScore: computeOverallScore(report.criteria_scores, candidate.jobs?.criteria),
        createdAt: report.created_at || '',
        summary: report.summary || '',
        highlights: report.highlights || '',
        status: (report.status as 'pending' | 'processing' | 'completed' | 'failed') || 'pending',
        criteriaScores: toDisplayCriteriaScores(report.criteria_scores),
    };
}

const CANDIDATE_SELECT = 'id, name, interview_id, jobs(id, title, criteria)';

/**
 * Fetch an interview report either by the candidate's id or by the report's
 * own id. Returns null when the report doesn't exist yet.
 */
export async function getInterviewReport(
    params: { candidateId?: string; reportId?: string },
): Promise<DashboardReportData | null> {
    const { candidateId, reportId } = params;

    try {
        if (candidateId) {
            const { data: candidate, error: candidateError } = await supabase
                .from('candidates')
                .select(CANDIDATE_SELECT)
                .eq('id', candidateId)
                .single();

            if (candidateError || !candidate?.interview_id) {
                console.error('[getInterviewReport] Candidate not found:', candidateError);
                return null;
            }

            const { data: report, error: reportError } = await supabase
                .from('interview_reports')
                .select('*')
                .eq('interview_id', candidate.interview_id)
                .single();

            if (reportError) {
                if (reportError.code === 'PGRST116') return null; // no report yet
                throw reportError;
            }

            return report ? mapReport(report, candidate as unknown as CandidateRow) : null;
        }

        if (reportId) {
            const { data: report, error: reportError } = await supabase
                .from('interview_reports')
                .select('*')
                .eq('id', reportId)
                .single();

            if (reportError) {
                if (reportError.code === 'PGRST116') return null;
                throw reportError;
            }

            const { data: candidate, error: candidateError } = await supabase
                .from('candidates')
                .select(CANDIDATE_SELECT)
                .eq('interview_id', report.interview_id)
                .single();

            if (candidateError || !candidate) {
                console.error('[getInterviewReport] Candidate not found for report:', candidateError);
                return null;
            }

            return mapReport(report, candidate as unknown as CandidateRow);
        }

        return null;
    } catch (err: unknown) {
        console.error('[getInterviewReport] Error:', err);
        throw new Error('Failed to fetch interview report');
    }
}
