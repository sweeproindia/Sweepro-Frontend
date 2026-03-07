import { Navigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';

interface RequireAuthProps {
  children: JSX.Element;
  requireProfileCompletion?: boolean;
}

/**
 * Auth loading spinner — shown while the auth state is being initialized.
 * Matches the app's dark-gradient design language.
 */
function AuthLoadingSpinner() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          border: '4px solid rgba(99,102,241,0.3)',
          borderTop: '4px solid #6366f1',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/**
 * Route guard that requires authentication.
 * Redirects to /login if not authenticated.
 * Redirects to /complete-profile if profile not completed (when requireProfileCompletion is true).
 *
 * SECURITY FIX (audit finding "Rendering Children Before Auth Finishes"):
 * Previously, if a localStorage token existed but auth had not yet initialized,
 * the protected page was rendered immediately. This caused:
 *   - API calls to fire before session validity was confirmed
 *   - Brief flash of protected UI before redirect on expired tokens
 *
 * Now: always show a spinner until authInitialized is true, regardless of
 * whether a localStorage token exists. The spinner is shown for ~200-300ms
 * (one network round-trip to /auth/me) — an acceptable UX tradeoff for correct
 * security semantics.
 *
 * NOTE: Role-based access is enforced server-side. The frontend guards are a
 * UX layer only and should never be the sole security mechanism.
 */
export function RequireAuth({ children, requireProfileCompletion = true }: RequireAuthProps) {
  const { user, isLoading, authInitialized } = useUser();

  // Wait for auth to complete initial verification before rendering anything.
  // Previously this returned `token ? children : null` which rendered protected
  // content before confirming the token was still valid.
  if (!authInitialized || isLoading) {
    return <AuthLoadingSpinner />;
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Profile completion required for Firebase OAuth users
  const isFirebaseUser = Boolean((user as any).firebase_uid);
  if (requireProfileCompletion && isFirebaseUser && !user.profile_completed) {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
}

/**
 * Guest-only route guard.
 * If authenticated: redirects to the correct dashboard.
 * If not authenticated: renders the public page.
 */
export function RequireGuest({ children }: { children: JSX.Element }) {
  const { user, isLoading, authInitialized } = useUser();

  // While auth is initializing, show nothing to avoid flash of guest pages
  // for authenticated users (e.g. visiting /login with a valid cookie).
  if (!authInitialized || isLoading) {
    return null;
  }

  if (!user) {
    return children;
  }

  const isFirebaseUser = Boolean((user as any).firebase_uid);
  if (isFirebaseUser && !user.profile_completed) {
    return <Navigate to="/complete-profile" replace />;
  }

  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'MAID') return <Navigate to="/maid-dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}

/**
 * Route guard that requires a specific role.
 */
interface RequireRoleProps {
  children: JSX.Element;
  roles: ('CUSTOMER' | 'MAID' | 'ADMIN')[];
  requireProfileCompletion?: boolean;
}

export function RequireRole({ children, roles, requireProfileCompletion = true }: RequireRoleProps) {
  const { user, isLoading, authInitialized } = useUser();

  if (!authInitialized || isLoading) {
    return <AuthLoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isFirebaseUser = Boolean((user as any).firebase_uid);
  if (requireProfileCompletion && isFirebaseUser && !user.profile_completed) {
    return <Navigate to="/complete-profile" replace />;
  }

  // Check role — redirect to the user's actual dashboard if wrong role.
  if (!user.role || !roles.includes(user.role)) {
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'MAID') return <Navigate to="/maid-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
