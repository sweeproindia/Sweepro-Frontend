import { apiRequest, API_ENDPOINTS, HttpMethod, ApiResponse } from './api';

export interface SetAvailabilityPayload {
  isAvailable: boolean;
  note?: string;
}

class MaidService {
  async setAvailability(payload: SetAvailabilityPayload): Promise<ApiResponse<{ isAvailable: boolean }>> {
    return await apiRequest<{ isAvailable: boolean }>(API_ENDPOINTS.MAIDS.AVAILABILITY, {
      method: HttpMethod.PUT,
      body: payload,
      requiresAuth: true
    });
  }
}

export const maidService = new MaidService();
