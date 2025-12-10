/**
 * Traced Fetch Utility
 *
 * A wrapper around fetch that automatically records API calls
 * for the observability pipeline.
 */

import { observability } from "./index";

export interface TracedFetchOptions extends RequestInit {
    /**
     * Context name for logging
     */
    context?: string;
}

/**
 * Fetch wrapper that records API calls for observability
 */
export async function tracedFetch(
    url: string,
    options?: TracedFetchOptions,
): Promise<Response> {
    const startTime = Date.now();
    const { traceId, spanId } = observability.createTraceContext();
    const method = options?.method || "GET";

    // Add trace headers to request
    const headers = new Headers(options?.headers);
    headers.set("X-Trace-Id", traceId);
    headers.set("X-Span-Id", spanId);

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        const durationMs = Date.now() - startTime;

        observability.recordAPICall({
            method,
            url,
            status: response.status,
            durationMs,
            traceId,
            spanId,
        });

        return response;
    } catch (error) {
        const durationMs = Date.now() - startTime;
        const errorMessage = error instanceof Error
            ? error.message
            : String(error);

        observability.recordAPICall({
            method,
            url,
            durationMs,
            traceId,
            spanId,
            error: errorMessage,
        });

        throw error;
    }
}

/**
 * Create a traced fetch function for a specific API base URL
 */
export function createTracedAPI(baseUrl: string, defaultContext?: string) {
    return async function tracedAPICall<T = unknown>(
        path: string,
        options?: TracedFetchOptions,
    ): Promise<{ data: T | null; error: string | null; response: Response }> {
        const url = `${baseUrl}${path}`;

        try {
            const response = await tracedFetch(url, {
                ...options,
                context: options?.context || defaultContext,
            });

            if (!response.ok) {
                const errorText = await response.text();
                return {
                    data: null,
                    error: errorText || `HTTP ${response.status}`,
                    response,
                };
            }

            const contentType = response.headers.get("content-type");
            if (contentType?.includes("application/json")) {
                const data = await response.json();
                return { data: data as T, error: null, response };
            }

            return { data: null, error: null, response };
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : String(error);
            return {
                data: null,
                error: errorMessage,
                response: new Response(null, { status: 0 }),
            };
        }
    };
}
