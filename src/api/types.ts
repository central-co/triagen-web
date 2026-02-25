// Shared API types across all modules

export interface InterviewReport {
    status: "not_found" | "processing" | "completed";
    overallScore?: number;
    criteriaScores?: Record<string, {
        score: number;
        justification: string;
    }>;
    summary?: string;
    strengths?: string[];
    weaknesses?: string[];
    recommendation?: "approve" | "reject" | "technical_test";
    alignment_analysis?: string;
    category_scores?: Record<string, number>;
}

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
    sessionId: string;
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
}

export interface ApplicationResult {
    candidateId: string;
    shortCode: string;
}

export interface DashboardReportData {
    id: string;
    candidateId: string;
    status: string;
    overallScore?: number;
    criteriaScores?: Record<
        string,
        number | { score: number; justification: string }
    >;
    summary?: string;
    strengths?: string[];
    weaknesses?: string[];
    recommendation?: "approve" | "reject" | "technical_test";
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
