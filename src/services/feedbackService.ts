import { apiRequest, HttpMethod } from './api';

export interface Feedback {
  id: string;
  bookingId: string;
  customerId: string;
  overallRating: number;
  qualityRating?: number;
  punctualityRating?: number;
  behaviorRating?: number;
  comment?: string;
  improvements?: string;
  wouldRecommend?: boolean;
  adminResponse?: string;
  adminResponseAt?: string;
  createdAt: string;
  updatedAt: string;
  booking?: {
    id: string;
    maid?: {
      id: string;
      name: string;
      email: string;
      profileImage?: string;
      maidProfile?: {
        rating: number;
        totalRatings: number;
      };
    };
    service?: {
      id: string;
      name: string;
      description: string;
    };
  };
  customer?: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
}

export interface SubmitFeedbackData {
  bookingId: string;
  maidId?: string; // Optional: maid ID if selecting from assigned maids
  overallRating: number;
  qualityRating?: number;
  punctualityRating?: number;
  behaviorRating?: number;
  comment?: string;
  improvements?: string;
  wouldRecommend?: boolean;
}

class FeedbackService {
  /**
   * Submit feedback for a completed booking
   */
  async submitFeedback(data: SubmitFeedbackData) {
    return apiRequest<Feedback>('/feedback', {
      method: HttpMethod.POST,
      body: data,
      requiresAuth: true
    });
  }

  /**
   * Get feedback for a specific booking
   */
  async getFeedbackByBooking(bookingId: string) {
    return apiRequest<Feedback>(`/feedback/booking/${bookingId}`, {
      method: HttpMethod.GET,
      requiresAuth: true
    });
  }

  /**
   * Get all feedback for the current customer
   */
  async getCustomerFeedback() {
    return apiRequest<Feedback[]>('/feedback/my-feedback', {
      method: HttpMethod.GET,
      requiresAuth: true
    });
  }

  /**
   * Get the most recent completed booking eligible for feedback and assigned maids
   */
  async getEligibleBookings() {
    return apiRequest<{
      bookings: any[];
      assignedMaids?: any[];
    }>('/feedback/eligible-bookings', {
      method: HttpMethod.GET,
      requiresAuth: true
    });
  }

  /**
   * Get all feedback (Admin only)
   */
  async getAllFeedback(params?: {
    page?: number;
    limit?: number;
    rating?: number;
    maidId?: string;
    customerId?: string;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.rating) queryParams.append('rating', params.rating.toString());
    if (params?.maidId) queryParams.append('maidId', params.maidId);
    if (params?.customerId) queryParams.append('customerId', params.customerId);
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const url = `/feedback/all${queryString ? `?${queryString}` : ''}`;

    return apiRequest<{
      // Backend returns { data: Feedback[], pagination: {...} }
      // Some callers may also treat this as { data: { data: Feedback[], pagination: {...} } }
      data: any;
      pagination?: any;
    }>(url, {
      method: HttpMethod.GET,
      requiresAuth: true
    });
  }

  /**
   * Get feedback statistics (Admin only)
   */
  async getFeedbackStats(maidId?: string) {
    const url = maidId ? `/feedback/stats?maidId=${maidId}` : '/feedback/stats';
    return apiRequest<{
      totalFeedback: number;
      averageRating: number;
      ratingDistribution: Record<number, number>;
      feedbacksWithComments: number;
      feedbacksWithoutComments: number;
    }>(url, {
      method: HttpMethod.GET,
      requiresAuth: true
    });
  }

  /**
   * Update admin response to feedback (Admin only)
   */
  async updateAdminResponse(feedbackId: string, adminResponse: string) {
    return apiRequest<Feedback>(`/feedback/${feedbackId}/admin-response`, {
      method: HttpMethod.PATCH,
      body: { adminResponse },
      requiresAuth: true
    });
  }
}

export default new FeedbackService();

