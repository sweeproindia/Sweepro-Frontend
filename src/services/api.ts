// API Configuration - Use local backend in development, deployed URL in production
//
// M5 FIX: The old DEFAULT_PROD_API_BASE_URL pointed to
// 'sweep-pro-backend-testing.onrender.com' — a testing deployment.
// In production we now warn loudly if VITE_API_BASE_URL is not set,
// so a misconfigured deploy is immediately obvious rather than silently
// sending real user traffic to the test server.
const DEFAULT_PROD_API_BASE_URL = 'https://sweepro.in/api';

const ENV_API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;

const normalizeApiBaseUrl = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return DEFAULT_PROD_API_BASE_URL;
  if (!/^https?:\/\//i.test(trimmed)) return DEFAULT_PROD_API_BASE_URL;
  return /\/api\/?$/i.test(trimmed) ? trimmed.replace(/\/api\/?$/i, '/api') : `${trimmed.replace(/\/+$/, '')}/api`;
};

const RAW_API_BASE_URL = ENV_API_BASE_URL
  ? normalizeApiBaseUrl(ENV_API_BASE_URL)
  : (import.meta.env.DEV ? '/api' : DEFAULT_PROD_API_BASE_URL);

// M5 FIX: Fail loudly in production when VITE_API_BASE_URL is not configured.
// This surfaces misconfigurations immediately rather than sending prod traffic
// to a test server.
if (!import.meta.env.DEV && !ENV_API_BASE_URL) {
  console.error(
    '[Sweep Pro] WARNING: VITE_API_BASE_URL is not set. '
    + 'Requests will fall back to the LIVE backend. '
    + 'Set VITE_API_BASE_URL in your production environment variables.'
  );
}

export const API_BASE_URL = import.meta.env.DEV
  ? RAW_API_BASE_URL
  : normalizeApiBaseUrl(RAW_API_BASE_URL);

