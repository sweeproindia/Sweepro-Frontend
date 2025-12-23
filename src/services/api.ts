// API Configuration - Use proxy in development, direct URL in production
export const API_BASE_URL = 'https://sweep-pro-backend-testing.onrender.com/api';

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
    MAID_QR_CODE: '/booking-completion/maid/qr-code',
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
    ALL: '/admin/verifications',
    BY_ID: '/admin/verifications/:id',
    APPROVE: '/admin/verifications/:id/approve',
    REJECT: '/admin/verifications/:id/reject',
    STATS: '/admin/verifications/stats',
    // Maid endpoints
    SUBMIT: '/maids/verification/submit',
    MY_STATUS: '/maids/verification/status',
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
    CANCEL: '/assignments/admin/assignments/:id/cancel',
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
    GET_ALL: '/admin/automatic-bookings',
    PENDING_ASSIGNMENT: '/admin/automatic-bookings/pending-assignment',
    REASSIGNMENT: '/admin/automatic-bookings/reassignment',
    SEND_TO_MAID: '/admin/automatic-bookings/:bookingId/send-to-maid',
    REASSIGN: '/admin/automatic-bookings/:bookingId/reassign',
    SCHEDULE_OVERVIEW: '/admin/automatic-bookings/schedule-overview',
    PAUSE: '/admin/automatic-bookings/:customerId/pause',
    RESUME: '/admin/automatic-bookings/:customerId/resume',
    SETTINGS: '/admin/automatic-bookings/settings/:customerId',
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
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
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

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers
  };

  // Add auth token if required
  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const requestConfig: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body && method !== HttpMethod.GET) {
    requestConfig.body = JSON.stringify(body);
  }

  // Only log in development mode
  if (process.env.NODE_ENV === 'development') {
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
        `Unable to connect to server. Please check:\n1. Backend is running on http://localhost:3000\n2. Frontend is running on http://localhost:8080\n3. CORS is properly configured\n\nCurrent API URL: ${API_BASE_URL}`,
        0,
        { 
          originalError: error.message,
          apiBaseUrl: API_BASE_URL,
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
