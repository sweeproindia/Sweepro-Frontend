import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Notification } from '../types';
import { getNotificationHref, getNotificationIcon, getNotificationPriority, getPriorityClasses } from '../utils';

export function NotificationItem({
  notification,
  onOpen,
  onDelete,
  showUnreadDot = true
}: {
  notification: Notification;
  onOpen: (notification: Notification) => void;
  onDelete?: (notificationId: string) => void;
  showUnreadDot?: boolean;
}) {
  const priority = getNotificationPriority(notification.type);
  const styles = getPriorityClasses(priority);

  const createdLabel = format(new Date(notification.createdAt), 'MMM d • h:mm a');

  return (
    <button
      type="button"
      className={cn(
        'w-full text-left p-4 border-b border-border hover:bg-muted/50 transition-colors group',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        !notification.read ? styles.bg : '',
        !notification.read ? `border-l-4 ${styles.ring}` : 'border-l-4 border-l-transparent'
      )}
      onClick={() => onOpen(notification)}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5" aria-hidden="true">
          {getNotificationIcon(notification.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={cn('text-sm font-medium truncate', !notification.read ? 'text-foreground' : 'text-muted-foreground')}>
                {notification.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{createdLabel}</p>
            </div>

            <div className="flex items-center gap-2">
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(notification.id);
                  }}
                  aria-label="Delete notification"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}

              {showUnreadDot && !notification.read && (
                <span className={cn('h-2 w-2 rounded-full', styles.dot)} aria-label="Unread" />
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{notification.message}</p>

          {getNotificationHref(notification) ? (
            <p className="mt-2 text-xs text-primary underline underline-offset-2">View details</p>
          ) : null}
        </div>
      </div>
    </button>
  );
}
