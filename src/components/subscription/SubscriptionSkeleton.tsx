import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function SubscriptionSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Section */}
      <div className="fade-in">
        <Skeleton className="h-8 w-64 mb-2 bg-gradient-to-r from-muted/40 to-muted/20" />
        <Skeleton className="h-5 w-80 bg-gradient-to-r from-muted/30 to-muted/20" />
      </div>

      {/* Current Subscription Card Skeleton */}
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
            <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur-sm rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <Skeleton className="h-6 w-32 bg-gradient-to-r from-muted/40 to-muted/20" />
                <Skeleton className="h-5 w-16 bg-gradient-to-r from-muted/40 to-muted/20 rounded-full" />
              </div>
              <Skeleton className="h-3 w-48 mb-3 bg-gradient-to-r from-muted/30 to-muted/20" />
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <Skeleton className="h-3 w-16 mb-1 bg-gradient-to-r from-muted/30 to-muted/20" />
                    <Skeleton className="h-4 w-20 bg-gradient-to-r from-muted/40 to-muted/20" />
                    <Skeleton className="h-2 w-24 mt-1 bg-gradient-to-r from-muted/20 to-muted/10" />
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3 w-20 bg-gradient-to-r from-muted/30 to-muted/20" />
                    <Skeleton className="h-3 w-24 bg-gradient-to-r from-muted/40 to-muted/20" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3 w-24 bg-gradient-to-r from-muted/30 to-muted/20" />
                    <Skeleton className="h-5 w-16 bg-gradient-to-r from-muted/40 to-muted/20 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-10 w-full bg-gradient-to-r from-muted/40 to-muted/20" />
              <Skeleton className="h-10 w-full bg-gradient-to-r from-muted/40 to-muted/20" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Features Card Skeleton */}
      <Card className="dashboard-card bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-sm border-white/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full bg-gradient-to-r from-muted/30 to-muted/20" />
            <Skeleton className="h-5 w-32 bg-gradient-to-r from-muted/40 to-muted/20" />
          </div>
          <Skeleton className="h-4 w-48 bg-gradient-to-r from-muted/30 to-muted/20" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-lg">
                <Skeleton className="h-3 w-20 mb-1 bg-gradient-to-r from-muted/30 to-muted/20" />
                <Skeleton className="h-7 w-12 bg-gradient-to-r from-muted/40 to-muted/20" />
              </div>
              <div className="p-3 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-lg">
                <Skeleton className="h-3 w-24 mb-1 bg-gradient-to-r from-muted/30 to-muted/20" />
                <Skeleton className="h-7 w-12 bg-gradient-to-r from-muted/40 to-muted/20" />
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-28 bg-gradient-to-r from-muted/40 to-muted/20" />
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full bg-gradient-to-r from-muted/30 to-muted/20" />
                    <Skeleton className="h-3 w-48 bg-gradient-to-r from-muted/30 to-muted/20" />
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-white/20">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-20 bg-gradient-to-r from-muted/30 to-muted/20" />
                  <Skeleton className="h-5 w-16 bg-gradient-to-r from-muted/40 to-muted/20 rounded-full" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-24 bg-gradient-to-r from-muted/30 to-muted/20" />
                  <Skeleton className="h-5 w-20 bg-gradient-to-r from-muted/40 to-muted/20 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans Section with Glow Effects */}
      <div className="relative py-16 bg-gradient-to-br from-background via-muted/30 to-background rounded-3xl border border-border/50 overflow-hidden">
        <div className="relative z-10 px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Skeleton className="h-12 w-64 mx-auto mb-4 bg-gradient-to-r from-muted/40 to-muted/20" />
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
            {[1, 2].map((planIndex) => (
              <div key={planIndex} className="transform transition-all duration-700">
                {/* Plan Card with Glow */}
                <div className="relative group overflow-hidden border-0 rounded-3xl bg-gradient-to-br from-muted/40 to-muted/20 backdrop-blur-2xl shadow-2xl transition-all duration-500 ring-2 ring-white/10">
                  {/* Plan Card Content */}
                  <div className="relative">
                    {/* Shine Effect */}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12" />

                    <div className="p-6 relative z-10">
                      {/* Icon with Glow */}
                      <div className="flex justify-center mb-6">
                        <div className="relative p-4 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/20 shadow-xl ring-4 ring-white/20">
                          <Skeleton className="h-8 w-8 rounded-full bg-gradient-to-r from-muted/30 to-muted/20" />
                        </div>
                      </div>

                      {/* Plan Title */}
                      <div className="text-center mb-8">
                        <Skeleton className="h-8 w-48 mx-auto mb-3 bg-gradient-to-r from-muted/40 to-muted/20" />
                      </div>

                      {/* Plan Description */}
                      <div className="space-y-8">
                        <Skeleton className="h-4 w-full mx-auto bg-gradient-to-r from-muted/30 to-muted/20" />
                        <Skeleton className="h-4 w-3/4 mx-auto bg-gradient-to-r from-muted/30 to-muted/20" />
                      </div>

                      {/* Button */}
                      <div className="flex justify-center mt-8">
                        <Skeleton className="h-10 w-32 bg-gradient-to-r from-muted/40 to-muted/20 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[1, 2, 3].map((statIndex) => (
                <div key={statIndex} className="group relative bg-card/50 backdrop-blur-sm rounded-3xl shadow-lg py-10 px-8 border border-border">
                  {/* Background Glow */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-muted/30 to-muted/10 opacity-20" />

                  <div className="relative z-10">
                    <div className="flex justify-center mb-4">
                      {/* Icon Glow */}
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/20 shadow-xl ring-4 ring-white/20">
                        <Skeleton className="h-6 w-6 rounded-full bg-gradient-to-r from-muted/30 to-muted/20" />
                      </div>
                    </div>
                    <div className="text-4xl font-black mb-3">
                      <Skeleton className="h-10 w-20 mx-auto bg-gradient-to-r from-muted/40 to-muted/20" />
                    </div>
                    <Skeleton className="h-4 w-24 mx-auto bg-gradient-to-r from-muted/30 to-muted/20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Usage Statistics Skeleton */}
      <Card className="dashboard-card bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-sm border-white/20">
        <CardHeader>
          <Skeleton className="h-5 w-40 bg-gradient-to-r from-muted/40 to-muted/20" />
          <Skeleton className="h-4 w-56 bg-gradient-to-r from-muted/30 to-muted/20" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((statIndex) => (
              <div key={statIndex} className="text-center">
                <Skeleton className="h-8 w-16 mx-auto mb-2 bg-gradient-to-r from-muted/40 to-muted/20" />
                <Skeleton className="h-4 w-24 mx-auto bg-gradient-to-r from-muted/30 to-muted/20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
