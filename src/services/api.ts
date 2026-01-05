// API Configuration - Use local backend in development, deployed URL in production
const DEFAULT_PROD_API_BASE_URL = 'https://sweep-pro-backend-testing.onrender.com/api';

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
    ME: '/auth/me',
  },
  // User
  USER: {
    PROFILE: '/users/profile',
    UPDATE: '/users/update',
  },
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
    MAID_QR_CODE: '/booking-completion/:bookingId/qr-code',
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
  // Automatic Assignments
  AUTOMATIC_ASSIGNMENTS: {
    // Admin endpoints
    PROCESS: '/automatic-assignments/process',
    UPCOMING: '/automatic-assignments/upcoming',
    STATISTICS: '/automatic-assignments/statistics',
    CUSTOMER_TIMESLOTS: '/automatic-assignments/customer-timeslots',
    TEST_TIMESLOT: '/automatic-assignments/test-timeslot',
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

export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

export const setAuthToken = (token: string, storage: AuthTokenStorage = 'local'): void => {
  const target = storage === 'session' ? sessionStorage : localStorage;
  target.setItem('authToken', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('authToken');
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

  // Add auth token if required
  if (requiresAuth) {
    const token = getAuthToken();
    if (!token) {
      throw new ApiError('Authentication token not found. Please log in again.', 401, {
        missingToken: true
      });
    }
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const requestConfig: RequestInit = {
    method,
    headers: requestHeaders,
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

    if (!response.ok) {
      const errorMessage = data.message || `HTTP ${response.status}: ${response.statusText}`;
      // Only log non-404 errors to reduce console spam
      if (response.status !== 404) {
        console.error(`❌ API Error:`, errorMessage);
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
