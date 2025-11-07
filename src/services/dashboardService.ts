import { apiRequest, HttpMethod } from './api';

export interface PageInfo {
  nextCursor: string | null;
  hasNextPage: boolean;
  pageSize: number;
}

export interface DashboardBooking {
  id: string;
  status: string;
  scheduledAt: string;
  serviceAddress?: string;
  finalAmount?: number;
  service?: { name?: string };
}

export interface DashboardNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface DashboardPayment {
  id: string;
  status: string;
  createdAt: string;
  paymentMethod?: string;
  amount: number;
  description?: string;
  bookingId?: string;
  subscriptionId?: string;
}

export class DashboardService {
  static async getRecentBookings(params: { cursor?: string | null; limit?: number }) {
    const { cursor, limit = 5 } = params || {};
    const qs = new URLSearchParams();
    if (cursor) qs.set('cursor', cursor);
    if (limit) qs.set('limit', String(limit));
    const url = `/user-dashboard/recent/bookings${qs.toString() ? `?${qs.toString()}` : ''}`;
    return apiRequest<{ data: DashboardBooking[]; pageInfo: PageInfo }>(url, {
      method: HttpMethod.GET,
      requiresAuth: true,
    });
  }

  static async getRecentNotifications(params: { cursor?: string | null; limit?: number }) {
    const { cursor, limit = 5 } = params || {};
    const qs = new URLSearchParams();
    if (cursor) qs.set('cursor', cursor);
    if (limit) qs.set('limit', String(limit));
    const url = `/user-dashboard/recent/notifications${qs.toString() ? `?${qs.toString()}` : ''}`;
    return apiRequest<{ data: DashboardNotification[]; pageInfo: PageInfo }>(url, {
      method: HttpMethod.GET,
      requiresAuth: true,
    });
  }

  static async getRecentPayments(params: { cursor?: string | null; limit?: number }) {
    const { cursor, limit = 5 } = params || {};
    const qs = new URLSearchParams();
    if (cursor) qs.set('cursor', cursor);
    if (limit) qs.set('limit', String(limit));
    const url = `/user-dashboard/recent/payments${qs.toString() ? `?${qs.toString()}` : ''}`;
    return apiRequest<{ data: DashboardPayment[]; pageInfo: PageInfo }>(url, {
      method: HttpMethod.GET,
      requiresAuth: true,
    });
  }
}
