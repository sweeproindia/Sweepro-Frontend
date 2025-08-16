import { apiRequest, API_ENDPOINTS, HttpMethod, ApiResponse } from './api';
import { Payment } from './paymentService';

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

export interface SubscribeData {
  planId: string;
  paymentMethod?: string;
  autoRenewal?: boolean;
  startDate?: string;
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
   * Confirm next day service
   */
  static async confirmNextDayService(confirmationData: { date: string, timeSlot: string }): Promise<ApiResponse<{ booking: any }>> {
    try {
      return await apiRequest<{ booking: any }>(API_ENDPOINTS.SUBSCRIPTIONS.CONFIRM_SERVICE, {
        method: HttpMethod.POST,
        body: confirmationData,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Confirm next day service error:', error);
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