export const BACKEND_ORIGIN =
  (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
  (API_BASE_URL.startsWith('http') ? API_BASE_URL.replace(/\/api\/?$/, '') : 'http://localhost:3000');

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  // User
  USER: {
    PROFILE: '/users/profile',
    UPDATE: '/users/update',
    COMPLETE_PROFILE: '/auth/complete-profile',
  },
  // Apartments
  APARTMENTS: '/auth/apartments',
  // Profile
  PROFILE: {
    ME: '/profile/me',
    PUBLIC: '/profile/public/:userId',
    UPDATE_USER: '/profile/user',
    UPDATE_CUSTOMER: '/profile/customer',
    UPDATE_MAID: '/profile/maid',
    UPLOAD_IMAGE: '/profile/image',
    DELETE_IMAGE: '/profile/image/:imageType',
    STATS: '/profile/stats',
    STATS_BY_ID: '/profile/stats/:userId',
    ACTIVITY: '/profile/activity',
  },
  // Services
  SERVICES: {
    ALL: '/services',
    BY_ID: '/services/:id',
  },
  // Bookings
  BOOKINGS: {
    CREATE: '/bookings',
    MY_BOOKINGS: '/bookings/my-bookings',
    MY_ASSIGNMENTS: '/bookings/my-assignments',
    UPDATE_STATUS: '/bookings/:id/status',
    COMPLETE_PAYMENT: '/bookings/complete-payment',
    AVAILABLE_SLOTS: '/bookings/available-slots',
    ESTIMATE_COST: '/bookings/estimate-cost',
    COMPLETE_WITH_QR: '/bookings/:bookingId/complete-with-qr',

  },
  BOOKING_COMPLETION: {
    MAID_QR_CODE: '/booking-completion/maid/qr-code',
    MAID_CUSTOM_CODE: '/booking-completion/maid/custom-code',
    START: '/booking-completion/:bookingId/start',
    COMPLETE_WITH_QR: '/booking-completion/:bookingId/complete'
  },
  // Subscriptions
  SUBSCRIPTIONS: {
    PLANS: '/subscriptions/plans',
    VALIDATE_PRICING: '/subscriptions/validate-pricing',
    SUBSCRIBE: '/subscriptions/subscribe',
    MY_SUBSCRIPTION: '/subscriptions/my-subscription',
    STATUS: '/subscriptions/status',
    MONTHLY_STATUS: '/subscriptions/monthly-status',
    BUFFER_START: '/subscriptions/buffer/start',
    BUFFER_END: '/subscriptions/buffer/end',
    COMPLETE_PAYMENT: '/subscriptions/complete-payment',
    CANCEL: '/subscriptions/cancel',
  },
  // Dashboard
  DASHBOARD: {
    MAIN: '/dashboard/dashboard',
    CALENDAR: '/dashboard/calendar',
    BUFFER_HISTORY: '/dashboard/buffer-history',
    CYCLE_HISTORY: '/dashboard/cycle-history',
    PREFERENCES: '/dashboard/preferences',
  },
  // Payments
  PAYMENTS: {
    CREATE: '/payments',
    MY_PAYMENTS: '/payments/my-payments',
    VERIFY: '/payments/verify',
    RAZORPAY: {
      BOOKING_ORDER: '/payments/razorpay/booking/create-order',
      SUBSCRIPTION_ORDER: '/payments/razorpay/subscription/create-order',
      VERIFY: '/payments/razorpay/verify',
      FAILURE: '/payments/razorpay/failure',
      STATUS: '/payments/razorpay/status/:razorpayPaymentId',
    }
  },
  // Verification
  VERIFICATION: {
    // Admin endpoints
    ALL: '/documents/admin-verification-data',
    BY_ID: '/documents/review/:id',
    APPROVE: '/documents/verification/:id/approve',
    REJECT: '/documents/verification/:id/reject',
    STATS: '/documents/verification-stats',
    // Maid endpoints
    SUBMIT: '/documents/upload-verification',
    MY_STATUS: '/documents/maid-verification-status',
  },
  // Assignments
  ASSIGNMENTS: {
    // Maid endpoints
    PENDING: '/assignments/pending',
    MY_ASSIGNMENTS: '/assignments/my-assignments',
    BY_ID: '/assignments/:id',
    ACCEPT: '/assignments/:id/accept',
    REJECT: '/assignments/:id/reject',
    // Admin endpoints
    ALL: '/assignments/admin/assignments',
    CREATE: '/assignments/admin/assignments/create',
    STATS: '/assignments/admin/assignments/stats',
    CANCEL: '/assignments/admin/assignments/:id',
    // New admin booking management endpoints
    PENDING_ASSIGNMENTS: '/assignments/admin/pending-assignments',
    ASSIGNED_BOOKINGS: '/assignments/admin/assigned-bookings',
    REASSIGNMENT_BOOKINGS: '/assignments/admin/reassignment-bookings',
    AVAILABLE_MAIDS: '/assignments/admin/available-maids/:bookingId',
    SEND_ASSIGNMENT_REQUEST: '/assignments/admin/send-assignment-request',
  },
  // Buffer Management
  BUFFER: {
    REMAINING: '/buffer/remaining',
    REQUEST: '/buffer/request',
    HISTORY: '/buffer/history',
    ADMIN: {
      PENDING: '/buffer/admin/pending',
      APPROVE: '/buffer/admin/approve',
      REJECT: '/buffer/admin/reject',
      ALL: '/buffer/admin/all',
      STATISTICS: '/buffer/admin/statistics',
      AFFECTED_SERVICES: '/buffer/admin/affected-services',
    }
  },
  // Customer-Maid Assignments
  CUSTOMER_ASSIGNMENTS: {
    ASSIGN_MAID: '/admin/customer-assignments/assign',
    GET_ASSIGNMENT: '/admin/customer-assignments/:customerId',
    UPDATE_ASSIGNMENT: '/admin/customer-assignments/:customerId/update',
    GET_ALL: '/admin/customer-assignments',
    GET_CUSTOMER_STATUS: '/admin/customer-assignments/status/:customerId',
    // Assignment request endpoints
    GET_MAID_REQUESTS: '/admin/customer-assignments/requests/maid',
    ACCEPT_REQUEST: '/admin/customer-assignments/requests/:requestId/accept',
    REJECT_REQUEST: '/admin/customer-assignments/requests/:requestId/reject',
    GET_ALL_REQUESTS: '/admin/customer-assignments/requests/all',
  },
  // Automatic Bookings
  AUTOMATIC_BOOKINGS: {
    // Admin endpoints
    GET_ALL: '/automatic-bookings',
    CREATE: '/automatic-bookings/create',
    CREATE_DAILY: '/automatic-bookings/create-daily',
    ELIGIBLE_CUSTOMERS: '/automatic-bookings/eligible-customers',
    // Customer endpoints
    MY_UPCOMING: '/automatic-bookings/my-upcoming',
    MY_ASSIGNMENTS: '/automatic-bookings/my-assignments',
    ACCEPT: '/automatic-bookings/:bookingId/accept',
    REJECT: '/automatic-bookings/:bookingId/reject',
    CANCEL: '/automatic-bookings/:bookingId/cancel',
    GET_SETTINGS: '/automatic-bookings/settings/:customerId',
  },
  // Feedback
  FEEDBACK: {
    SUBMIT: '/feedback',
    MY_FEEDBACK: '/feedback/my-feedback',
    ELIGIBLE_BOOKINGS: '/feedback/eligible-bookings',
    BY_BOOKING: '/feedback/booking/:bookingId',
    ALL: '/feedback/all',
    STATS: '/feedback/stats',
    ADMIN_RESPONSE: '/feedback/:feedbackId/admin-response',
  },
  // Maids
  MAIDS: {
    AVAILABILITY: '/maids/availability'
  }
};

