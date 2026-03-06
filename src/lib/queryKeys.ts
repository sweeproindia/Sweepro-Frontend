/**
 * Centralized query key factory for React Query.
 *
 * Every key uses `as const` for type-safe invalidation.
 * The `all` key on each entity allows broad invalidation:
 *   queryClient.invalidateQueries({ queryKey: subscriptionKeys.all })
 */

export const subscriptionKeys = {
  all: ['subscription'] as const,
  mine: ['subscription', 'mine'] as const,
  plans: ['subscription', 'plans'] as const,
  monthlyStatus: ['subscription', 'monthlyStatus'] as const,
};

export const paymentKeys = {
  all: ['payments'] as const,
  list: (params: { page: number; limit: number }) =>
    ['payments', 'list', params] as const,
};

export const bookingKeys = {
  all: ['bookings'] as const,
  list: (params: { role: string; filter?: string }) =>
    ['bookings', 'list', params] as const,
  stats: ['bookings', 'stats'] as const,
};

export const profileKeys = {
  all: ['profile'] as const,
  me: ['profile', 'me'] as const,
};

export const maidAssignmentKeys = {
  all: ['maidAssignment'] as const,
  current: ['maidAssignment', 'current'] as const,
};

export const bufferKeys = {
  all: ['buffer'] as const,
  info: (subscriptionId: string) =>
    ['buffer', 'info', subscriptionId] as const,
  history: (subscriptionId: string, page: number, limit: number) =>
    ['buffer', 'history', subscriptionId, { page, limit }] as const,
};
