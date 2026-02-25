/**
 * Reports API module
 *
 * Backend calls for fetching interview reports from the dashboard.
 */

import { apiClient, ApiError } from "../client";
import type { DashboardReportData } from "../types";

export type { DashboardReportData } from "../types";

/**
 * Fetch the interview report for a candidate.
 * Endpoint: GET /api/interviews/:candidateId/report
 *
 * Returns null if the report does not exist yet (404).
 * Throws for all other errors.
 */
export async function getInterviewReport(
    candidateId: string,
): Promise<DashboardReportData | null> {
    try {
        const { data } = await apiClient.get<DashboardReportData>(
            `/api/interviews/${candidateId}/report`,
        );
        return data;
    } catch (err: unknown) {
        if (err instanceof ApiError && err.status === 404) {
            return null;
        }
        throw err;
    }
}
