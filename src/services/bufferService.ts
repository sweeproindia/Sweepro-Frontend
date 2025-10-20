import { apiRequest, API_ENDPOINTS, HttpMethod, ApiResponse } from './api';

export interface BufferDayInfo {
  total: number;
  used: number;
  remaining: number;
  resetDate: string;
}

export interface BufferPeriod {
  id: string;
  subscriptionId: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  reason: string;
  daysCount: number;
  servicesSkipped: number;
  autoResumeDate: string;
  resumedAt?: string;
  isAutomatic: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BufferRequestData {
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

export interface AffectedService {
  id: string;
  customerId: string;
  serviceId: string;
  scheduledAt: string;
  status: string;
  isBufferSkipped: boolean;
  customer: any;
  service: any;
  maid?: any;
}

export class BufferService {
  /**
   * Get remaining buffer days for a subscription
   */
  static async getRemainingBufferDays(subscriptionId: string): Promise<ApiResponse<BufferDayInfo>> {
    try {
      return await apiRequest<BufferDayInfo>(`${API_ENDPOINTS.BUFFER.REMAINING}/${subscriptionId}`, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
    } catch (error) {
      console.error('Get remaining buffer days error:', error);
      throw error;
    }
  }

  /**
   * Request buffer days (customer pause)
   */
  static async requestBufferDays(
    subscriptionId: string, 
    data: BufferRequestData
  ): Promise<ApiResponse<{ bufferPeriod: BufferPeriod, message: string }>> {
    try {
      return await apiRequest<{ bufferPeriod: BufferPeriod, message: string }>(
        `${API_ENDPOINTS.BUFFER.REQUEST}/${subscriptionId}`, 
        {
          method: HttpMethod.POST,
          body: data,
          requiresAuth: true
        }
      );
    } catch (error) {
      console.error('Request buffer days error:', error);
      throw error;
    }
  }

  /**
   * Get customer's buffer history
   */
  static async getBufferHistory(
    subscriptionId: string,
    page = 1,
    limit = 10
  ): Promise<ApiResponse<{ history: BufferPeriod[], pagination: any }>> {
    try {
      return await apiRequest<{ history: BufferPeriod[], pagination: any }>(
        `${API_ENDPOINTS.BUFFER.HISTORY}/${subscriptionId}?page=${page}&limit=${limit}`,
        {
          method: HttpMethod.GET,
          requiresAuth: true
        }
      );
    } catch (error) {
      console.error('Get buffer history error:', error);
      throw error;
    }
  }

  /**
   * Get pending buffer requests (admin)
   */
  static async getPendingBufferRequests(
    page = 1,
    limit = 20
  ): Promise<ApiResponse<{ requests: any[], pagination: any }>> {
    try {
      return await apiRequest<{ requests: any[], pagination: any }>(
        `${API_ENDPOINTS.BUFFER.ADMIN.PENDING}?page=${page}&limit=${limit}`,
        {
          method: HttpMethod.GET,
          requiresAuth: true
        }
      );
    } catch (error) {
      console.error('Get pending buffer requests error:', error);
      throw error;
    }
  }

  /**
   * Approve buffer request (admin)
   */
  static async approveBufferRequest(
    bufferPeriodId: string,
    adminNotes?: string
  ): Promise<ApiResponse<{ success: boolean, message: string }>> {
    try {
      return await apiRequest<{ success: boolean, message: string }>(
        `${API_ENDPOINTS.BUFFER.ADMIN.APPROVE}/${bufferPeriodId}`,
        {
          method: HttpMethod.POST,
          body: { adminNotes },
          requiresAuth: true
        }
      );
    } catch (error) {
      console.error('Approve buffer request error:', error);
      throw error;
    }
  }

  /**
   * Reject buffer request (admin)
   */
  static async rejectBufferRequest(
    bufferPeriodId: string,
    rejectionReason: string
  ): Promise<ApiResponse<{ success: boolean, message: string }>> {
    try {
      return await apiRequest<{ success: boolean, message: string }>(
        `${API_ENDPOINTS.BUFFER.ADMIN.REJECT}/${bufferPeriodId}`,
        {
          method: HttpMethod.POST,
          body: { rejectionReason },
          requiresAuth: true
        }
      );
    } catch (error) {
      console.error('Reject buffer request error:', error);
      throw error;
    }
  }

  /**
   * Get all buffer periods (admin)
   */
  static async getAllBufferPeriods(
    page = 1,
    limit = 20,
    status?: string,
    customerId?: string
  ): Promise<ApiResponse<{ bufferPeriods: any[], pagination: any }>> {
    try {
      let url = `${API_ENDPOINTS.BUFFER.ADMIN.ALL}?page=${page}&limit=${limit}`;
      if (status) url += `&status=${status}`;
      if (customerId) url += `&customerId=${customerId}`;

      return await apiRequest<{ bufferPeriods: any[], pagination: any }>(
        url,
        {
          method: HttpMethod.GET,
          requiresAuth: true
        }
      );
    } catch (error) {
      console.error('Get all buffer periods error:', error);
      throw error;
    }
  }

  /**
   * Get buffer statistics for admin dashboard
   */
  static async getBufferStatistics(): Promise<ApiResponse<BufferStatistics>> {
    try {
      return await apiRequest<BufferStatistics>(
        API_ENDPOINTS.BUFFER.ADMIN.STATISTICS,
        {
          method: HttpMethod.GET,
          requiresAuth: true
        }
      );
    } catch (error) {
      console.error('Get buffer statistics error:', error);
      throw error;
    }
  }

  /**
   * Get services affected by buffer periods (admin)
   */
  static async getAffectedServices(
    date?: string
  ): Promise<ApiResponse<{ affectedServices: AffectedService[], activeBuffers: any[], date: string, summary: any }>> {
    try {
      let url = API_ENDPOINTS.BUFFER.ADMIN.AFFECTED_SERVICES;
      if (date) url += `?date=${date}`;

      return await apiRequest<{ affectedServices: AffectedService[], activeBuffers: any[], date: string, summary: any }>(
        url,
        {
          method: HttpMethod.GET,
          requiresAuth: true
        }
      );
    } catch (error) {
      console.error('Get affected services error:', error);
      throw error;
    }
  }
}
