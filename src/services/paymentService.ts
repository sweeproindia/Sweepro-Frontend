import { apiRequest, API_ENDPOINTS, HttpMethod, ApiResponse } from './api';

// Types for payment
export interface PaymentData {
  bookingId?: string;
  subscriptionId?: string;
  amount: number;
  paymentMethod: 'RAZORPAY' | 'STRIPE' | 'PAYPAL' | 'WALLET';
  currency: string;
  description?: string;
}

export interface Payment {
  id: string;
  customerId: string;
  bookingId?: string;
  subscriptionId?: string;
  amount: number;
  discount: number;
  tax: number;
  finalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  paymentMethod: 'CARD' | 'UPI' | 'NET_BANKING' | 'WALLET' | 'CASH' | 'BANK_TRANSFER';
  gateway?: string;
  transactionId?: string;
  gatewayResponse?: any;
  paymentType: 'BOOKING' | 'SUBSCRIPTION' | 'RENEWAL';
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  // Relations from backend
  customer?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role?: string;
    status?: string;
  };
  booking?: {
    id: string;
    customerId: string;
    serviceId: string;
    status: string;
    scheduledAt: string;
    serviceAddress: string;
    totalAmount: number;
    finalAmount: number;
    service?: {
      id: string;
      name: string;
      description: string;
      category: string;
    };
  };
  subscription?: {
    id: string;
    customerId: string;
    planId: string;
    status: string;
    amount: number;
    startDate: string;
    endDate: string;
  };
}

export interface RazorpayOrderData {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
}

export interface RazorpayPaymentData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  bookingId?: string;
  subscriptionId?: string;
}

export interface PaymentFailureData {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata?: any;
  };
  razorpay_order_id: string;
  razorpay_payment_id?: string;
}

export interface RefundData {
  paymentId: string;
  amount?: number;
  reason: string;
}

export class PaymentService {
  private static razorpayScriptPromise: Promise<void> | null = null;

