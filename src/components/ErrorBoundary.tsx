import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional custom fallback UI. Receives error + reset function. */
  fallback?: (error: Error | null, reset: () => void) => ReactNode;
  /** Optional label for the section (shown in the fallback heading). */
  sectionName?: string;
}

/**
 * F1 FIX: Root ErrorBoundary.
 *
 * Zero ErrorBoundary components existed before this fix. Any component that
 * threw during render (bad JSON parse, undefined access, API shape mismatch)
 * crashed the entire SPA to a white screen with no recovery path.
 *
 * Usage:
 *   // Root-level (wraps all routes)
 *   <ErrorBoundary>
 *     <Routes />
 *   </ErrorBoundary>
 *
 *   // Section-level (wraps individual dashboard cards)
 *   <ErrorBoundary sectionName="Booking History" fallback={...}>
 *     <BookingHistoryCard />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // In production, send to an error reporting service (e.g. Sentry).
    // Keep this conditional so we can add it without re-deploying the boundary.
    if (import.meta.env.PROD) {
      console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    }
  }

  private reset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, sectionName } = this.props;

    if (!hasError) return children;

    // Use custom fallback if provided
    if (fallback) return fallback(error, this.reset);

    const label = sectionName ?? 'This section';

    return (
      <div
        role="alert"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: sectionName ? '120px' : '100vh',
          padding: '2rem',
          textAlign: 'center',
          background: sectionName ? 'transparent' : 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
          color: '#e2e8f0',
          gap: '1rem',
        }}
      >
        <div style={{ fontSize: sectionName ? '2rem' : '3rem' }}>⚠️</div>
        <h2 style={{ fontSize: sectionName ? '1rem' : '1.5rem', fontWeight: 700, color: '#f87171' }}>
          {label} encountered an error
        </h2>
        {!sectionName && (
          <p style={{ color: '#94a3b8', maxWidth: 480, fontSize: '0.95rem' }}>
            Something went wrong while rendering this page. Your data is safe — try refreshing.
          </p>
        )}
        {import.meta.env.DEV && error && (
          <pre
            style={{
              background: '#1e293b',
              borderRadius: 8,
              padding: '1rem',
              fontSize: '0.75rem',
              color: '#f87171',
              maxWidth: 600,
              overflow: 'auto',
              textAlign: 'left',
            }}
          >
            {error.toString()}
          </pre>
        )}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={this.reset}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 8,
              border: 'none',
              background: '#6366f1',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Try Again
          </button>
          {!sectionName && (
            <button
              onClick={() => { window.location.href = '/'; }}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: 8,
                border: '1px solid #475569',
                background: 'transparent',
                color: '#e2e8f0',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Go Home
            </button>
          )}
        </div>
      </div>
    );
  }
}

/**
 * Lightweight section-level boundary — wraps individual dashboard cards/sections.
 * Catches render errors without crashing the whole page.
 */
export function SectionErrorBoundary({
  children,
  name,
}: {
  children: ReactNode;
  name?: string;
}) {
  return <ErrorBoundary sectionName={name ?? 'Section'}>{children}</ErrorBoundary>;
}

export default ErrorBoundary;
