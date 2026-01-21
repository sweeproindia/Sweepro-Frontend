import { Bell, AlertTriangle, CalendarClock, CreditCard, Crown, Shield } from 'lucide-react';
import type { Notification, NotificationPriority } from './types';

export function getNotificationPriority(type: string): NotificationPriority {
  const t = type.toUpperCase();
  if (t.includes('EMERGENCY') || t.includes('FAILED') || t.includes('OVERDUE') || t.includes('REASSIGNMENT') || t.includes('ISSUE')) {
    return 'high';
  }
  if (t.includes('REMINDER') || t.includes('EXPIRING') || t.includes('APPROACHING') || t.includes('PENDING')) {
    return 'medium';
  }
  return 'low';
}

export function getPriorityClasses(priority: NotificationPriority): { ring: string; bg: string; dot: string } {
  switch (priority) {
    case 'high':
      return { ring: 'border-l-red-500', bg: 'bg-red-50/30 dark:bg-red-950/15', dot: 'bg-red-500' };
    case 'medium':
      return { ring: 'border-l-amber-500', bg: 'bg-amber-50/30 dark:bg-amber-950/15', dot: 'bg-amber-500' };
    default:
      return { ring: 'border-l-blue-500', bg: 'bg-blue-50/30 dark:bg-blue-950/15', dot: 'bg-blue-500' };
  }
}

export function getNotificationIcon(type: string) {
  const t = type.toUpperCase();

  if (t.includes('PAYMENT')) return <CreditCard className="h-4 w-4 text-emerald-600" />;
  if (t.includes('SUBSCRIPTION')) return <Crown className="h-4 w-4 text-orange-600" />;
  if (t.includes('BOOKING') || t.includes('SERVICE')) return <CalendarClock className="h-4 w-4 text-blue-600" />;
  if (t.includes('SECURITY') || t.includes('DOCUMENT')) return <Shield className="h-4 w-4 text-violet-600" />;
  if (getNotificationPriority(t) === 'high') return <AlertTriangle className="h-4 w-4 text-red-600" />;

  return <Bell className="h-4 w-4 text-muted-foreground" />;
}

export function getNotificationHref(notification: Notification): string | null {
  const data = notification.data as any;
  if (data?.bookingId) return `/bookings/${data.bookingId}`;
  if (data?.paymentId) return `/payments/${data.paymentId}`;
  if (data?.subscriptionId) return `/subscription`;
  return null;
}
