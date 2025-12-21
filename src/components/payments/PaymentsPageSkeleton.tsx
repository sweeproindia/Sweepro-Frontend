import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function PaymentsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="h-8 w-64 bg-gradient-to-r from-muted/20 to-muted/10 rounded-lg mx-auto mb-2 animate-pulse" />
        <div className="h-5 w-80 bg-gradient-to-r from-muted/20 to-muted/10 rounded-lg mx-auto animate-pulse" />
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((item) => (
          <Card key={item} className="dashboard-card animate-pulse">
            <CardContent className="p-6 space-y-3">
              <div className="h-4 w-28 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
              <div className="h-8 w-24 bg-gradient-to-r from-muted/30 to-muted/20 rounded" />
              <div className="h-3 w-32 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming Payments */}
      <Card className="dashboard-card animate-pulse">
        <CardHeader>
          <div className="h-5 w-40 bg-gradient-to-r from-muted/30 to-muted/20 rounded mb-2" />
          <div className="h-4 w-56 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between p-4 border border-border/60 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gradient-to-r from-muted/25 to-muted/10 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
                  <div className="h-3 w-24 bg-gradient-to-r from-muted/15 to-muted/5 rounded" />
                </div>
              </div>
              <div className="space-y-2 text-right">
                <div className="h-4 w-16 bg-gradient-to-r from-muted/20 to-muted/10 rounded ml-auto" />
                <div className="h-5 w-20 bg-gradient-to-r from-muted/25 to-muted/10 rounded ml-auto" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card className="dashboard-card animate-pulse">
        <CardHeader>
          <div className="h-5 w-36 bg-gradient-to-r from-muted/30 to-muted/20 rounded mb-2" />
          <div className="h-4 w-48 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-16 bg-gradient-to-r from-muted/25 to-muted/10 rounded" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
                <div className="h-3 w-28 bg-gradient-to-r from-muted/15 to-muted/5 rounded" />
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="h-9 w-20 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
              <div className="h-9 w-20 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card className="dashboard-card animate-pulse">
        <CardHeader>
          <div className="h-5 w-40 bg-gradient-to-r from-muted/30 to-muted/20 rounded mb-2" />
          <div className="h-4 w-56 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between p-4 border border-border/60 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gradient-to-r from-muted/25 to-muted/10 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 w-40 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
                  <div className="h-3 w-28 bg-gradient-to-r from-muted/15 to-muted/5 rounded" />
                  <div className="h-3 w-20 bg-gradient-to-r from-muted/10 to-muted/5 rounded" />
                </div>
              </div>
              <div className="space-y-2 text-right">
                <div className="h-4 w-16 bg-gradient-to-r from-muted/20 to-muted/10 rounded ml-auto" />
                <div className="h-3 w-20 bg-gradient-to-r from-muted/15 to-muted/5 rounded ml-auto" />
                <div className="h-5 w-20 bg-gradient-to-r from-muted/25 to-muted/10 rounded ml-auto" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Billing Information */}
      <Card className="dashboard-card animate-pulse">
        <CardHeader>
          <div className="h-5 w-44 bg-gradient-to-r from-muted/30 to-muted/20 rounded mb-2" />
          <div className="h-4 w-60 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((column) => (
              <div key={column} className="space-y-3">
                <div className="h-4 w-32 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
                {[1, 2, 3, 4].map((line) => (
                  <div
                    key={line}
                    className="h-3 w-full bg-gradient-to-r from-muted/15 to-muted/5 rounded"
                  />
                ))}
                <div className="h-9 w-28 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="dashboard-card animate-pulse bg-gradient-feature/60">
        <CardHeader>
          <div className="h-5 w-52 bg-gradient-to-r from-muted/30 to-muted/20 rounded mb-2" />
          <div className="h-4 w-72 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="h-10 w-40 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
            <div className="h-10 w-32 bg-gradient-to-r from-muted/20 to-muted/10 rounded" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
