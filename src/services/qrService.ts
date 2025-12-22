import { apiRequest, API_ENDPOINTS, HttpMethod, ApiResponse } from './api';

export const completeBookingWithQRForCustomer = async (
  bookingId: string,
  qrCodeData: string,
  completionNotes?: string
): Promise<ApiResponse<{ bookingId: string; status: string; completedAt: string }>> => {
  const endpoint = API_ENDPOINTS.BOOKINGS.COMPLETE_WITH_QR.replace(':bookingId', bookingId);
  return await apiRequest<{ bookingId: string; status: string; completedAt: string }>(endpoint, {
    method: HttpMethod.POST,
    body: { qrCodeData, completionNotes },
    requiresAuth: true,
  });
};

export const getMaidQRCode = async (): Promise<ApiResponse<{ qrCodeData: string; maidInfo: { id: string; userId: string; name: string; email: string } }>> => {
  const endpoint = API_ENDPOINTS.BOOKING_COMPLETION.MAID_QR_CODE;
  return await apiRequest<{ qrCodeData: string; maidInfo: { id: string; userId: string; name: string; email: string } }>(endpoint, {
    method: HttpMethod.GET,
    requiresAuth: true,
  });
};

export const startBookingServiceForMaid = async (
  bookingId: string
): Promise<ApiResponse<{ bookingId: string; status: string; actualStartTime: string; actualStartTimeIST?: string }>> => {
  const endpoint = API_ENDPOINTS.BOOKING_COMPLETION.START.replace(':bookingId', bookingId);
  return await apiRequest<{ bookingId: string; status: string; actualStartTime: string; actualStartTimeIST?: string }>(endpoint, {
    method: HttpMethod.POST,
    requiresAuth: true,
  });
};

export const completeBookingWithQRForMaid = async (
  bookingId: string,
  qrCodeData: string,
  completionNotes?: string
): Promise<ApiResponse<{ bookingId: string; status: string; completedAt: string; completedAtIST?: string; qrVerified: boolean }>> => {
  const endpoint = API_ENDPOINTS.BOOKING_COMPLETION.COMPLETE_WITH_QR.replace(':bookingId', bookingId);
  return await apiRequest<{ bookingId: string; status: string; completedAt: string; completedAtIST?: string; qrVerified: boolean }>(endpoint, {
    method: HttpMethod.POST,
    body: { qrCodeData, completionNotes },
    requiresAuth: true,
  });
};
