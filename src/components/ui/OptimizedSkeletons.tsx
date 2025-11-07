import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

// Base skeleton with optimized animations
const BaseSkeleton: React.FC<{ className?: string; children?: React.ReactNode }> = ({ 
  className = "", 
  children 
}) => (
  <div className={`animate-pulse ${className}`}>
    {children}
  </div>
);

// Dashboard Stats Skeleton - Matches actual dashboard stats layout
export const DashboardStatsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <BaseSkeleton key={i} className="border rounded-lg p-6 bg-card hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-24 bg-muted-foreground/20" />
          <Skeleton className="h-5 w-5 rounded-full bg-muted-foreground/20" />
        </div>
        <Skeleton className="h-8 w-16 mb-2 bg-muted-foreground/30" />
        <Skeleton className="h-3 w-20 bg-muted-foreground/20" />
      </BaseSkeleton>
    ))}
  </div>
);

// Booking List Skeleton - Matches actual booking items
export const BookingListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <BaseSkeleton key={i} className="border rounded-lg p-4 bg-card hover:bg-muted/5 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-3 w-3 rounded-full bg-blue-200" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-48 bg-muted-foreground/30" />
              <Skeleton className="h-3 w-36 bg-muted-foreground/20" />
              <Skeleton className="h-3 w-28 bg-muted-foreground/20" />
            </div>
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-5 w-16 ml-auto bg-green-200" />
            <Skeleton className="h-6 w-20 ml-auto rounded-full bg-muted-foreground/20" />
          </div>
        </div>
      </BaseSkeleton>
    ))}
  </div>
);

// Payment List Skeleton - Matches actual payment items
export const PaymentListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <BaseSkeleton key={i} className="border rounded-lg p-4 bg-card hover:bg-muted/5 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-muted/30 rounded-full flex items-center justify-center">
              <Skeleton className="h-5 w-5 bg-muted-foreground/30" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-44 bg-muted-foreground/30" />
              <Skeleton className="h-3 w-32 bg-muted-foreground/20" />
            </div>
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-5 w-20 ml-auto bg-green-200" />
            <Skeleton className="h-6 w-16 ml-auto rounded-full bg-muted-foreground/20" />
          </div>
        </div>
      </BaseSkeleton>
    ))}
  </div>
);

// Notification List Skeleton - Matches actual notification items
export const NotificationListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <BaseSkeleton key={i} className="border rounded-lg p-4 bg-card hover:bg-muted/5 transition-colors">
        <div className="flex items-start space-x-4">
          <Skeleton className="h-3 w-3 rounded-full mt-2 bg-blue-200" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32 bg-muted-foreground/30" />
              <Skeleton className="h-3 w-16 bg-muted-foreground/20" />
            </div>
            <Skeleton className="h-4 w-full bg-muted-foreground/20" />
            <Skeleton className="h-3 w-3/4 bg-muted-foreground/20" />
          </div>
        </div>
      </BaseSkeleton>
    ))}
  </div>
);

// Admin User Table Skeleton - Matches actual admin user table
export const AdminUserTableSkeleton: React.FC<{ count?: number }> = ({ count = 10 }) => (
  <BaseSkeleton className="border rounded-lg bg-card">
    <div className="p-4 border-b bg-muted/10">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32 bg-muted-foreground/30" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-20 bg-muted-foreground/20" />
          <Skeleton className="h-8 w-24 bg-muted-foreground/20" />
        </div>
      </div>
    </div>
    <div className="divide-y">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/5 transition-colors">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full bg-muted-foreground/20" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40 bg-muted-foreground/30" />
              <Skeleton className="h-3 w-32 bg-muted-foreground/20" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-6 w-16 rounded-full bg-green-200" />
            <Skeleton className="h-6 w-20 rounded-full bg-blue-200" />
            <Skeleton className="h-8 w-8 rounded bg-muted-foreground/20" />
          </div>
        </div>
      ))}
    </div>
  </BaseSkeleton>
);

// Admin Booking Table Skeleton - Matches actual admin booking table
export const AdminBookingTableSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <BaseSkeleton className="border rounded-lg bg-card">
    <div className="p-4 border-b bg-muted/10">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-40 bg-muted-foreground/30" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-24 bg-muted-foreground/20" />
          <Skeleton className="h-8 w-28 bg-muted-foreground/20" />
        </div>
      </div>
    </div>
    <div className="divide-y">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 hover:bg-muted/5 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-3 w-3 rounded-full bg-orange-200" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48 bg-muted-foreground/30" />
                <Skeleton className="h-3 w-36 bg-muted-foreground/20" />
                <Skeleton className="h-3 w-28 bg-muted-foreground/20" />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right space-y-1">
                <Skeleton className="h-4 w-20 ml-auto bg-green-200" />
                <Skeleton className="h-3 w-16 ml-auto bg-muted-foreground/20" />
              </div>
              <Skeleton className="h-6 w-18 rounded-full bg-yellow-200" />
              <Skeleton className="h-8 w-20 bg-blue-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </BaseSkeleton>
);

// Subscription Card Skeleton - Matches actual subscription cards
export const SubscriptionCardSkeleton: React.FC = () => (
  <BaseSkeleton className="border rounded-lg p-6 bg-card hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-6 w-32 bg-muted-foreground/30" />
      <Skeleton className="h-6 w-6 rounded-full bg-muted-foreground/20" />
    </div>
    <Skeleton className="h-8 w-24 mb-2 bg-muted-foreground/30" />
    <Skeleton className="h-4 w-full mb-4 bg-muted-foreground/20" />
    <div className="space-y-2 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4 bg-green-200" />
          <Skeleton className="h-3 w-32 bg-muted-foreground/20" />
        </div>
      ))}
    </div>
    <Skeleton className="h-10 w-full bg-blue-200" />
  </BaseSkeleton>
);

// Loading Spinner for quick actions
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-muted-foreground/20 border-t-primary ${sizeClasses[size]}`} />
  );
};

// Page Loading Skeleton - For full page loads
export const PageLoadingSkeleton: React.FC<{ type: 'dashboard' | 'table' | 'cards' }> = ({ type }) => {
  if (type === 'dashboard') {
    return (
      <div className="space-y-6 p-4">
        <DashboardStatsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BaseSkeleton className="border rounded-lg p-6 bg-card h-64" />
          <BaseSkeleton className="border rounded-lg p-6 bg-card h-64" />
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="space-y-4">
        <BaseSkeleton className="h-10 w-full bg-muted/20" />
        <AdminUserTableSkeleton count={8} />
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SubscriptionCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return null;
};

// Incremental Loading Skeleton - For pagination
export const IncrementalLoadingSkeleton: React.FC<{ 
  type: 'bookings' | 'payments' | 'notifications' | 'users';
  count?: number;
}> = ({ type, count = 3 }) => {
  const skeletonMap = {
    bookings: <BookingListSkeleton count={count} />,
    payments: <PaymentListSkeleton count={count} />,
    notifications: <NotificationListSkeleton count={count} />,
    users: <AdminUserTableSkeleton count={count} />
  };

  return (
    <div className="mt-4 space-y-2">
      {skeletonMap[type]}
    </div>
  );
};
