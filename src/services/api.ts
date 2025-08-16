// API Configuration
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
  // Bookings
  BOOKINGS: {
    CREATE: '/bookings',
    MY_BOOKINGS: '/bookings/my-bookings',
    MY_ASSIGNMENTS: '/bookings/my-assignments',
    UPDATE_STATUS: '/bookings/:id/status',
    COMPLETE_PAYMENT: '/bookings/complete-payment',
  },
  // Subscriptions
  SUBSCRIPTIONS: {
    PLANS: '/subscriptions/plans',
    SUBSCRIBE: '/subscriptions/subscribe',
    MY_SUBSCRIPTION: '/subscriptions/my-subscription',
    STATUS: '/subscriptions/status',
    CONFIRM_SERVICE: '/subscriptions/confirm-service',
    COMPLETE_PAYMENT: '/subscriptions/complete-payment',
    CANCEL: '/subscriptions/cancel',
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

  try {
    const response = await fetch(url, requestConfig);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || `HTTP ${response.status}: ${response.statusText}`,
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
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error occurred',
      500
    );
  }
};
