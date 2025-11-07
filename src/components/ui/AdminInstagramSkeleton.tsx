import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

interface AdminInstagramSkeletonProps {
  type: 'user-table' | 'booking-table' | 'payment-table' | 'maid-table' | 'stats-grid' | 'dashboard-card';
  count?: number;
  className?: string;
}

export const AdminInstagramSkeleton: React.FC<AdminInstagramSkeletonProps> = ({ 
  type, 
  count = 5, 
  className = "" 
}) => {
  const renderUserTableSkeleton = () => (
    <div className={`border rounded-lg ${className}`}>
      <div className="p-4 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>
      <div className="divide-y">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBookingTableSkeleton = () => (
    <div className={`border rounded-lg ${className}`}>
      <div className="p-4 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
      </div>
      <div className="divide-y">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-4 hover:bg-muted/10 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-3 w-3 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-36" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right space-y-1">
                  <Skeleton className="h-4 w-20 ml-auto" />
                  <Skeleton className="h-3 w-16 ml-auto" />
                </div>
                <Skeleton className="h-6 w-18 rounded-full" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPaymentTableSkeleton = () => (
    <div className={`border rounded-lg ${className}`}>
      <div className="p-4 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-36" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>
      <div className="divide-y">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-muted/20 rounded-full flex items-center justify-center">
                <Skeleton className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <div className="text-right space-y-2">
              <Skeleton className="h-5 w-20 ml-auto" />
              <Skeleton className="h-6 w-16 ml-auto rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMaidTableSkeleton = () => (
    <div className={`border rounded-lg ${className}`}>
      <div className="p-4 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
      </div>
      <div className="divide-y">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-4 hover:bg-muted/10 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-32" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right space-y-1">
                  <Skeleton className="h-3 w-16 ml-auto" />
                  <Skeleton className="h-2 w-20 ml-auto rounded-full" />
                </div>
                <Skeleton className="h-6 w-18 rounded-full" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStatsGridSkeleton = () => (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  );

  const renderDashboardCardSkeleton = () => (
    <div className={`border rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 border rounded">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );

  const skeletonMap = {
    'user-table': renderUserTableSkeleton,
    'booking-table': renderBookingTableSkeleton,
    'payment-table': renderPaymentTableSkeleton,
    'maid-table': renderMaidTableSkeleton,
    'stats-grid': renderStatsGridSkeleton,
    'dashboard-card': renderDashboardCardSkeleton,
  };

  const renderSkeleton = skeletonMap[type];

  if (type === 'stats-grid') {
    return renderSkeleton();
  }

  return renderSkeleton();
};

// Specific admin skeleton components
export const AdminUserTableSkeleton = ({ count = 10 }: { count?: number }) => (
  <AdminInstagramSkeleton type="user-table" count={count} />
);

export const AdminBookingTableSkeleton = ({ count = 8 }: { count?: number }) => (
  <AdminInstagramSkeleton type="booking-table" count={count} />
);

export const AdminPaymentTableSkeleton = ({ count = 10 }: { count?: number }) => (
  <AdminInstagramSkeleton type="payment-table" count={count} />
);

export const AdminMaidTableSkeleton = ({ count = 8 }: { count?: number }) => (
  <AdminInstagramSkeleton type="maid-table" count={count} />
);

export const AdminStatsGridSkeleton = () => (
  <AdminInstagramSkeleton type="stats-grid" />
);

export const AdminDashboardCardSkeleton = ({ className }: { className?: string }) => (
  <AdminInstagramSkeleton type="dashboard-card" className={className} />
);
