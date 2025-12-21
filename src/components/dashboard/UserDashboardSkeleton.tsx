import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function UserDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="h-8 w-64 bg-gradient-to-r from-muted/20 to-muted/10 rounded-lg mx-auto mb-2 animate-pulse" />
        <div className="h-6 w-80 bg-gradient-to-r from-muted/20 to-muted/10 rounded-lg mx-auto animate-pulse" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="dashboard-card animate-pulse">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="h-4 w-24 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
                <div className="h-5 w-5 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
              </div>
              <div className="h-8 w-20 bg-gradient-to-r from-muted/30 to-muted/20 rounded" />
              <div className="h-3 w-28 mt-2 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings Card */}
        <Card className="dashboard-card animate-pulse">
          <CardHeader>
            <div className="h-5 w-32 bg-gradient-to-r from-muted/30 to-muted/20 rounded mb-2" />
            <div className="h-4 w-48 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border border-border/50 rounded-lg">
                  <div className="h-10 w-10 bg-gradient-to-r from-muted/20 to-muted/10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
                    <div className="h-3 w-24 bg-gradient-to-r from-muted/15 to-muted/5 rounded" />
                  </div>
                  <div className="h-6 w-16 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Plan Features Card */}
        <Card className="dashboard-card animate-pulse">
          <CardHeader>
            <div className="h-5 w-32 bg-gradient-to-r from-muted/30 to-muted/20 rounded mb-2" />
            <div className="h-4 w-40 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="h-3 w-24 bg-gradient-to-r from-muted/20 to-muted/10 rounded mb-2" />
                  <div className="h-6 w-12 bg-gradient-to-r from-muted/30 to-muted/20 rounded" />
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="h-3 w-24 bg-gradient-to-r from-muted/20 to-muted/10 rounded mb-2" />
                  <div className="h-6 w-12 bg-gradient-to-r from-muted/30 to-muted/20 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <div className="h-4 w-4 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
                    <div className="h-3 w-40 bg-gradient-to-r from-muted/15 to-muted/5 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Details Card */}
      <Card className="dashboard-card animate-pulse">
        <CardHeader>
          <div className="h-5 w-36 bg-gradient-to-r from-muted/30 to-muted/20 rounded mb-2" />
          <div className="h-4 w-48 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gradient-feature rounded-lg space-y-4">
            <div className="flex justify-between items-start">
              <div className="h-5 w-32 bg-gradient-to-r from-muted/30 to-muted/20 rounded" />
              <div className="h-6 w-20 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
            </div>
            <div className="h-4 w-64 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-20 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
                  <div className="h-4 w-24 bg-gradient-to-r from-muted/30 to-muted/20 rounded" />
                  <div className="h-3 w-28 bg-gradient-to-r from-muted/15 to-muted/5 rounded" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maid Assignment Card */}
      <Card className="dashboard-card animate-pulse">
        <CardHeader>
          <div className="h-5 w-40 bg-gradient-to-r from-muted/30 to-muted/20 rounded mb-2" />
          <div className="h-4 w-48 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 p-4 border border-border/50 rounded-lg">
            <div className="h-12 w-12 bg-gradient-to-r from-muted/20 to-muted/10 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
              <div className="h-3 w-40 bg-gradient-to-r from-muted/15 to-muted/5 rounded" />
              <div className="h-3 w-36 bg-gradient-to-r from-muted/15 to-muted/5 rounded" />
            </div>
            <div className="h-8 w-20 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
