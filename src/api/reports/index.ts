/**
 * Reports API module
 *
 * Fetching interview reports directly from Supabase.
 */

import { supabase } from "../../integrations/supabase/client";
import type { DashboardReportData } from "../types";

export type { DashboardReportData } from "../types";

/**
 * Fetch the interview report for a candidate by candidate_id.
 * Queries Supabase directly using the candidate's interview_id.
 *
 * Returns null if the report does not exist yet.
 * Throws for all other errors.
 */
export async function getInterviewReport(
    candidateId: string,
): Promise<DashboardReportData | null> {
    try {
        // First, get the candidate to find their interview_id
        const { data: candidate, error: candidateError } = await supabase
            .from('candidates')
            .select('interview_id, name, jobs(id, title)')
            .eq('id', candidateId)
            .single();

        if (candidateError || !candidate?.interview_id) {
            console.error('[getInterviewReport] Candidate not found:', candidateError);
            return null;
        }

        // Get the report using interview_id
        const { data: report, error: reportError } = await supabase
            .from('interview_reports')
            .select('*')
            .eq('interview_id', candidate.interview_id)
            .single();

        if (reportError) {
            if (reportError.code === 'PGRST116') {
                // No report found
                return null;
            }
            throw reportError;
        }

        if (!report) {
            return null;
        }

        // Map to DashboardReportData format (camelCase)
        return {
            id: report.id,
            candidateId: candidateId,
            candidate_name: candidate.name,
            job_title: (candidate.jobs as any)?.title || 'N/A',
            overallScore: Number(report.overall_score || 0),
            createdAt: report.created_at || '',
            alignment_analysis: report.alignment_analysis || '',
            summary: report.summary || '',
            category_scores: (report.category_scores as Record<string, number>) || {},
            status: (report.status as 'pending' | 'processing' | 'completed' | 'failed') || 'pending',
            strengths: (report.strengths as string[]) || [],
            weaknesses: (report.weaknesses as string[]) || [],
            recommendation: report.recommendation || '',
            criteriaScores: (report.criteria_scores as Record<string, { score: number; justification: string }>) || {},
        } as DashboardReportData;
    } catch (err: unknown) {
        console.error('[getInterviewReport] Error:', err);
        throw new Error('Failed to fetch interview report');
    }
}
