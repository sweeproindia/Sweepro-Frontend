import { apiRequest, HttpMethod } from './api';

export interface Maid {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  rating: number;
  totalServices: number;
  experience: string;
  skills: string[];
  languages: string[];
  bio?: string;
  isAvailable: boolean;
}

export interface MaidAssignment {
  id: string;
  maid: Maid;
  assignedAt?: string;
  notes?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PENDING';
  monthlySchedule?: Array<{
    date: string;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'BUFFER';
  }>;
}

export interface AvailableMaidsResponse {
  success: boolean;
  data?: Array<{ id: string; name: string; rating: number }>;
  error?: string;
}

export interface MaidAssignmentResponse {
  success: boolean;
  data?: MaidAssignment;
  error?: string;
}

export const MaidService = {
  getCurrentMaidAssignment: async (): Promise<MaidAssignmentResponse> => {
    try {
      const response = await apiRequest<MaidAssignment>(
        '/admin/customer-assignments/my-assignment',
        {
          method: HttpMethod.GET,
          requiresAuth: true
        }
      );
      return response as MaidAssignmentResponse;
    } catch (error) {
      console.error('Error fetching maid assignment:', error);
      return {
        success: false,
        error: 'Failed to fetch maid assignment'
      };
    }
  },

  getCustomerAssignment: async (customerId: string): Promise<MaidAssignmentResponse> => {
    try {
      const response = await apiRequest<MaidAssignment>(
        `/admin/customer-assignments/${customerId}`,
        {
          method: HttpMethod.GET,
          requiresAuth: true
        }
      );
      return response as MaidAssignmentResponse;
    } catch (error) {
      console.error('Error fetching customer assignment:', error);
      return {
        success: false,
        error: 'Failed to fetch customer assignment'
      };
    }
  },

  getAvailableMaids: async (): Promise<AvailableMaidsResponse> => {
    try {
      const response = await apiRequest<any>(
        '/maids',
        {
          method: HttpMethod.GET,
          requiresAuth: true
        }
      );
      return response as AvailableMaidsResponse;
    } catch (error) {
      console.error('Error fetching available maids:', error);
      return {
        success: false,
        data: []
      };
    }
  },

  requestMaidChange: async (reason: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await apiRequest<any>(
        '/maids/change-request',
        {
          method: HttpMethod.POST,
          requiresAuth: true,
          body: { reason }
        }
      );
      return response as { success: boolean; message?: string };
    } catch (error) {
      console.error('Error requesting maid change:', error);
      return {
        success: false,
        message: 'Failed to submit change request'
      };
    }
  },

  getMaidSchedule: async (maidId: string): Promise<any> => {
    try {
      const response = await apiRequest<any>(
        `/maids/${maidId}/schedule`,
        {
          method: HttpMethod.GET,
          requiresAuth: true
        }
      );
      return response;
    } catch (error) {
      console.error('Error fetching maid schedule:', error);
      return { success: false };
    }
  },

  setAvailability: async (availability: { isAvailable: boolean; note?: string }): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await apiRequest<any>(
        '/maids/availability',
        {
          method: HttpMethod.PUT,
          requiresAuth: true,
          body: availability
        }
      );
      return response as { success: boolean; message?: string };
    } catch (error) {
      console.error('Error setting maid availability:', error);
      return {
        success: false,
        message: 'Failed to update availability'
      };
    }
  }
};
