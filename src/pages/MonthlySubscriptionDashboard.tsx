import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { MonthlySubscriptionCard } from '@/components/dashboard/MonthlySubscriptionCard';
import { SubscriptionService, MonthlySubscriptionStatus, BufferPeriod } from '@/services/subscriptionService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, Clock, History, AlertTriangle, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export default function MonthlySubscriptionDashboard() {
  const { toast } = useToast();
  const [subscriptionStatus, setSubscriptionStatus] = useState<MonthlySubscriptionStatus | null>(null);
  const [bufferHistory, setBufferHistory] = useState<BufferPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [statusResponse, bufferHistoryResponse, upcomingResponse] = await Promise.allSettled([
        SubscriptionService.getMonthlySubscriptionStatus(),
        SubscriptionService.getBufferPeriodHistory(1, 5),
        SubscriptionService.getUpcomingServices()
      ]);

      // Handle subscription status
      if (statusResponse.status === 'fulfilled' && statusResponse.value.success) {
        setSubscriptionStatus(statusResponse.value.data || null);
      }

      // Handle buffer history
      if (bufferHistoryResponse.status === 'fulfilled' && bufferHistoryResponse.value.success) {
        const historyData = bufferHistoryResponse.value.data?.data || [];
        setBufferHistory(historyData);
      }

      // Handle upcoming services
      if (upcomingResponse.status === 'fulfilled' && upcomingResponse.value.success) {
        const servicesData = upcomingResponse.value.data?.services || [];
        setUpcomingBookings(servicesData);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription data. Please try refreshing.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="fade-in">
          <h1 className="text-3xl font-bold text-foreground">Monthly Subscription</h1>
          <p className="text-muted-foreground mt-2">
            Manage your monthly subscription services and buffer periods
          </p>
        </div>

        {/* Monthly Subscription Card */}
        <div className="slide-up">
          <MonthlySubscriptionCard
            subscriptionStatus={subscriptionStatus}
            onRefresh={fetchSubscriptionData}
            loading={loading}
          />
        </div>

        {/* Upcoming Services */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Services
                </CardTitle>
                <CardDescription>Your scheduled monthly cleaning services</CardDescription>
              </div>
              <Link to="/calendar">
                <Button variant="outline" size="sm">
                  View Calendar
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {upcomingBookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        booking.status === 'CONFIRMED' ? 'bg-primary' :
                        booking.status === 'PENDING' ? 'bg-warning' :
                        'bg-muted-foreground'
                      }`} />
                      <div>
                        <p className="font-medium">{booking.serviceName || 'Monthly Service'}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(booking.scheduledTime).toLocaleDateString()} at {new Date(booking.scheduledTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        {booking.isBufferSkipped && (
                          <Badge variant="outline" className="mt-1 text-xs">Buffer Period Service</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        booking.status === 'CONFIRMED' ? 'default' :
                        booking.status === 'PENDING' ? 'secondary' :
                        'outline'
                      }>
                        {booking.status}
                      </Badge>
                      {booking.maidName && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {booking.maidName}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-semibold mb-2">No Upcoming Services</h4>
                <p className="text-muted-foreground text-sm mb-4">
                  Your monthly subscription services will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Buffer Period History */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Buffer Period History
                </CardTitle>
                <CardDescription>Your past buffer periods and pauses</CardDescription>
              </div>
              <Link to="/buffer-history">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : bufferHistory.length > 0 ? (
              <div className="space-y-4">
                {bufferHistory.map((buffer) => (
                  <div key={buffer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        buffer.status === 'ACTIVE' ? 'bg-warning' :
                        buffer.status === 'COMPLETED' ? 'bg-success' :
                        'bg-muted-foreground'
                      }`} />
                      <div>
                        <p className="font-medium">
                          {buffer.reason.replace('_', ' ').split('_').map(word => 
                            word.charAt(0) + word.slice(1).toLowerCase()
                          ).join(' ')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(buffer.startDate)} - {formatDate(buffer.endDate)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {buffer.servicesSkipped} services skipped • {buffer.daysCount} days
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        buffer.status === 'ACTIVE' ? 'secondary' :
                        buffer.status === 'COMPLETED' ? 'default' :
                        buffer.status === 'CANCELLED' ? 'destructive' :
                        'outline'
                      }>
                        {buffer.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-semibold mb-2">No Buffer Period History</h4>
                <p className="text-muted-foreground text-sm">
                  Your buffer period history will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