// HTTP Methods
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH'
}

// Request configuration
export interface ApiRequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  requiresAuth?: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Token management
export type AuthTokenStorage = 'local' | 'session';
export type AuthTokenType = 'jwt' | 'firebase';

const AUTH_TOKEN_EXPIRES_AT_KEY = 'authTokenExpiresAt';
const CSRF_TOKEN_STORAGE_KEY = 'csrfToken';
// IMPORTANT: Must match backend JWT expiration time! Backend uses '24h' in jwt.sign({ expiresIn: '24h' })
const DEFAULT_AUTH_TTL_DAYS = 1; // Changed from 30 days to 1 day to match JWT server-side TTL

const isExpired = (expiresAtRaw: string | null): boolean => {
  if (!expiresAtRaw) return false;
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt)) return false;
  return Date.now() > expiresAt;
};

// Decode JWT payload without verification (safe for non-sensitive claims like expiration)
const decodeJWT = (token: string): any | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Add padding if needed
    let payload = parts[1];
    const padding = (4 - (payload.length % 4)) % 4;
    payload += '='.repeat(padding);

    // Decode base64
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('🔐 Frontend Auth: Failed to decode JWT:', error);
    return null;
  }
};

// Check if JWT itself is expired (by checking the 'exp' claim)
const isJWTExpired = (token: string): boolean => {
  const payload = decodeJWT(token);
  if (!payload || typeof payload.exp !== 'number') return false;

  // exp is in seconds, Date.now() is in milliseconds
  const expiresAt = payload.exp * 1000;
  const isExpiredNow = Date.now() > expiresAt;

  if (isExpiredNow) {
    console.log('🔐 Frontend Auth: JWT is expired according to exp claim');
  }

  return isExpiredNow;
};

const removeAuthTokenFromStorage = (storage: Storage): void => {
  storage.removeItem('authToken');
  storage.removeItem('authTokenType');
  storage.removeItem(AUTH_TOKEN_EXPIRES_AT_KEY);
};

export const getAuthToken = (): string | null => {
  const localToken = localStorage.getItem('authToken');
  if (localToken) {
    const expiresAt = localStorage.getItem(AUTH_TOKEN_EXPIRES_AT_KEY);
    const expired = isExpired(expiresAt);
    const jwtExpired = isJWTExpired(localToken);

    // M1 FIX: Gate verbose token logs behind DEV mode.
    if (import.meta.env.DEV) {
      console.log('🔐 Frontend Auth: Local token found, app-level expired?', expired, 'JWT expired?', jwtExpired);
    }

    if (expired || jwtExpired) {
      if (import.meta.env.DEV) {
        console.log('🔐 Frontend Auth: Token expired (app-level or JWT), removing');
      }
      removeAuthTokenFromStorage(localStorage);
      return null;
    }
    return localToken;
  }

  const sessionToken = sessionStorage.getItem('authToken');
  if (sessionToken) {
    const expiresAt = sessionStorage.getItem(AUTH_TOKEN_EXPIRES_AT_KEY);
    const expired = isExpired(expiresAt);
    const jwtExpired = isJWTExpired(sessionToken);

    if (import.meta.env.DEV) {
      console.log('🔐 Frontend Auth: Session token found, app-level expired?', expired, 'JWT expired?', jwtExpired);
    }

    if (expired || jwtExpired) {
      if (import.meta.env.DEV) {
        console.log('🔐 Frontend Auth: Token expired (app-level or JWT), removing');
      }
      removeAuthTokenFromStorage(sessionStorage);
      return null;
    }
    return sessionToken;
  }

  // No token in any storage — silently return null (don't log in prod).
  return null;
};

