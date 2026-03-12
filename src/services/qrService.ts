import { apiRequest, API_ENDPOINTS, HttpMethod, ApiResponse } from './api';

// Customer completes booking by entering maid's verification code
export const completeBookingWithQRForCustomer = async (
  bookingId: string,
  verificationCode: string,
  completionNotes?: string
): Promise<ApiResponse<{ bookingId: string; status: string; completedAt: string; maidName?: string; serviceName?: string }>> => {
  const endpoint = API_ENDPOINTS.BOOKINGS.COMPLETE_WITH_QR.replace(':bookingId', bookingId);
  return await apiRequest<{ bookingId: string; status: string; completedAt: string; maidName?: string; serviceName?: string }>(endpoint, {
    method: HttpMethod.POST,
    body: { verificationCode, completionNotes },
    requiresAuth: true,
  });
};

// Get maid's verification code
export const getMaidQRCode = async (): Promise<ApiResponse<{
  verificationCode: string;
  qrCodeData: string;
  maidInfo: { id: string; userId: string; name: string; email: string; phone?: string; profileImage?: string }
}>> => {
  const endpoint = API_ENDPOINTS.BOOKING_COMPLETION.MAID_QR_CODE;
  return await apiRequest<{
    verificationCode: string;
    qrCodeData: string;
    maidInfo: { id: string; userId: string; name: string; email: string; phone?: string; profileImage?: string }
  }>(endpoint, {
    method: HttpMethod.GET,
    requiresAuth: true,
  });
};

// Set maid's custom verification code (10 alphanumeric characters)
export const setMaidCustomCode = async (code: string): Promise<ApiResponse<{ verificationCode: string }>> => {
  const endpoint = API_ENDPOINTS.BOOKING_COMPLETION.MAID_CUSTOM_CODE;
  return await apiRequest<{ verificationCode: string }>(endpoint, {
    method: HttpMethod.PUT,
    body: { code },
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
