import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest, API_ENDPOINTS, HttpMethod } from '@/services/api';
import { profileKeys } from '@/lib/queryKeys';

/** Fetches the current customer's profile. */
export function useCustomerProfile() {
  return useQuery({
    queryKey: profileKeys.me,
    queryFn: async () => {
      const response = await apiRequest(API_ENDPOINTS.PROFILE.ME, {
        method: HttpMethod.GET,
        requiresAuth: true,
      });
      return response.success ? response.data : null;
    },
    staleTime: 60_000, // profile rarely changes
  });
}

/** Returns a function to invalidate the profile cache (call after edit/image upload). */
export function useInvalidateProfile() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: profileKeys.all });
}