  static async loadRazorpaySdk(): Promise<void> {
    if ((window as any).Razorpay) return;
    if (!this.razorpayScriptPromise) {
      this.razorpayScriptPromise = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
        document.body.appendChild(script);
      });
    }
    await this.razorpayScriptPromise;
  }
  /**
   * Create a payment
   */
  static async createPayment(paymentData: PaymentData): Promise<ApiResponse<{ payment: Payment }>> {
    try {
      return await apiRequest<{ payment: Payment }>(API_ENDPOINTS.PAYMENTS.CREATE, {
        method: HttpMethod.POST,
        body: paymentData,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Create payment error:', error);
      throw error;
    }
  }

  /**
   * Get user's payment history
   */
  static async getUserPayments(): Promise<ApiResponse<{ payments: Payment[] }>> {
    try {
      return await apiRequest<{ payments: Payment[] }>(API_ENDPOINTS.PAYMENTS.MY_PAYMENTS, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get user payments error:', error);
      throw error;
    }
  }

  /**
   * Verify payment
   */
  static async verifyPayment(paymentId: string): Promise<ApiResponse<{ payment: Payment, isValid: boolean }>> {
    try {
      return await apiRequest<{ payment: Payment, isValid: boolean }>(API_ENDPOINTS.PAYMENTS.VERIFY, {
        method: HttpMethod.POST,
        body: { paymentId },
        requiresAuth: true
      });
    } catch (error) {
      console.error('Verify payment error:', error);
      throw error;
    }
  }

  /**
   * Create Razorpay order for booking
   */
  static async createRazorpayBookingOrder(bookingId: string, amount: number, currency: string = 'INR'): Promise<ApiResponse<RazorpayOrderData>> {
    try {
      const res = await apiRequest<any>(API_ENDPOINTS.PAYMENTS.RAZORPAY.BOOKING_ORDER, {
        method: HttpMethod.POST,
        body: { bookingId, amount, currency },
        requiresAuth: true
      });
      const response: any = res;
      const order = response.order || response.data?.order;
      const key = response.key || response.data?.key;
      return {
        success: true,
        message: 'Order created',
        data: {
          orderId: order?.id,
          amount: order?.amount,
          currency: order?.currency,
          key
        }
      };
    } catch (error) {
      console.error('Create Razorpay booking order error:', error);
      throw error;
    }
  }

  /**
   * Create Razorpay order for subscription
   * @param subscriptionId - The subscription ID
   * @param amount - Amount to charge
   * @param currency - Currency code (default: INR)
   */
  static async createRazorpaySubscriptionOrder(subscriptionId: string, amount: number, currency: string = 'INR'): Promise<ApiResponse<RazorpayOrderData>> {
    try {
      // Note: Backend handles the paise conversion if needed
      console.log('🔵 Creating Razorpay subscription order:', {
        subscriptionId,
        amount,
        currency
      });
      
      const res = await apiRequest<any>(API_ENDPOINTS.PAYMENTS.RAZORPAY.SUBSCRIPTION_ORDER, {
        method: HttpMethod.POST,
        body: { subscriptionId, amount, currency },
        requiresAuth: true
      });
      
      console.log('✅ Razorpay order response:', res);
      
      const response: any = res;
      const order = response.order || response.data?.order;
      const key = response.key || response.data?.key;
      
      if (!order || !order.id) {
        console.error('❌ Invalid order response - missing order or order.id:', response);
        throw new Error('Invalid order response from server - no order ID received');
      }
      
      return {
        success: true,
        message: 'Order created',
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          key
        }
      };
    } catch (error: any) {
      console.error('❌ Create Razorpay subscription order error:', error);
      console.error('Error details:', {
        message: error?.message,
        statusCode: error?.statusCode,
        response: error?.response
      });
      throw error;
    }
  }

  /**
   * Verify Razorpay payment
   */
  static async verifyRazorpayPayment(paymentData: RazorpayPaymentData): Promise<ApiResponse<{ payment: Payment, booking?: any, subscription?: any }>> {
    try {
      return await apiRequest<{ payment: Payment, booking?: any, subscription?: any }>(API_ENDPOINTS.PAYMENTS.RAZORPAY.VERIFY, {
        method: HttpMethod.POST,
        body: paymentData,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Verify Razorpay payment error:', error);
      throw error;
    }
  }

  /**
   * Handle Razorpay payment failure
   */
  static async handleRazorpayFailure(failureData: PaymentFailureData): Promise<ApiResponse<{ payment: Payment }>> {
    try {
      return await apiRequest<{ payment: Payment }>(API_ENDPOINTS.PAYMENTS.RAZORPAY.FAILURE, {
        method: HttpMethod.POST,
        body: failureData,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Handle Razorpay failure error:', error);
      throw error;
    }
  }

  /**
   * Get payment status by Razorpay payment ID
   */
  static async getRazorpayPaymentStatus(razorpayPaymentId: string): Promise<ApiResponse<{ payment: Payment, status: string }>> {
    try {
      const endpoint = API_ENDPOINTS.PAYMENTS.RAZORPAY.STATUS.replace(':razorpayPaymentId', razorpayPaymentId);
      return await apiRequest<{ payment: Payment, status: string }>(endpoint, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get Razorpay payment status error:', error);
      throw error;
    }
  }

  /**
   * Process refund
   */
  static async processRefund(refundData: RefundData): Promise<ApiResponse<{ refund: any, payment: Payment }>> {
    try {
      return await apiRequest<{ refund: any, payment: Payment }>(`/payments/${refundData.paymentId}/refund`, {
        method: HttpMethod.POST,
        body: { amount: refundData.amount, reason: refundData.reason },
        requiresAuth: true
      });
    } catch (error) {
      console.error('Process refund error:', error);
      throw error;
    }
  }

  /**
   * Get payment by ID
   */
  static async getPaymentById(paymentId: string): Promise<ApiResponse<{ payment: Payment }>> {
    try {
      return await apiRequest<{ payment: Payment }>(`/payments/${paymentId}`, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get payment by ID error:', error);
      throw error;
    }
  }

  /**
   * Get payment statistics
   */
  static async getPaymentStats(): Promise<ApiResponse<{ stats: any }>> {
    try {
      return await apiRequest<{ stats: any }>('/payments/stats', {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get payment stats error:', error);
      throw error;
    }
  }

  /**
   * Download payment receipt
   */
  static async downloadReceipt(paymentId: string): Promise<ApiResponse<{ receiptUrl: string }>> {
    try {
      return await apiRequest<{ receiptUrl: string }>(`/payments/${paymentId}/receipt`, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Download receipt error:', error);
      throw error;
    }
  }

  /**
   * Update payment status (admin only)
   */
  static async updatePaymentStatus(paymentId: string, status: string, reason?: string): Promise<ApiResponse<{ payment: Payment }>> {
    try {
      return await apiRequest<{ payment: Payment }>(`/payments/${paymentId}/status`, {
        method: HttpMethod.PUT,
        body: { status, reason },
        requiresAuth: true
      });
    } catch (error) {
      console.error('Update payment status error:', error);
      throw error;
    }
  }

  /**
   * Get payment methods
   */
  static async getPaymentMethods(): Promise<ApiResponse<{ methods: string[] }>> {
    try {
      return await apiRequest<{ methods: string[] }>('/payments/methods', {
        method: HttpMethod.GET,
        requiresAuth: false
      });
    } catch (error) {
      console.error('Get payment methods error:', error);
      throw error;
    }
  }

  /**
   * Check payment gateway status
   */
  static async checkGatewayStatus(): Promise<ApiResponse<{ status: string, gateways: any[] }>> {
    try {
      return await apiRequest<{ status: string, gateways: any[] }>('/payments/gateway-status', {
        method: HttpMethod.GET,
        requiresAuth: false
      });
    } catch (error) {
      console.error('Check gateway status error:', error);
      throw error;
    }
  }

  /**
   * Initiate Razorpay payment
   */
  static initializeRazorpayPayment(options: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.loadRazorpaySdk();
      } catch (e) {
        reject(e);
        return;
      }

      const userModal = options?.modal || {};
      const rzp = new window.Razorpay({
        ...options,
        handler: (response: any) => {
          resolve(response);
        },
        modal: {
          ...userModal,
          ondismiss: () => {
            try {
              if (typeof userModal.ondismiss === 'function') userModal.ondismiss();
            } finally {
              reject(new Error('Payment cancelled by user'));
            }
          }
        }
      });

      rzp.open();
    });
  }
}

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}
