/**
 * Observability Module for React Frontend
 *
 * Provides lightweight error tracking and API call tracing.
 * Minimal bundle impact - no full page load tracing.
 */

export interface TraceContext {
    traceId: string;
    spanId: string;
}

export interface LogEntry {
    timestamp: string;
    level: "debug" | "info" | "warn" | "error";
    message: string;
    traceId?: string;
    spanId?: string;
    context?: string;
    attributes?: Record<string, unknown>;
}

export interface ErrorEntry {
    timestamp: string;
    message: string;
    stack?: string;
    componentStack?: string;
    traceId?: string;
    context?: string;
    attributes?: Record<string, unknown>;
}

export interface APICallEntry {
    timestamp: string;
    method: string;
    url: string;
    status?: number;
    durationMs: number;
    traceId: string;
    spanId: string;
    error?: string;
}

/**
 * Generate a random trace ID (32 hex characters)
 */
function generateTraceId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generate a random span ID (16 hex characters)
 */
function generateSpanId(): string {
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Observability class for frontend telemetry
 */
class Observability {
    private static instance: Observability | null = null;

    private logs: LogEntry[] = [];
    private errors: ErrorEntry[] = [];
    private apiCalls: APICallEntry[] = [];
    private sessionTraceId: string;
    private consoleOutput: boolean;
    private maxEntries: number;

    constructor(options?: { consoleOutput?: boolean; maxEntries?: number }) {
        this.sessionTraceId = generateTraceId();
        this.consoleOutput = options?.consoleOutput ?? true;
        this.maxEntries = options?.maxEntries ?? 1000;
        Observability.instance = this;
    }

    /**
     * Get singleton instance
     */
    static getInstance(): Observability {
        if (!Observability.instance) {
            Observability.instance = new Observability();
        }
        return Observability.instance;
    }

    /**
     * Get session trace ID
     */
    getSessionTraceId(): string {
        return this.sessionTraceId;
    }

    /**
     * Create a new trace context for an operation
     */
    createTraceContext(): TraceContext {
        return {
            traceId: this.sessionTraceId,
            spanId: generateSpanId(),
        };
    }

    /**
     * Log a message
     */
    private log(
        level: LogEntry["level"],
        message: string,
        context?: string,
        attributes?: Record<string, unknown>,
    ): void {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            traceId: this.sessionTraceId,
            context,
            attributes,
        };

        this.logs.push(entry);
        this.trimEntries();

        if (this.consoleOutput) {
            const prefix = `[${this.sessionTraceId.slice(0, 8)}]`;
            const ctx = context ? `[${context}]` : "";
            switch (level) {
                case "debug":
                    console.debug(`${prefix}${ctx}`, message, attributes || "");
                    break;
                case "info":
                    console.info(`${prefix}${ctx}`, message, attributes || "");
                    break;
                case "warn":
                    console.warn(`${prefix}${ctx}`, message, attributes || "");
                    break;
                case "error":
                    console.error(`${prefix}${ctx}`, message, attributes || "");
                    break;
            }
        }
    }

    debug(
        message: string,
        context?: string,
        attributes?: Record<string, unknown>,
    ): void {
        this.log("debug", message, context, attributes);
    }

    info(
        message: string,
        context?: string,
        attributes?: Record<string, unknown>,
    ): void {
        this.log("info", message, context, attributes);
    }

    warn(
        message: string,
        context?: string,
        attributes?: Record<string, unknown>,
    ): void {
        this.log("warn", message, context, attributes);
    }

    error(
        message: string,
        context?: string,
        attributes?: Record<string, unknown>,
    ): void {
        this.log("error", message, context, attributes);
    }

    /**
     * Record an error
     */
    recordError(
        error: Error,
        context?: string,
        componentStack?: string,
        attributes?: Record<string, unknown>,
    ): void {
        const entry: ErrorEntry = {
            timestamp: new Date().toISOString(),
            message: error.message,
            stack: error.stack,
            componentStack,
            traceId: this.sessionTraceId,
            context,
            attributes,
        };

        this.errors.push(entry);
        this.trimEntries();

        // Also log the error
        this.log("error", error.message, context, {
            ...attributes,
            stack: error.stack,
        });
    }

    /**
     * Record an API call
     */
    recordAPICall(call: Omit<APICallEntry, "timestamp">): void {
        const entry: APICallEntry = {
            ...call,
            timestamp: new Date().toISOString(),
        };

        this.apiCalls.push(entry);
        this.trimEntries();

        // Log the API call
        const status = call.error ? `ERROR: ${call.error}` : `${call.status}`;
        this.log(
            call.error ? "error" : "info",
            `${call.method} ${call.url} - ${status} (${call.durationMs}ms)`,
            "APICall",
            { url: call.url, status: call.status, durationMs: call.durationMs },
        );
    }

    /**
     * Trim entries to max size
     */
    private trimEntries(): void {
        if (this.logs.length > this.maxEntries) {
            this.logs = this.logs.slice(-this.maxEntries);
        }
        if (this.errors.length > this.maxEntries) {
            this.errors = this.errors.slice(-this.maxEntries);
        }
        if (this.apiCalls.length > this.maxEntries) {
            this.apiCalls = this.apiCalls.slice(-this.maxEntries);
        }
    }

    /**
     * Get all collected data
     */
    getData(): {
        logs: LogEntry[];
        errors: ErrorEntry[];
        apiCalls: APICallEntry[];
        sessionTraceId: string;
    } {
        return {
            logs: [...this.logs],
            errors: [...this.errors],
            apiCalls: [...this.apiCalls],
            sessionTraceId: this.sessionTraceId,
        };
    }

    /**
     * Export data as JSON string
     */
    exportJSON(): string {
        const data = {
            sessionTraceId: this.sessionTraceId,
            timestamp: new Date().toISOString(),
            logs: this.logs,
            errors: this.errors,
            apiCalls: this.apiCalls,
            summary: this.generateSummary(),
        };
        return JSON.stringify(data, null, 2);
    }

    /**
     * Download data as JSON file
     */
    downloadJSON(filename?: string): void {
        const json = this.exportJSON();
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename ||
            `observability-${this.sessionTraceId.slice(0, 8)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Generate summary
     */
    private generateSummary(): Record<string, unknown> {
        const apiDurations = this.apiCalls.map((c) => c.durationMs);
        const errorCount = this.errors.length;
        const warnCount = this.logs.filter((l) => l.level === "warn").length;

        return {
            totalLogs: this.logs.length,
            totalErrors: errorCount,
            totalWarnings: warnCount,
            totalAPICalls: this.apiCalls.length,
            apiLatency: {
                avgMs: apiDurations.length
                    ? apiDurations.reduce((a, b) => a + b, 0) /
                        apiDurations.length
                    : 0,
                maxMs: apiDurations.length ? Math.max(...apiDurations) : 0,
            },
            errorTypes: [
                ...new Set(this.errors.map((e) => e.context || "unknown")),
            ],
        };
    }

    /**
     * Reset the observability data
     */
    reset(): void {
        this.logs = [];
        this.errors = [];
        this.apiCalls = [];
        this.sessionTraceId = generateTraceId();
    }
}

// Export singleton
export const observability = Observability.getInstance();

/**
 * Create a scoped logger for a component/context
 */
export function createScopedLogger(context: string) {
    const obs = Observability.getInstance();
    return {
        debug: (message: string, attributes?: Record<string, unknown>) =>
            obs.debug(message, context, attributes),
        info: (message: string, attributes?: Record<string, unknown>) =>
            obs.info(message, context, attributes),
        warn: (message: string, attributes?: Record<string, unknown>) =>
            obs.warn(message, context, attributes),
        error: (message: string, attributes?: Record<string, unknown>) =>
            obs.error(message, context, attributes),
    };
}

// Make available globally for debugging
if (typeof window !== "undefined") {
    (window as any).__triagen_observability = observability;
}
