/**
 * Application API module
 *
 * Backend calls for job application submission.
 */

import { apiClient } from "../client";
import type { ApplicationPayload, ApplicationResult } from "../types";

export type { ApplicationPayload, ApplicationResult } from "../types";

/**
 * Create a new job application.
 * Endpoint: POST /api/application/create
 */
export async function createApplication(
    payload: ApplicationPayload,
): Promise<ApplicationResult> {
    const { data } = await apiClient.post<{
        candidate_id: string;
        short_code: string;
    }>("/api/application/create", payload);

    return {
        candidateId: data.candidate_id,
        shortCode: data.short_code,
    };
}

/**
 * Submit application via the /api/applications endpoint (legacy alias).
 * Endpoint: POST /api/applications
 */
export async function submitApplication(
    payload: ApplicationPayload,
): Promise<ApplicationResult> {
    const { data } = await apiClient.post<{
        candidate_id: string;
        short_code: string;
    }>("/api/applications", payload);

    return {
        candidateId: data.candidate_id,
        shortCode: data.short_code,
    };
}
