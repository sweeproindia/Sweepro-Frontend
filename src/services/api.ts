// API Configuration
export const API_BASE_URL = 'http://localhost:3000/api';

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

  console.log(`🚀 API Request: ${method} ${url}`);
  console.log('Request config:', requestConfig);

  try {
    const response = await fetch(url, requestConfig);
    
    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    // Handle different content types
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.log('Non-JSON response:', text);
      
      // Try to parse as JSON anyway
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text || 'Empty response' };
      }
    }
    
    console.log('Response data:', data);

    if (!response.ok) {
      const errorMessage = data.message || `HTTP ${response.status}: ${response.statusText}`;
      console.error(`❌ API Error:`, errorMessage);
      throw new ApiError(
        errorMessage,
        response.status,
        data
      );
    }

    // Check if response has success field (auth endpoints), otherwise wrap raw data
    if (data && typeof data === 'object' && 'success' in data) {
      // Already wrapped response (from auth endpoints)
      console.log('✅ API Success:', data.message);
      return data;
    } else {
      // Raw response data - wrap it
      console.log('✅ API Success: Request completed');
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
      throw new ApiError(
        'Unable to connect to server. Please check if the backend is running on http://localhost:3000',
        0,
        { originalError: error.message }
      );
    }
    
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error occurred',
      500,
      { originalError: error }
    );
  }
};
