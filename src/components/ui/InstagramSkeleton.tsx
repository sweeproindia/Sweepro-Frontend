import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

interface InstagramSkeletonProps {
  type: 'card' | 'list' | 'feed' | 'table' | 'stats';
  count?: number;
  className?: string;
}

export const InstagramSkeleton: React.FC<InstagramSkeletonProps> = ({ 
  type, 
  count = 3, 
  className = "" 
}) => {
  const renderCardSkeleton = () => (
    <div className={`border rounded-lg p-4 space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
      <Skeleton className="h-7 w-24" />
      <Skeleton className="h-3 w-28" />
    </div>
  );

  const renderListSkeleton = () => (
    <div className={`flex items-center justify-between p-4 border rounded-lg ${className}`}>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-3 w-3 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <div className="text-right space-y-2">
        <Skeleton className="h-5 w-16 ml-auto" />
        <Skeleton className="h-4 w-20 ml-auto" />
      </div>
    </div>
  );

  const renderFeedSkeleton = () => (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-32 w-full rounded-lg" />
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );

  const renderTableSkeleton = () => (
    <div className={`border rounded-lg ${className}`}>
      <div className="p-4 border-b">
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="divide-y">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex space-x-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-16 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStatsSkeleton = () => (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );

  const skeletonMap = {
    card: renderCardSkeleton,
    list: renderListSkeleton,
    feed: renderFeedSkeleton,
    table: renderTableSkeleton,
    stats: renderStatsSkeleton,
  };

  const renderSkeleton = skeletonMap[type];

  if (type === 'stats') {
    return renderSkeleton();
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

// Specific skeleton components for common use cases
export const BookingSkeleton = ({ count = 5 }: { count?: number }) => (
  <InstagramSkeleton type="list" count={count} />
);

export const PaymentSkeleton = ({ count = 5 }: { count?: number }) => (
  <InstagramSkeleton type="list" count={count} />
);

export const NotificationSkeleton = ({ count = 5 }: { count?: number }) => (
  <InstagramSkeleton type="list" count={count} />
);

export const DashboardStatsSkeleton = () => (
  <InstagramSkeleton type="stats" />
);

export const SubscriptionCardSkeleton = () => (
  <InstagramSkeleton type="card" count={1} />
);
