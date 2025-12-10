/**
 * Error Boundary Component
 *
 * Catches React errors and records them for observability.
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { observability, createScopedLogger } from "./index";

const logger = createScopedLogger("ErrorBoundary");

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error boundary that records errors for observability
 */
export class ObservabilityErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Record error for observability
        observability.recordError(
            error,
            "React",
            errorInfo.componentStack || undefined,
            {
                digest: (errorInfo as any).digest,
            },
        );

        logger.error(`React error caught: ${error.message}`, {
            stack: error.stack,
            componentStack: errorInfo.componentStack,
        });

        // Call custom error handler if provided
        this.props.onError?.(error, errorInfo);
    }

    render(): ReactNode {
        if (this.state.hasError) {
            // Render fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                    <div className="max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
                        <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
                            Something went wrong
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            An unexpected error occurred. Please refresh the page
                            and try again.
                        </p>
                        <div className="space-x-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Refresh Page
                            </button>
                            <button
                                onClick={() => {
                                    observability.downloadJSON();
                                }}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                            >
                                Download Debug Info
                            </button>
                        </div>
                        {import.meta.env.DEV && this.state.error && (
                            <details className="mt-6 text-left">
                                <summary className="cursor-pointer text-sm text-gray-500">
                                    Error details (dev only)
                                </summary>
                                <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-auto max-h-48">
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Hook to manually report errors to observability
 */
export function useErrorReporter() {
    return {
        reportError: (
            error: Error,
            context?: string,
            attributes?: Record<string, unknown>,
        ) => {
            observability.recordError(error, context, undefined, attributes);
        },
    };
}
