import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { SubscriptionService, MonthlyCalendarData } from '@/services/subscriptionService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, AlertTriangle, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function MonthlyServiceCalendar() {
  const { toast } = useToast();
  const [calendarData, setCalendarData] = useState<MonthlyCalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchCalendarData();
  }, [currentMonth]);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1; // JavaScript months are 0-based

      const response = await SubscriptionService.getMonthlyServiceCalendar(year, month);
      if (response.success) {
        setCalendarData(response.data || null);
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load calendar data. Please try refreshing.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentMonth(newDate);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'default';
      case 'CONFIRMED':
        return 'secondary';
      case 'PENDING':
        return 'outline';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="fade-in">
          <h1 className="text-3xl font-bold text-foreground">Service Calendar</h1>
          <p className="text-muted-foreground mt-2">
            View your monthly service schedule and buffer periods
          </p>
        </div>

        {/* Calendar Navigation */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {calendarData?.month.name} {calendarData?.month.year}
                </CardTitle>
                <CardDescription>Monthly service schedule</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Month Summary */}
            {calendarData?.monthSummary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{calendarData.monthSummary.totalBookings}</p>
                  <p className="text-sm text-muted-foreground">Total Services</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-success">{calendarData.monthSummary.completedServices}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-warning">{calendarData.monthSummary.upcomingServices}</p>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-500">{calendarData.monthSummary.bufferDays}</p>
                  <p className="text-sm text-muted-foreground">Buffer Days</p>
                </div>
              </div>
            )}

            {/* Calendar Grid */}
            <div className="space-y-4">
              {calendarData?.calendarData && calendarData.calendarData.length > 0 ? (
                <div className="grid gap-4">
                  {calendarData.calendarData.map((day) => (
                    <Card key={day.date} className={`border ${day.isInBufferPeriod ? 'border-orange-200 bg-orange-50' : 'border-border'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">
                              {formatDate(day.date)} ({day.dayOfWeek})
                            </h4>
                            {day.isInBufferPeriod && (
                              <Badge variant="outline" className="text-orange-600 border-orange-200">
                                <Pause className="h-3 w-3 mr-1" />
                                Buffer Period
                              </Badge>
                            )}
                          </div>
                          {day.bufferReason && (
                            <Badge variant="secondary" className="text-xs">
                              {day.bufferReason.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>

                        {day.bookings.length > 0 ? (
                          <div className="space-y-2">
                            {day.bookings.map((booking) => (
                              <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                                <div className="flex items-center gap-3">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium text-sm">{booking.serviceName}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(booking.scheduledTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                      {booking.maidName && ` • ${booking.maidName}`}
                                    </p>
                                    {booking.isBufferSkipped && (
                                      <p className="text-xs text-orange-600 mt-1">Service paused due to buffer period</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={getStatusBadgeVariant(booking.status)} className="text-xs">
                                    {booking.status}
                                  </Badge>
                                  {booking.duration && (
                                    <span className="text-xs text-muted-foreground">{booking.duration}min</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : day.isInBufferPeriod ? (
                          <div className="flex items-center gap-2 text-orange-600 p-3 border border-orange-200 rounded-lg bg-orange-50">
                            <Pause className="h-4 w-4" />
                            <span className="text-sm">Services paused during buffer period</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground p-3 border border-dashed rounded-lg">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">No services scheduled</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-semibold mb-2">No Calendar Data</h4>
                  <p className="text-muted-foreground text-sm">
                    No service data available for this month
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Buffer Periods for the Month */}
        {calendarData?.bufferPeriods && calendarData.bufferPeriods.length > 0 && (
          <Card className="dashboard-card slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Buffer Periods This Month
              </CardTitle>
              <CardDescription>Scheduled buffer periods and service pauses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {calendarData.bufferPeriods.map((buffer) => (
                  <div key={buffer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {buffer.reason.replace('_', ' ').split(' ').map(word => 
                          word.charAt(0) + word.slice(1).toLowerCase()
                        ).join(' ')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(buffer.startDate)} - {formatDate(buffer.endDate)} • {buffer.daysCount} days
                      </p>
                    </div>
                    <Badge variant={
                      buffer.status === 'ACTIVE' ? 'secondary' :
                      buffer.status === 'COMPLETED' ? 'default' :
                      'outline'
                    }>
                      {buffer.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
