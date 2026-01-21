export const notificationsQueryKeys = {
  all: ['notifications'] as const,
  list: (params: { limit: number }) => ['notifications', 'list', params] as const,
  unreadCount: ['notifications', 'unreadCount'] as const
};
