import { apiRequest, API_ENDPOINTS, HttpMethod, ApiResponse } from './api';
import { Payment } from './paymentService';
import { AuthService } from './authService';

// Types for subscription
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  serviceId: string;
  sessionsPerWeek: number;
  sessionsPerMonth: number;
  duration: number; // in months
  basePrice: number;
  discountPercent: number;
  finalPrice: number;
  isActive: boolean;
  isPopular: boolean;
  bufferDaysAllowed?: number;
  hasBufferSystem?: boolean;
  createdAt?: string;
  updatedAt?: string;
  service?: {
    id: string;
    name: string;
    description: string;
    category: 'CLEANING' | 'DEEP_CLEANING' | 'MAINTENANCE' | 'SPECIAL_EVENT';
    baseDuration: number;
    basePrice: number;
    isActive: boolean;
    bufferTime?: number;
    maxDailyBookings?: number;
    isSubscriptionService: boolean;
  };
}

export interface Subscription {
  id: string;
  customerId: string;
  planId: string;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'SUSPENDED' | 'PENDING_PAYMENT';
  startDate: string;
  endDate: string;
  billingCycle: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  amount: number;
  discount: number;
  autoRenew: boolean;
  nextBillDate?: string;
  // New buffer period fields
  currentCycleStart?: string;
  currentCycleEnd?: string;
  bufferDaysCount?: number;
  bufferDaysUsed?: number;
  isInBufferPeriod?: boolean;
  bufferStartDate?: string;
  bufferEndDate?: string;
  isPaused?: boolean;
  pausedAt?: string;
  resumeAt?: string;
  pauseReason?: string;
  totalCycles?: number;
  completedCycles?: number;
  lastRenewalDate?: string;
  createdAt: string;
  updatedAt: string;
  plan?: {
    id: string;
    name: string;
    description: string;
    serviceId: string;
    sessionsPerWeek: number;
    sessionsPerMonth: number;
    duration: number;
    basePrice: number;
    discountPercent: number;
    finalPrice: number;
    isActive: boolean;
    isPopular: boolean;
    bufferDaysAllowed?: number;
    hasBufferSystem?: boolean;
    service?: {
      id: string;
      name: string;
      description: string;
      category: string;
      baseDuration: number;
      basePrice: number;
      isActive: boolean;
      isSubscriptionService: boolean;
    };
    createdAt?: string;
    updatedAt?: string;
  };
  customer?: {
    id: string;
    userId: string;
    user?: {
      id: string;
      name: string;
      email: string;
      phone: string;
      address?: string;
      role: string;
      status: string;
    };
    preferences?: any;
    emergencyContact?: string;
    specialInstructions?: string;
  };
  payments?: Payment[];
}

