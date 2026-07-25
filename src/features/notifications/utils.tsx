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
  const type = notification.type?.toUpperCase() || '';

  // Booking-related notifications
  if (type.includes('BOOKING') || type.includes('SERVICE')) {
    if (data?.bookingId) return `/bookings`;
    return '/bookings';
  }

  // Payment-related notifications
  if (type.includes('PAYMENT')) {
    if (data?.paymentId) return `/payments`;
    return '/payments';
  }

  // Subscription-related notifications
  if (type.includes('SUBSCRIPTION')) {
    if (data?.subscriptionId) return `/subscription`;
    return '/subscription';
  }

  // Buffer-related notifications
  if (type.includes('BUFFER')) {
    return '/buffer';
  }

  // Assignment-related notifications (for maids)
  if (type.includes('ASSIGNMENT')) {
    if (data?.assignmentRequestId) return '/maid-bookings';
    return '/maid-bookings';
  }

  // User registration (for admins)
  if (type.includes('USER_REGISTERED') && data?.userId) {
    return '/admin';
  }

  // Issue-related notifications
  if (type.includes('ISSUE')) {
    if (data?.issueId) return '/support';
    return '/support';
  }

  // Feedback-related notifications
  if (type.includes('FEEDBACK')) {
    return '/admin/feedback';
  }

  // Maid verification notifications
  if (type.includes('DOCUMENT') || type.includes('VERIFICATION')) {
    return '/admin/maid-verification';
  }

  // Maid status changes
  if (type.includes('MAID_STATUS') || type.includes('ATTENDANCE') || type.includes('PERFORMANCE')) {
    return '/maid-profile';
  }

  // Profile-related notifications
  if (type.includes('PROFILE')) {
    return '/profile';
  }

  // System notifications (no specific page)
  if (type.includes('SYSTEM') || type.includes('EMERGENCY') || type.includes('MAINTENANCE')) {
    return '/dashboard';
  }

  // Default to dashboard for unknown types
  return '/dashboard';
}
