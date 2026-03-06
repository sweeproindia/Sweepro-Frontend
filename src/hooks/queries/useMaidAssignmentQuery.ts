import { useQuery } from '@tanstack/react-query';
import { MaidService, MaidAssignment } from '@/services/maidService';
import { maidAssignmentKeys } from '@/lib/queryKeys';

/** Fetches the current user's assigned maid. */
export function useCurrentMaidAssignment(enabled = true) {
  return useQuery({
    queryKey: maidAssignmentKeys.current,
    queryFn: async (): Promise<MaidAssignment | null> => {
      const response = await MaidService.getCurrentMaidAssignment();
      return response.success ? response.data ?? null : null;
    },
    enabled,
    staleTime: 120_000, // maid assignment changes infrequently
  });
}
