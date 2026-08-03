import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  ReactNode,
} from 'react';
import { AuthService, User, LoginCredentials } from '@/services/authService';
import { ApiError } from '@/services/api';

interface UserContextType {
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  setAuthenticatedUser: (userData: User) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  authInitialized: boolean;
  refreshUser: () => Promise<void>;
  /** M2: true when the browser reports no network connection */
  isOffline: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  // M2 FIX: Track online/offline state so components can react to network loss.
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // ------------------------------------------------------------------
  // M2: Online / Offline detection
  // navigator.online/offline events fire when the browser gains or loses
  // network connectivity. We surface this via context so any component
  // can show a banner / pause API calls gracefully.
  // ------------------------------------------------------------------
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isLoggingOutRef = useRef(false);

  // ------------------------------------------------------------------
  // Core auth helpers (defined early so the 401 listener can use logout)
  // ------------------------------------------------------------------
  const setAuthenticatedUser = useCallback((userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    try {
      // Clear React state immediately for snappy UI
      setUser(null);
      setIsAuthenticated(false);
      // Fire AuthService logout (which manages localStorage automatically)
      await AuthService.logout();
    } finally {
      isLoggingOutRef.current = false;
    }
  }, []);

  // ------------------------------------------------------------------
  // F3 FIX: Global 401 handler — ends "zombie sessions".
  //
  // Before: When the HttpOnly cookie expired, every API call silently
  // failed with 401 while the dashboard kept rendering from localStorage.
  // Users saw stale data with no indication their session had ended.
  //
  // How it works:
  //   1. api.ts dispatches a CustomEvent('auth:unauthorized') on every 401.
  //   2. This effect picks it up and calls logout(), which clears localStorage
  //      and React state.
  //   3. React Router's RequireAuth then redirects to /login because
  //      isAuthenticated is now false.
  //
  // The CustomEvent bus is used because api.ts has no access to React context.
  // ------------------------------------------------------------------
  useEffect(() => {
    const handleUnauthorized = () => {
      if (isAuthenticated) {
        console.warn('[UserContext] 401 received — ending session and redirecting to login.');
        logout();
      }
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [isAuthenticated, logout]);

  // ------------------------------------------------------------------
  // Auth initialization on mount
  // ------------------------------------------------------------------
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const storedUser = AuthService.getStoredUser();
        if (storedUser && AuthService.isAuthenticated()) {
          setUser(storedUser);
          setIsAuthenticated(true);

          // Try to refresh user data from server to confirm session is valid.
          // A 401 here means the cookie has already expired — the 401 handler
          // above will catch it and log out cleanly.
          try {
            await AuthService.getCurrentUser();
            const refreshedUser = AuthService.getStoredUser();
            if (refreshedUser) {
              setUser(refreshedUser);
            }
          } catch (error) {
            // Transient errors (network, 5xx) should NOT log out the user.
            // The global 401 handler covers the auth-expired case.
            if (!(error instanceof ApiError) || error.statusCode !== 401) {
              console.error('Failed to refresh user data (transient):', error);
            }
          }
        } else {
          // BUG 6 FIX: Do NOT call AuthService.logout() here.
          // This tab may have opened without a token in sessionStorage (new tab
          // with session-only auth). Calling logout() would call removeAuthToken()
          // which clears SHARED localStorage, killing every other open tab's session.
          // Simply mark this tab as unauthenticated without touching shared storage.
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // BUG 6 FIX: Do NOT call AuthService.logout() here either.
        // An error during initialization (e.g. network blip) should not wipe
        // the session for all other tabs. Just clear local React state.
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
        setAuthInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // ------------------------------------------------------------------
  // BUG 6 FIX: Cross-tab logout synchronisation.
  //
  // When the user explicitly logs out in tab A, AuthService.logout() removes
  // the 'user' key from localStorage. The 'storage' event fires in every
  // OTHER tab that shares the same origin. This listener picks that up and
  // cleanly clears React state in the other tabs — without calling
  // AuthService.logout() again (which would be a no-op but could cause
  // side-effects if the backend call fails in a closed tab race).
  // ------------------------------------------------------------------
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // 'user' key being removed means an explicit logout happened elsewhere
      if (event.key === 'user' && event.newValue === null && isAuthenticated) {
        console.warn('[UserContext] Session cleared in another tab — syncing logout state.');
        setUser(null);
        setIsAuthenticated(false);
      }
      // 'user' key being set means a login happened in another tab — sync it
      if (event.key === 'user' && event.newValue !== null && !isAuthenticated) {
        try {
          const syncedUser = JSON.parse(event.newValue);
          if (syncedUser) {
            setUser(syncedUser);
            setIsAuthenticated(true);
          }
        } catch {
          // Malformed data — ignore
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isAuthenticated]);

  const login = useCallback(
    async (email: string, password: string, rememberMe: boolean = false): Promise<User> => {
      setIsLoading(true);

      try {
        const credentials: LoginCredentials = { email, password };
        const response = await AuthService.login(credentials, rememberMe);

        if (response.success && response.data?.user) {
          const loggedInUser = response.data.user;
          setAuthenticatedUser(loggedInUser);
          return loggedInUser;
        } else {
          throw new Error(response.message || 'Login failed');
        }
      } catch (error) {
        setIsAuthenticated(false);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [setAuthenticatedUser]
  );

  const updateUser = useCallback(
    (userData: Partial<User>) => {
      if (user) {
        const updatedUser = { ...user, ...userData };
        AuthService.updateStoredUser(userData);
        setUser(updatedUser);
      }
    },
    [user]
  );

  // F5 FIX: refreshUser must NOT toggle isLoading.
  //
  // isLoading is consumed by RequireAuth to decide whether to render children
  // or a full-screen spinner. If refreshUser sets isLoading=true, RequireAuth
  // unmounts the entire protected page tree. When isLoading goes back to false,
  // the page remounts from scratch, all useEffect hooks re-fire, and any effect
  // that calls refreshUser (e.g. MaidDashboardEnhanced → fetchVerificationStatus)
  // creates an infinite unmount → remount → refreshUser → unmount loop.
  //
  // Instead, we silently update the user data without touching isLoading.
  // The initial auth check (useEffect on mount) is the only code path that
  // should set isLoading — that's the "auth initializing" state.
  const refreshUser = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      await AuthService.getCurrentUser();
      const refreshedUser = AuthService.getStoredUser();
      if (refreshedUser) {
        setUser(refreshedUser);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // Only logout on real auth failures. Transient network/server errors
      // should NOT wipe the session (the global 401 handler covers that).
      if (error instanceof ApiError && error.statusCode === 401) {
        logout();
      }
    }
  }, [isAuthenticated, logout]);

  const contextValue = useMemo(
    () => ({
      user,
      login,
      logout,
      updateUser,
      setAuthenticatedUser,
      isLoading,
      isAuthenticated,
      authInitialized,
      refreshUser,
      isOffline,
    }),
    [
      user,
      login,
      logout,
      updateUser,
      setAuthenticatedUser,
      isLoading,
      isAuthenticated,
      authInitialized,
      refreshUser,
      isOffline,
    ]
  );

  return (
    <UserContext.Provider value={contextValue}>
      {/* M2: Global offline banner — shown at the top of every page */}
      {isOffline && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            background: '#b45309',
            color: '#fff',
            textAlign: 'center',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            letterSpacing: '0.01em',
          }}
        >
          📶 No internet connection — some features may not work until you reconnect.
        </div>
      )}
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};