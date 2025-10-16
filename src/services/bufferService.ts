import { apiRequest, HttpMethod, ApiResponse } from './api';

export interface BufferPeriod {
  id: string;
  subscriptionId: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  reason: string;
  daysCount: number;
  servicesSkipped: number;
  autoResumeDate: string;
  isAutomatic: boolean;
  notes?: string;
  adminNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  // Populated subscription data for admin views
  subscription?: {
    id: string;
    customer?: {
      user?: {
        name: string;
        email: string;
      };
    };
    plan?: {
      name: string;
    };
  };
}

export interface BufferInfo {
  total: number;
  used: number;
  remaining: number;
  resetDate: string;
}

export interface BufferRequest {
  daysCount: number;
  startDate: string;
  reason: string;
  notes?: string;
}

export interface BufferStatistics {
  pendingRequests: number;
  activeBuffers: number;
  thisMonthRequests: number;
  totalBufferDaysUsed: number;
  mostBufferUsage?: {
    customerName: string;
    planName: string;
    bufferDaysUsed: number;
    bufferDaysTotal: number;
  };
}

export class BufferService {
  /**
   * Get remaining buffer days for a subscription
   */
  static async getRemainingBufferDays(subscriptionId: string): Promise<ApiResponse<BufferInfo>> {
    return apiRequest(`/buffer/subscription/${subscriptionId}/remaining`, {
      method: HttpMethod.GET,
      requiresAuth: true
    });
  }

  /**
   * Request buffer days for a subscription
   */
  static async requestBufferDays(subscriptionId: string, request: BufferRequest): Promise<ApiResponse<{ bufferPeriod: BufferPeriod }>> {
    return apiRequest(`/buffer/subscription/${subscriptionId}/request`, {
      method: HttpMethod.POST,
      body: request,
      requiresAuth: true
    });
  }

  /**
   * Get customer's buffer history
   */
  static async getCustomerBufferHistory(subscriptionId: string, page = 1, limit = 10): Promise<ApiResponse<{ history: BufferPeriod[]; pagination: any }>> {
    return apiRequest(`/buffer/subscription/${subscriptionId}/history?page=${page}&limit=${limit}`, {
      method: HttpMethod.GET,
      requiresAuth: true
    });
  }

  /**
   * Get pending buffer requests (admin)
   */
  static async getPendingBufferRequests(page = 1, limit = 20): Promise<ApiResponse<{ requests: BufferPeriod[]; pagination: any }>> {
    return apiRequest(`/buffer/admin/pending?page=${page}&limit=${limit}`, {
      method: HttpMethod.GET,
      requiresAuth: true
    });
  }

  /**
   * Approve buffer request (admin)
   */
  static async approveBufferRequest(bufferPeriodId: string, adminNotes?: string): Promise<ApiResponse<any>> {
    console.log('🚀 BufferService.approveBufferRequest called with:', { bufferPeriodId, adminNotes });
    
    const endpoint = `/buffer/admin/${bufferPeriodId}/approve`;
    console.log('📍 API endpoint:', endpoint);
    
    try {
      const response = await apiRequest(endpoint, {
        method: HttpMethod.POST,
        body: { adminNotes },
        requiresAuth: true
      });
      
      console.log('📦 BufferService approval response:', response);
      return response;
    } catch (error) {
      console.error('💥 BufferService approval error:', error);
      throw error;
    }
  }

  /**
   * Reject buffer request (admin)
   */
  static async rejectBufferRequest(bufferPeriodId: string, rejectionReason: string): Promise<ApiResponse<any>> {
    return apiRequest(`/buffer/admin/${bufferPeriodId}/reject`, {
      method: HttpMethod.POST,
      body: { rejectionReason },
      requiresAuth: true
    });
  }

  /**
   * Get all buffer periods (admin)
   */
  static async getAllBufferPeriods(page = 1, limit = 20, status?: string, customerId?: string): Promise<ApiResponse<{ bufferPeriods: BufferPeriod[]; pagination: any }>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (status) params.append('status', status);
    if (customerId) params.append('customerId', customerId);

    return apiRequest(`/buffer/admin/all?${params.toString()}`, {
      method: HttpMethod.GET,
      requiresAuth: true
    });
  }

  /**
   * Get buffer statistics (admin)
   */
  static async getBufferStatistics(): Promise<ApiResponse<BufferStatistics>> {
    return apiRequest('/buffer/admin/statistics', {
      method: HttpMethod.GET,
      requiresAuth: true
    });
  }

  /**
   * Get services affected by buffer periods (admin)
   */
  static async getAffectedServices(date?: string): Promise<ApiResponse<any>> {
    const params = date ? `?date=${date}` : '';
    return apiRequest(`/buffer/admin/affected-services${params}`, {
      method: HttpMethod.GET,
      requiresAuth: true
    });
  }

  /**
   * Check if a date falls within any active buffer period
   */
  static async checkBufferPeriodConflict(subscriptionId: string, date: string): Promise<ApiResponse<{ hasConflict: boolean; bufferPeriod?: BufferPeriod }>> {
    return apiRequest(`/buffer/subscription/${subscriptionId}/check-conflict?date=${date}`, {
      method: HttpMethod.GET,
      requiresAuth: true
    });
  }

  /**
   * Check if subscription is currently in buffer period
   */
  static async checkCurrentBufferStatus(subscriptionId: string): Promise<ApiResponse<{ isInBufferPeriod: boolean; activeBufferPeriod?: BufferPeriod }>> {
    return apiRequest(`/buffer/subscription/${subscriptionId}/current-status`, {
      method: HttpMethod.GET,
      requiresAuth: true
    });
  }
}
