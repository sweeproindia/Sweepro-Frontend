import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function BookingsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Section Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 bg-gradient-to-r from-muted/30 to-muted/20" />
          <Skeleton className="h-5 w-80 bg-gradient-to-r from-muted/20 to-muted/10" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 bg-gradient-to-r from-muted/30 to-muted/20" />
          <Skeleton className="h-9 w-36 bg-gradient-to-r from-muted/40 to-muted/20" />
          <Skeleton className="h-9 w-28 bg-gradient-to-r from-muted/30 to-muted/20" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="dashboard-card bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16 bg-gradient-to-r from-muted/30 to-muted/20" />
                  <Skeleton className="h-7 w-12 bg-gradient-to-r from-muted/40 to-muted/20" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full bg-gradient-to-r from-muted/30 to-muted/20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Card Skeleton */}
      <Card className="dashboard-card bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-sm border-white/20">
        <CardHeader>
          <Skeleton className="h-5 w-32 bg-gradient-to-r from-muted/40 to-muted/20" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton 
                key={i} 
                className="h-9 w-24 bg-gradient-to-r from-muted/30 to-muted/20 rounded-md" 
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Booking Cards Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((bookingIndex) => (
          <Card 
            key={bookingIndex} 
            className="dashboard-card bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-sm border-white/20"
          >
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <Skeleton className="w-12 h-12 rounded-full bg-gradient-to-r from-muted/40 to-muted/20" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-40 bg-gradient-to-r from-muted/40 to-muted/20" />
                    <Skeleton className="h-4 w-24 bg-gradient-to-r from-muted/30 to-muted/20" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 bg-gradient-to-r from-muted/40 to-muted/20 rounded-full" />
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Booking Details Grid Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((detailIndex) => (
                  <div key={detailIndex} className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4 rounded bg-gradient-to-r from-muted/30 to-muted/20" />
                    <Skeleton className="h-4 w-24 bg-gradient-to-r from-muted/30 to-muted/20" />
                  </div>
                ))}
              </div>

              {/* Service Details Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-gradient-to-r from-muted/40 to-muted/20" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-20 bg-gradient-to-r from-muted/30 to-muted/20 rounded-full" />
                  <Skeleton className="h-6 w-16 bg-gradient-to-r from-muted/30 to-muted/20 rounded-full" />
                </div>
                <Skeleton className="h-3 w-48 bg-gradient-to-r from-muted/20 to-muted/10" />
              </div>

              {/* Special Instructions Skeleton */}
              <div className="space-y-1">
                <Skeleton className="h-4 w-40 bg-gradient-to-r from-muted/40 to-muted/20" />
                <Skeleton className="h-3 w-full bg-gradient-to-r from-muted/20 to-muted/10" />
                <Skeleton className="h-3 w-3/4 bg-gradient-to-r from-muted/20 to-muted/10" />
              </div>

              {/* Pricing Info Skeleton */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16 bg-gradient-to-r from-muted/30 to-muted/20" />
                <Skeleton className="h-5 w-20 bg-gradient-to-r from-muted/40 to-muted/20" />
              </div>

              {/* Actions Skeleton */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-white/20">
                <Skeleton className="h-9 w-28 bg-gradient-to-r from-muted/30 to-muted/20 rounded-md" />
                <Skeleton className="h-9 w-24 bg-gradient-to-r from-muted/30 to-muted/20 rounded-md" />
                <Skeleton className="h-9 w-28 bg-gradient-to-r from-muted/30 to-muted/20 rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
