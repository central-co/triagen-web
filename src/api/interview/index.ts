/**
 * Interview API module
 *
 * All backend calls related to interview lifecycle:
 * candidate lookup, plan generation, session start/finish, and report polling.
 */

import { apiClient, ApiError } from "../client";
import type {
    CandidateData,
    FinishSessionResult,
    InterviewPlanResult,
    InterviewReport,
    InterviewSession,
} from "../types";

// Re-export types that consumers previously imported from this module
export type {
    CandidateData,
    InterviewReport,
    InterviewSession,
} from "../types";

/**
 * Get candidate data by short code.
 * Endpoint: GET /application/:shortCode
 */
export async function getCandidateByShortCode(
    shortCode: string,
): Promise<CandidateData> {
    const { data } = await apiClient.get<CandidateData>(
        `/application/${shortCode}`,
    );
    return data;
}

/**
 * Get interview status and report.
 * Endpoint: GET /interviews/:candidateId/report
 */
export async function getInterviewStatus(
    candidateId: string,
): Promise<InterviewReport> {
    try {
        const { data } = await apiClient.get<InterviewReport>(
            `/interviews/${candidateId}/report`,
        );
        return data;
    } catch (err: unknown) {
        if (err instanceof ApiError && err.status === 404) {
            return { status: "not_found" };
        }
        throw new Error("Erro ao buscar relatório");
    }
}

/**
 * Generate interview plan.
 * Endpoint: POST /interviews/plan/:candidateId
 */
export async function planInterview(
    candidateId: string,
): Promise<InterviewPlanResult> {
    const { data } = await apiClient.post<InterviewPlanResult>(
        `/interviews/plan/${candidateId}`,
    );
    return data;
}

/**
 * Start interview session and get LiveKit token.
 * Endpoint: POST /interview/start/:interview_id
 */
export async function startInterviewSession(
    interviewId: string,
): Promise<InterviewSession> {
    const { data } = await apiClient.post<{ token: string; room_name: string }>(
        `/interview/start/${interviewId}`,
    );
    return {
        token: data.token,
        roomName: data.room_name,
    };
}

/**
 * Finish interview session.
 * Endpoint: POST /interviews/finish-session/:candidateId
 */
export async function finishInterviewSession(
    candidateId: string,
): Promise<FinishSessionResult> {
    const { data } = await apiClient.post<FinishSessionResult>(
        `/interviews/finish-session/${candidateId}`,
    );
    return data;
}
