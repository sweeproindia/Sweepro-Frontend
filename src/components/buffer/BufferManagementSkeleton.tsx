import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function BufferManagementSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Section */}
      <div className="fade-in">
        <Skeleton className="h-8 w-64 bg-gradient-to-r from-muted/40 to-muted/20 mb-2" />
        <Skeleton className="h-5 w-72 bg-gradient-to-r from-muted/30 to-muted/20" />
      </div>

      {/* Premium Feature Access Denied Card Skeleton */}
      <Card className="dashboard-card bg-gradient-to-br from-yellow-50/50 to-orange-50/50 backdrop-blur-sm border-yellow-200/50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-6 rounded-full bg-gradient-to-r from-muted/30 to-muted/20" />
            <Skeleton className="h-6 w-48 bg-gradient-to-r from-muted/40 to-muted/20" />
          </div>
          <Skeleton className="h-4 w-56 bg-gradient-to-r from-muted/30 to-muted/20" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Skeleton className="h-5 w-5 rounded-full bg-gradient-to-r from-muted/30 to-muted/20 mt-0.5 flex-shrink-0" />
            <div className="space-y-3">
              <Skeleton className="h-5 w-80 bg-gradient-to-r from-muted/40 to-muted/20" />
              <Skeleton className="h-4 w-64 bg-gradient-to-r from-muted/30 to-muted/20" />
              
              {/* Features List */}
              <div className="space-y-2 mt-4">
                <Skeleton className="h-4 w-72 bg-gradient-to-r from-muted/30 to-muted/20" />
                <Skeleton className="h-4 w-68 bg-gradient-to-r from-muted/30 to-muted/20" />
                <Skeleton className="h-4 w-76 bg-gradient-to-r from-muted/30 to-muted/20" />
                <Skeleton className="h-4 w-80 bg-gradient-to-r from-muted/30 to-muted/20" />
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/20">
                <Skeleton className="h-10 w-full sm:flex-1 bg-gradient-to-r from-muted/40 to-muted/20 rounded-md" />
                <Skeleton className="h-10 w-full sm:flex-1 bg-gradient-to-r from-muted/30 to-muted/20 rounded-md" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your Subscription Card Skeleton */}
      <Card className="dashboard-card bg-gradient-to-br from-purple-50/50 to-blue-50/50 backdrop-blur-sm border-purple-200/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full bg-gradient-to-r from-muted/30 to-muted/20" />
            <Skeleton className="h-5 w-40 bg-gradient-to-r from-muted/40 to-muted/20" />
          </div>
          <Skeleton className="h-4 w-48 bg-gradient-to-r from-muted/30 to-muted/20" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-sm rounded-lg">
                <Skeleton className="h-3 w-16 mb-1 bg-gradient-to-r from-muted/30 to-muted/20" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-24 bg-gradient-to-r from-muted/40 to-muted/20" />
                  {i === 2 && <Skeleton className="h-5 w-16 bg-gradient-to-r from-muted/40 to-muted/20 rounded-full" />}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Buffer Status Card Skeleton */}
      <Card className="dashboard-card bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-sm border-white/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full bg-gradient-to-r from-muted/30 to-muted/20" />
            <Skeleton className="h-5 w-36 bg-gradient-to-r from-muted/40 to-muted/20" />
          </div>
          <Skeleton className="h-4 w-48 bg-gradient-to-r from-muted/30 to-muted/20" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Active Buffer Status */}
            <div className="p-4 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 backdrop-blur-sm border border-blue-200/50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Skeleton className="h-5 w-5 rounded-full bg-gradient-to-r from-muted/30 to-muted/20" />
                <Skeleton className="h-5 w-40 bg-gradient-to-r from-muted/40 to-muted/20" />
              </div>
              <Skeleton className="h-3 w-72 mb-3 bg-gradient-to-r from-muted/30 to-muted/20" />
              <div className="grid grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i}>
                    <Skeleton className="h-3 w-20 mb-1 bg-gradient-to-r from-muted/30 to-muted/20" />
                    <Skeleton className="h-4 w-24 bg-gradient-to-r from-muted/40 to-muted/20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buffer History Card Skeleton */}
      <Card className="dashboard-card bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-sm border-white/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full bg-gradient-to-r from-muted/30 to-muted/20" />
            <Skeleton className="h-5 w-32 bg-gradient-to-r from-muted/40 to-muted/20" />
          </div>
          <Skeleton className="h-4 w-40 bg-gradient-to-r from-muted/30 to-muted/20" />
        </CardHeader>
        <CardContent>
          {/* History Items */}
          <div className="space-y-3">
            {[1, 2, 3].map((period) => (
              <div key={period} className="p-4 border border-white/20 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48 bg-gradient-to-r from-muted/40 to-muted/20" />
                    <Skeleton className="h-4 w-40 bg-gradient-to-r from-muted/30 to-muted/20" />
                  </div>
                  <Skeleton className="h-6 w-16 bg-gradient-to-r from-muted/40 to-muted/20 rounded-full" />
                </div>
                <Skeleton className="h-3 w-56 bg-gradient-to-r from-muted/30 to-muted/20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* About Buffer Days Card Skeleton */}
      <Card className="dashboard-card bg-gradient-to-br from-indigo-50/50 to-purple-50/50 backdrop-blur-sm border-indigo-200/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full bg-gradient-to-r from-muted/30 to-muted/20" />
            <Skeleton className="h-5 w-40 bg-gradient-to-r from-muted/40 to-muted/20" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* What are Buffer Days? */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-gradient-to-r from-muted/40 to-muted/20" />
            <Skeleton className="h-3 w-full bg-gradient-to-r from-muted/30 to-muted/20" />
            <Skeleton className="h-3 w-5/6 bg-gradient-to-r from-muted/30 to-muted/20" />
          </div>

          {/* How Many Days Do I Get? */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-48 bg-gradient-to-r from-muted/40 to-muted/20" />
            <Skeleton className="h-3 w-4/5 bg-gradient-to-r from-muted/30 to-muted/20" />
          </div>

          {/* How to Use Buffer Days */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-52 bg-gradient-to-r from-muted/40 to-muted/20" />
            <div className="space-y-2">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-start space-x-2">
                  <Skeleton className="h-4 w-4 rounded-full bg-gradient-to-r from-muted/30 to-muted/20 mt-0.5 flex-shrink-0" />
                  <Skeleton className="h-3 w-64 bg-gradient-to-r from-muted/30 to-muted/20" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
