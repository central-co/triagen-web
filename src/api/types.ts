// Shared API types across all modules

import type { DisplayCriterionScore } from "../utils/scoring";

export interface CandidateData {
    id: string;
    candidate_id: string;
    name: string;
    email: string;
    job_id: string;
}

export interface InterviewSession {
    token: string;
    roomName: string;
}

export interface InterviewPlanResult {
    planId: string;
    status: string;
}

export interface FinishSessionResult {
    success: boolean;
}

export interface ApplicationPayload {
    name: string;
    email: string;
    phone?: string;
    job_id: string;
    resume_text?: string;
    pre_interview_answers?: Record<string, string>;
}

export interface ApplicationResult {
    candidateId: string;
    shortCode: string;
}

export interface DashboardReportData {
    id: string;
    candidateId: string;
    candidate_name: string;
    job_title: string;
    status: string;
    /** 0-100 */
    overallScore?: number;
    criteriaScores: DisplayCriterionScore[];
    summary?: string;
    highlights?: string;
    createdAt?: string;
}

export interface WaitlistPayload {
    email: string;
    name: string;
    company?: string | null;
    job_title?: string | null;
    newsletter_consent?: boolean;
    recaptcha_token?: string;
}

export interface WaitlistResult {
    success: boolean;
}