// New interfaces for monthly buffer system
export interface SubscriptionCycle {
  id: string;
  subscriptionId: string;
  cycleNumber: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED' | 'IN_BUFFER' | 'PAUSED';
  totalServices: number;
  completedServices: number;
  skippedServices: number;
  bufferDaysUsed: number;
  isBufferActive: boolean;
  bufferStartDate?: string;
  bufferEndDate?: string;
  renewalDate?: string;
  paymentStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BufferPeriod {
  id: string;
  subscriptionId: string;
  cycleId?: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  reason: 'END_OF_MONTH' | 'CUSTOMER_REQUEST' | 'ADMIN_PAUSE' | 'PAYMENT_ISSUE' | 'MAINTENANCE' | 'EMERGENCY';
  daysCount: number;
  servicesSkipped: number;
  autoResumeDate: string;
  resumedAt?: string;
  isAutomatic: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlySubscriptionStatus {
  success: boolean;
  hasActiveSubscription: boolean;
  subscription?: Subscription & {
    plan: SubscriptionPlan & {
      service: any;
    };
  };
  currentCycle?: SubscriptionCycle;
  activeBuffer?: BufferPeriod;
  daysUntilBuffer?: number;
  upcomingBookings?: any[];
  summary?: {
    servicesThisMonth: number;
    bufferPeriodActive: boolean;
    nextBufferStart?: string;
    cycleProgress: number;
  };
}

export interface DashboardData {
  success: boolean;
  hasActiveSubscription: boolean;
  subscription?: Subscription;
  currentCycle?: SubscriptionCycle;
  activeBuffer?: BufferPeriod;
  summary?: {
    servicesThisMonth: number;
    bufferPeriodActive: boolean;
    nextBufferStart?: string;
    cycleProgress: number;
  };
  serviceStats?: {
    totalBookings: number;
    completedServices: number;
    upcomingServices: number;
    servicesThisMonth: number;
  };
  recentBookings?: any[];
  upcomingBookings?: any[];
  paymentHistory?: any[];
  nextPayment?: {
    date: string;
    amount: number;
    daysUntilDue: number;
  };
}

export interface MonthlyCalendarData {
  success: boolean;
  month: {
    year: number;
    month: number;
    name: string;
  };
  calendarData: {
    date: string;
    dayOfWeek: string;
    bookings: {
      id: string;
      serviceName: string;
      status: string;
      scheduledTime: string;
      maidName?: string;
      duration: number;
      isSubscriptionBased: boolean;
      isBufferSkipped: boolean;
    }[];
    isInBufferPeriod: boolean;
    bufferReason?: string;
  }[];
  monthSummary: {
    totalBookings: number;
    completedServices: number;
    upcomingServices: number;
    cancelledServices: number;
    bufferDays: number;
  };
  bufferPeriods: {
    id: string;
    startDate: string;
    endDate: string;
    reason: string;
    daysCount: number;
    status: string;
  }[];
}

export interface SubscribeData {
  planId: string;
  paymentMethod?: string;
  autoRenewal?: boolean;
  startDate?: string;
  planDuration?: '1month' | '3month' | '6month' | null;
  finalAmount?: number;
  serviceDetails?: {
    timeSlot?: string;
    frequency?: string;
    propertyType?: 'apartment' | 'bungalow';
    bhkType?: '2bhk' | '3bhk' | '4bhk' | null;
    squareFeet?: number;
    planDuration?: '1month' | '3month' | '6month' | null;
    address?: {
      full?: string;
      pincode?: string;
      locality?: string;
      addressLine?: string;
      city?: string;
      state?: string;
      landmark?: string;
      coordinates?: {
        latitude?: number;
        longitude?: number;
      };
    };
  };
}

export interface SubscriptionPaymentData {
  subscriptionId: string;
  paymentMethod: string;
  amount: number;
}

export class SubscriptionService {
  /**
   * Get all available subscription plans
   */
  static async getSubscriptionPlans(): Promise<ApiResponse<{ plans: SubscriptionPlan[] }>> {
    try {
      return await apiRequest<{ plans: SubscriptionPlan[] }>(API_ENDPOINTS.SUBSCRIPTIONS.PLANS, {
        method: HttpMethod.GET,
        requiresAuth: false
      });
    } catch (error) {
      console.error('Get subscription plans error:', error);
      throw error;
    }
  }

  /**
   * Subscribe to a plan
   */
  static async subscribeToPlan(subscribeData: SubscribeData): Promise<ApiResponse<{ subscription: Subscription }>> {
    try {
      return await apiRequest<{ subscription: Subscription }>(API_ENDPOINTS.SUBSCRIPTIONS.SUBSCRIBE, {
        method: HttpMethod.POST,
        body: subscribeData,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Subscribe to plan error:', error);
      throw error;
    }
  }

  /**
   * Get user's current subscription
   */
  static async getUserSubscription(): Promise<ApiResponse<{ subscription: Subscription }>> {
    try {
      const user = AuthService.getStoredUser();
      if (user && user.role !== 'CUSTOMER') {
        return {
          success: false,
          message: 'Subscription is only available for customer accounts'
        } as ApiResponse<{ subscription: Subscription }>;
      }
      return await apiRequest<{ subscription: Subscription }>(API_ENDPOINTS.SUBSCRIPTIONS.MY_SUBSCRIPTION, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get user subscription error:', error);
      throw error;
    }
  }

  /**
   * Check subscription status
   */
  static async checkSubscriptionStatus(): Promise<ApiResponse<{ subscription: Subscription, isValid: boolean }>> {
    try {
      return await apiRequest<{ subscription: Subscription, isValid: boolean }>(API_ENDPOINTS.SUBSCRIPTIONS.STATUS, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Check subscription status error:', error);
      throw error;
    }
  }

  /**
   * Get monthly subscription status with buffer information
   */
  static async getMonthlySubscriptionStatus(): Promise<ApiResponse<MonthlySubscriptionStatus>> {
    try {
      return await apiRequest<MonthlySubscriptionStatus>(API_ENDPOINTS.SUBSCRIPTIONS.MONTHLY_STATUS, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get monthly subscription status error:', error);
      throw error;
    }
  }

  /**
   * Start buffer period manually
   */
  static async startBufferPeriod(reason?: string): Promise<ApiResponse<{ bufferPeriod: BufferPeriod }>> {
    try {
      return await apiRequest<{ bufferPeriod: BufferPeriod }>(API_ENDPOINTS.SUBSCRIPTIONS.BUFFER_START, {
        method: HttpMethod.POST,
        body: { reason: reason || 'CUSTOMER_REQUEST' },
        requiresAuth: true
      });
    } catch (error) {
      console.error('Start buffer period error:', error);
      throw error;
    }
  }

  /**
   * End buffer period manually
   */
  static async endBufferPeriod(): Promise<ApiResponse<{ subscription: Subscription }>> {
    try {
      return await apiRequest<{ subscription: Subscription }>(API_ENDPOINTS.SUBSCRIPTIONS.BUFFER_END, {
        method: HttpMethod.POST,
        requiresAuth: true
      });
    } catch (error) {
      console.error('End buffer period error:', error);
      throw error;
    }
  }

  /**
   * Get subscription dashboard data
   */
  static async getSubscriptionDashboard(): Promise<ApiResponse<DashboardData>> {
    try {
      return await apiRequest<DashboardData>(API_ENDPOINTS.DASHBOARD.MAIN, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get subscription dashboard error:', error);
      throw error;
    }
  }

  /**
   * Get monthly service calendar
   */
  static async getMonthlyServiceCalendar(year?: number, month?: number): Promise<ApiResponse<MonthlyCalendarData>> {
    try {
      const params = new URLSearchParams();
      if (year) params.append('year', year.toString());
      if (month) params.append('month', month.toString());

      const endpoint = params.toString() ?
        `${API_ENDPOINTS.DASHBOARD.CALENDAR}?${params.toString()}` :
        API_ENDPOINTS.DASHBOARD.CALENDAR;

      return await apiRequest<MonthlyCalendarData>(endpoint, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get monthly calendar error:', error);
      throw error;
    }
  }

  /**
   * Get buffer period history
   */
  static async getBufferPeriodHistory(page = 1, limit = 10): Promise<ApiResponse<{ data: BufferPeriod[], pagination: any }>> {
    try {
      return await apiRequest<{ data: BufferPeriod[], pagination: any }>(
        `${API_ENDPOINTS.DASHBOARD.BUFFER_HISTORY}?page=${page}&limit=${limit}`, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get buffer period history error:', error);
      throw error;
    }
  }

  /**
   * Get subscription cycle history
   */
  static async getSubscriptionCycleHistory(page = 1, limit = 10): Promise<ApiResponse<{ data: SubscriptionCycle[], pagination: any }>> {
    try {
      return await apiRequest<{ data: SubscriptionCycle[], pagination: any }>(
        `${API_ENDPOINTS.DASHBOARD.CYCLE_HISTORY}?page=${page}&limit=${limit}`, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get subscription cycle history error:', error);
      throw error;
    }
  }

  /**
   * Get service preferences and history
   */
  static async getServicePreferences(): Promise<ApiResponse<any>> {
    try {
      return await apiRequest<any>(API_ENDPOINTS.DASHBOARD.PREFERENCES, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get service preferences error:', error);
      throw error;
    }
  }

  /**
   * Complete subscription payment
   */
  static async completeSubscriptionPayment(paymentData: SubscriptionPaymentData): Promise<ApiResponse<{ subscription: Subscription, payment: any }>> {
    try {
      return await apiRequest<{ subscription: Subscription, payment: any }>(API_ENDPOINTS.SUBSCRIPTIONS.COMPLETE_PAYMENT, {
        method: HttpMethod.POST,
        body: paymentData,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Complete subscription payment error:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(reason?: string): Promise<ApiResponse<{ subscription: Subscription }>> {
    try {
      return await apiRequest<{ subscription: Subscription }>(API_ENDPOINTS.SUBSCRIPTIONS.CANCEL, {
        method: HttpMethod.POST,
        body: { reason },
        requiresAuth: true
      });
    } catch (error) {
      console.error('Cancel subscription error:', error);
      throw error;
    }
  }

  /**
   * Renew subscription
   */
  static async renewSubscription(planId?: string): Promise<ApiResponse<{ subscription: Subscription }>> {
    try {
      return await apiRequest<{ subscription: Subscription }>('/subscriptions/renew', {
        method: HttpMethod.POST,
        body: { planId },
        requiresAuth: true
      });
    } catch (error) {
      console.error('Renew subscription error:', error);
      throw error;
    }
  }

  /**
   * Update subscription settings
   */
  static async updateSubscriptionSettings(settings: { autoRenewal: boolean }): Promise<ApiResponse<{ subscription: Subscription }>> {
    try {
      return await apiRequest<{ subscription: Subscription }>('/subscriptions/settings', {
        method: HttpMethod.PUT,
        body: settings,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Update subscription settings error:', error);
      throw error;
    }
  }

  /**
   * Get subscription history
   */
  static async getSubscriptionHistory(): Promise<ApiResponse<{ subscriptions: Subscription[] }>> {
    try {
      return await apiRequest<{ subscriptions: Subscription[] }>('/subscriptions/history', {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get subscription history error:', error);
      throw error;
    }
  }

  /**
   * Pause subscription
   */
  static async pauseSubscription(pauseData: { startDate: string, endDate: string, reason?: string }): Promise<ApiResponse<{ subscription: Subscription }>> {
    try {
      return await apiRequest<{ subscription: Subscription }>('/subscriptions/pause', {
        method: HttpMethod.POST,
        body: pauseData,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Pause subscription error:', error);
      throw error;
    }
  }

  /**
   * Resume subscription
   */
  static async resumeSubscription(): Promise<ApiResponse<{ subscription: Subscription }>> {
    try {
      return await apiRequest<{ subscription: Subscription }>('/subscriptions/resume', {
        method: HttpMethod.POST,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Resume subscription error:', error);
      throw error;
    }
  }

  /**
   * Get upcoming services
   */
  static async getUpcomingServices(): Promise<ApiResponse<{ services: any[] }>> {
    try {
      return await apiRequest<{ services: any[] }>('/subscriptions/upcoming-services', {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get upcoming services error:', error);
      throw error;
    }
  }

  /**
   * Check if plan can be upgraded/downgraded
   */
  static async getAvailableUpgrades(currentPlanId: string): Promise<ApiResponse<{ upgrades: SubscriptionPlan[], downgrades: SubscriptionPlan[] }>> {
    try {
      return await apiRequest<{ upgrades: SubscriptionPlan[], downgrades: SubscriptionPlan[] }>(`/subscriptions/available-upgrades/${currentPlanId}`, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get available upgrades error:', error);
      throw error;
    }
  }
}