export const getAuthTokenType = (): AuthTokenType | null => {
  // Keep tokenType consistent with whichever storage has the valid token
  const localToken = localStorage.getItem('authToken');
  if (localToken) {
    const expiresAt = localStorage.getItem(AUTH_TOKEN_EXPIRES_AT_KEY);
    if (isExpired(expiresAt)) {
      removeAuthTokenFromStorage(localStorage);
      return null;
    }
    const stored = localStorage.getItem('authTokenType');
    if (stored === 'jwt' || stored === 'firebase') return stored;
    return null;
  }

  const sessionToken = sessionStorage.getItem('authToken');
  if (sessionToken) {
    const expiresAt = sessionStorage.getItem(AUTH_TOKEN_EXPIRES_AT_KEY);
    if (isExpired(expiresAt)) {
      removeAuthTokenFromStorage(sessionStorage);
      return null;
    }
    const stored = sessionStorage.getItem('authTokenType');
    if (stored === 'jwt' || stored === 'firebase') return stored;
    return null;
  }

  const stored = localStorage.getItem('authTokenType') || sessionStorage.getItem('authTokenType');
  if (stored === 'jwt' || stored === 'firebase') return stored;
  return null;
};

export const setAuthToken = (
  token: string,
  storage: AuthTokenStorage = 'local',
  tokenType?: AuthTokenType
): void => {
  const target = storage === 'session' ? sessionStorage : localStorage;
  target.setItem('authToken', token);

  // Default: keep users signed-in for 30 days.
  // Note: Firebase ID tokens themselves expire sooner, but this TTL controls our app session storage.
  const expiresAt = Date.now() + DEFAULT_AUTH_TTL_DAYS * 24 * 60 * 60 * 1000;
  target.setItem(AUTH_TOKEN_EXPIRES_AT_KEY, String(expiresAt));

  if (tokenType) {
    target.setItem('authTokenType', tokenType);
  }
};

export const removeAuthToken = (): void => {
  removeAuthTokenFromStorage(localStorage);
  removeAuthTokenFromStorage(sessionStorage);
};

/** Read a non-HttpOnly cookie value by name. Returns null in SSR or if not found. */
const getCookieValue = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.split('; ').find(row => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
};

const getStoredCsrfToken = (): string | null => {
  try {
    return localStorage.getItem(CSRF_TOKEN_STORAGE_KEY) || getCookieValue('csrf-token');
  } catch {
    return getCookieValue('csrf-token');
  }
};

const setStoredCsrfToken = (token: string): void => {
  try {
    localStorage.setItem(CSRF_TOKEN_STORAGE_KEY, token);
  } catch {
    // Ignore storage failures; the token can still be reused from memory in this session.
  }
};

