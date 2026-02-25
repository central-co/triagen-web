/**
 * Config / Edge Function API module
 *
 * Calls to Supabase Edge Functions that require the Supabase URL and
 * anon key as base (not the backend API URL).
 *
 * Security headers are applied manually here since the base URL differs
 * from the backend API used by apiClient.
 */

import { apiClient } from "../client";
import type { WaitlistPayload, WaitlistResult } from "../types";

export type { WaitlistPayload, WaitlistResult } from "../types";

/**
 * Submit waitlist signup form.
 * Endpoint: POST <supabaseUrl>/functions/v1/waitlist-signup
 *
 * Uses the Supabase URL as base, with the anon key for Authorization.
 */
export async function submitWaitlistSignup(
    payload: WaitlistPayload,
): Promise<WaitlistResult> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

    const { data } = await apiClient.post<WaitlistResult>(
        "/functions/v1/waitlist-signup",
        payload,
        {
            baseUrl: supabaseUrl,
            headers: {
                Authorization: `Bearer ${supabaseAnonKey}`,
            },
        },
    );

    return data;
}
