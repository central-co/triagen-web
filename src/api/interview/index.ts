// Unified interview API service
// NOTE: API_URL should be passed as parameter, not hardcoded from env
// This allows dynamic configuration from Edge Functions

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

/**
 * Get candidate data by short code
 * TODO: Backend needs to implement GET /api/application/:shortCode
 * For now, this will fail with 404 until backend implements it
 */
export async function getCandidateByShortCode(
    shortCode: string,
    apiUrl: string,
): Promise<CandidateData> {
    // Remove trailing slash
    const baseUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;

    // TODO: Backend precisa implementar este endpoint
    // Endpoint esperado: GET /api/application/:shortCode
    // Response esperado: { id, candidate_id, name, email, job_id, job: {...} }
    const response = await fetch(`${baseUrl}/api/application/${shortCode}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(
            text ||
                "Código inválido ou não encontrado. Endpoint ainda não implementado no backend.",
        );
    }

    return response.json();
}

/**
 * Get interview status and report
 */
export async function getInterviewStatus(
    candidateId: string,
    apiUrl: string,
): Promise<InterviewReport> {
    const baseUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
    const response = await fetch(
        `${baseUrl}/api/interviews/${candidateId}/report`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        },
    );

    if (response.status === 404) {
        return { status: "not_found" };
    }

    if (!response.ok) {
        throw new Error("Erro ao buscar relatório");
    }

    const data = await response.json();

    // Check if report is still processing
    if (!data.overallScore && !data.summary) {
        return { status: "processing" };
    }

    return {
        status: "completed",
        ...data,
    };
}

/**
 * Generate interview plan
 */
export async function planInterview(
    candidateId: string,
    apiUrl: string,
): Promise<{ planId: string; status: string }> {
    const baseUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
    const response = await fetch(
        `${baseUrl}/api/interviews/plan/${candidateId}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        },
    );

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Erro ao gerar plano de entrevista");
    }

    return response.json();
}

/**
 * Start interview session (get LiveKit token)
 */
export async function startInterviewSession(
    candidateId: string,
    apiUrl: string,
): Promise<InterviewSession> {
    const baseUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
    const response = await fetch(
        `${baseUrl}/api/interviews/start/${candidateId}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        },
    );

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Erro ao iniciar sessão de entrevista");
    }

    return response.json();
}

/**
 * Submit application (create candidate)
 */
export async function submitApplication(data: {
    name: string;
    email: string;
    phone?: string;
    job_id: string;
    resume_text?: string;
}, apiUrl: string): Promise<{ candidateId: string; shortCode: string }> {
    const baseUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
    const response = await fetch(`${baseUrl}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Erro ao enviar candidatura");
    }

    const result = await response.json();
    return {
        candidateId: result.candidate_id,
        shortCode: result.short_code,
    };
}