// Generic API request function
export const apiRequest = async <T = any>(
  endpoint: string,
  config: ApiRequestConfig = {}
): Promise<ApiResponse<T>> => {
  const {
    method = HttpMethod.GET,
    headers = {},
    body,
    requiresAuth = false
  } = config;

  const url = `${API_BASE_URL}${endpoint}`;

  const isFormDataBody = typeof FormData !== 'undefined' && body instanceof FormData;
  const isBlobBody = typeof Blob !== 'undefined' && body instanceof Blob;
  const isStringBody = typeof body === 'string';

  const hasContentTypeHeader = Object.keys(headers).some((k) => k.toLowerCase() === 'content-type');

  const requestHeaders: Record<string, string> = {
    ...headers
  };

  if (!hasContentTypeHeader && !isFormDataBody) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  // Add auth token if present in localStorage (Firebase or legacy JWT sessions).
  // For HttpOnly-cookie JWT auth the cookie is sent automatically via credentials: 'include'
  // below — no Authorization header is required.
  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
    // No token in localStorage → rely on HttpOnly cookie. Server returns 401 if invalid.
  }

  // M7: Attach CSRF token for state-changing requests (double-submit cookie pattern).
  // In production the frontend and backend are cross-origin, so the token is
  // cached from the backend's X-CSRF-Token response header rather than read
  // directly from a backend cookie.
  const csrfMethods: HttpMethod[] = [HttpMethod.POST, HttpMethod.PUT, HttpMethod.PATCH, HttpMethod.DELETE];
  if (csrfMethods.includes(method)) {
    const csrfToken = getStoredCsrfToken();
    if (csrfToken) {
      requestHeaders['X-CSRF-Token'] = csrfToken;
    }
  }

  const requestConfig: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: 'include', // M6: send HttpOnly auth cookie & receive Set-Cookie on login/logout
  };

  if (body && method !== HttpMethod.GET) {
    if (isFormDataBody || isBlobBody || isStringBody) {
      requestConfig.body = body as any;
    } else {
      requestConfig.body = JSON.stringify(body);
    }
  }

  // Only log in development mode
  if (import.meta.env.DEV) {
    console.log(`🚀 API Request: ${method} ${url}`);
    console.log('Request URL:', url);
    console.log('Request Headers:', requestHeaders);
  }

  try {
    const response = await fetch(url, requestConfig);

    // Handle different content types
    let data;
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();

      // Try to parse as JSON anyway
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text || 'Empty response' };
      }
    }

    const responseCsrfToken = response.headers.get('X-CSRF-Token') || response.headers.get('x-csrf-token');
    if (responseCsrfToken) {
      setStoredCsrfToken(responseCsrfToken);
    }

    if (!response.ok) {
      const errorMessage = data.error || data.message || `HTTP ${response.status}: ${response.statusText}`;
      // Only log non-404 errors to reduce console spam
      if (response.status !== 404) {
        console.error(`❌ API Error:`, errorMessage);
      }

      // F3 FIX: Global 401 interceptor — ends "zombie sessions".
      //
      // Before: when the HttpOnly cookie expired, every API call silently
      // failed with 401 while the dashboard kept rendering from localStorage.
      // Users were stuck in a loop: logged-in UI, failing API calls.
      //
      // After: any 401 fires a 'auth:unauthorized' CustomEvent on window.
      // UserContext listens for this event and triggers a full logout +
      // redirect to /login, giving the user a clean session.
      //
      // We use a CustomEvent rather than calling logout() directly here
      // because api.ts has no access to React context or React Router.
      // The event bus decouples the HTTP layer from the auth layer.
      if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('auth:unauthorized', {
          detail: { endpoint, message: errorMessage }
        }));
      }

      throw new ApiError(
        errorMessage,
        response.status,
        data
      );
    }

    // Check if response has success field (auth endpoints), otherwise wrap raw data
    if (data && typeof data === 'object' && 'success' in data) {
      // Already wrapped response (from auth endpoints)
      return data;
    } else {
      // Raw response data - wrap it
      return {
        success: true,
        message: 'Request successful',
        data: data
      };
    }
  } catch (error) {
    console.error('🔥 API Request Failed:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors (including CORS)
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('🚫 Network Error - Possible CORS issue or backend not running');
      console.error('Current API_BASE_URL:', API_BASE_URL);
      console.error('Frontend running on:', window.location.origin);

      throw new ApiError(
        `Unable to connect to server. Please check:\n1. Backend is reachable at ${BACKEND_ORIGIN}\n2. Frontend is running on ${window.location.origin}\n3. CORS is properly configured\n\nCurrent API URL: ${API_BASE_URL}`,
        0,
        {
          originalError: error.message,
          apiBaseUrl: API_BASE_URL,
          backendOrigin: BACKEND_ORIGIN,
          frontendOrigin: window.location.origin
        }
      );
    }

    throw new ApiError(
      error instanceof Error ? error.message : 'Network error occurred',
      500,
      { originalError: error }
    );
  }
};
