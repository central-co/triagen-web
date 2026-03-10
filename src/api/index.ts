/**
 * Central API barrel export
 *
 * Import from here instead of individual modules:
 *   import { finishInterviewSession, getInterviewReport } from '@/api';
 */

// Base client & error
export { apiClient, ApiError } from "./client";
export type { ApiRequestOptions, ApiResponse } from "./client";

// Shared types
export type {
    ApplicationPayload,
    ApplicationResult,
    CandidateData,
    DashboardReportData,
    FinishSessionResult,
    InterviewPlanResult,
    InterviewReport,
    InterviewSession,
    WaitlistPayload,
    WaitlistResult,
} from "./types";

// Interview domain
export {
    finishInterviewSession,
    getCandidateByShortCode,
    getInterviewStatus,
    planInterview,
    startInterviewSession,
} from "./interview";

// Application domain
export { createApplication } from "./application";

// Reports domain
export { getInterviewReport } from "./reports";

// Config / Edge Functions domain
export { submitWaitlistSignup } from "./config";
