import { Navigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { getAuthToken, getAuthTokenType } from '@/services/api';

interface RequireAuthProps {
  children: JSX.Element;
  requireProfileCompletion?: boolean;
}

/**
 * Route guard that requires authentication
 * Redirects to login if not authenticated
 * Redirects to complete-profile if profile not completed (when requireProfileCompletion is true)
 */
export function RequireAuth({ children, requireProfileCompletion = true }: RequireAuthProps) {
  const token = getAuthToken();
  const tokenType = getAuthTokenType();
  const { user, isLoading, authInitialized } = useUser();

  // Wait for auth to initialize
  if (!authInitialized) {
    return token ? children : null;
  }

  // Let page-level skeletons handle loading when a session token exists.
  if (isLoading && token) {
    return children;
  }

  // Not authenticated
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Profile completion required
  const shouldEnforceProfileCompletion = tokenType === 'firebase' || Boolean((user as any).firebase_uid);

  if (requireProfileCompletion && shouldEnforceProfileCompletion && !user.profile_completed) {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
}

/**
 * Guest-only route guard
 * - If authenticated: redirects to complete-profile (if required) or the correct dashboard
 * - If not authenticated: allows rendering the public page
 */
export function RequireGuest({ children }: { children: JSX.Element }) {
  const token = getAuthToken();
  const tokenType = getAuthTokenType();
  const { user, isLoading, authInitialized } = useUser();

  // While auth is initializing, avoid rendering guest pages if we already have a token.
  if (!authInitialized) {
    return token ? null : children;
  }

  if (isLoading && token) {
    return null;
  }

  if (!token || !user) {
    return children;
  }

  const shouldEnforceProfileCompletion = tokenType === 'firebase' || Boolean((user as any).firebase_uid);

  if (shouldEnforceProfileCompletion && !user.profile_completed) {
    return <Navigate to="/complete-profile" replace />;
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin-dashboard" replace />;
  }

  if (user.role === 'MAID') {
    return <Navigate to="/maid-dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

/**
 * Route guard that requires specific role
 */
interface RequireRoleProps {
  children: JSX.Element;
  roles: ('CUSTOMER' | 'MAID' | 'ADMIN')[];
  requireProfileCompletion?: boolean;
}

export function RequireRole({ children, roles, requireProfileCompletion = true }: RequireRoleProps) {
  const token = getAuthToken();
  const tokenType = getAuthTokenType();
  const { user, isLoading, authInitialized } = useUser();

  // Wait for auth to initialize
  if (!authInitialized) {
    return token ? children : null;
  }

  // Let page-level skeletons handle loading when a session token exists.
  if (isLoading && token) {
    return children;
  }

  // Not authenticated
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Profile completion required
  const shouldEnforceProfileCompletion = tokenType === 'firebase' || Boolean((user as any).firebase_uid);

  if (requireProfileCompletion && shouldEnforceProfileCompletion && !user.profile_completed) {
    return <Navigate to="/complete-profile" replace />;
  }

  // Check role
  if (!user.role || !roles.includes(user.role)) {
    // Redirect based on user's actual role
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (user.role === 'MAID') {
      return <Navigate to="/maid-dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}


