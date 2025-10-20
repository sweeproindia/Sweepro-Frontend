import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Clock, 
  Pause, 
  Play, 
  AlertTriangle, 
  CheckCircle,
  Package,
  Timer,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  MonthlySubscriptionStatus, 
  SubscriptionService, 
  BufferPeriod 
} from '@/services/subscriptionService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';

interface MonthlySubscriptionCardProps {
  subscriptionStatus: MonthlySubscriptionStatus | null;
  onRefresh: () => void;
  loading?: boolean;
}

export const MonthlySubscriptionCard: React.FC<MonthlySubscriptionCardProps> = ({
  subscriptionStatus,
  onRefresh,
  loading = false
}) => {
  const { toast } = useToast();
  const [isBufferDialogOpen, setIsBufferDialogOpen] = useState(false);
  const [bufferAction, setBufferAction] = useState<'start' | 'end'>('start');
  const [actionLoading, setActionLoading] = useState(false);

  if (loading) {
    return (
      <Card className="dashboard-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscriptionStatus?.hasActiveSubscription) {
    return (
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Monthly Subscription
          </CardTitle>
          <CardDescription>Manage your monthly service subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-semibold mb-2">No Active Monthly Subscription</h4>
            <p className="text-muted-foreground text-sm mb-4">
              Subscribe to enjoy automated monthly services with buffer periods
            </p>
            <Link to="/subscription">
              <Button className="btn-hero">
                Choose a Plan
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { subscription, summary, activeBuffer, daysUntilBuffer, currentCycle } = subscriptionStatus;

  const handleBufferAction = async (action: 'start' | 'end') => {
    setActionLoading(true);
    try {
      if (action === 'start') {
        await SubscriptionService.startBufferPeriod();
        toast({
          title: 'Buffer Period Started',
          description: 'Your services are now paused for the buffer period.',
          variant: 'default'
        });
      } else {
        await SubscriptionService.endBufferPeriod();
        toast({
          title: 'Buffer Period Ended',
          description: 'Your services will resume with the next cycle.',
          variant: 'default'
        });
      }
      
      setIsBufferDialogOpen(false);
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Action Failed',
        description: error.message || `Failed to ${action} buffer period`,
        variant: 'destructive'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="dashboard-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Monthly Subscription
            </CardTitle>
            <CardDescription>
              {subscription?.plan?.name} - Cycle #{currentCycle?.cycleNumber || 1}
            </CardDescription>
          </div>
          <Badge 
            variant={subscription?.status === 'ACTIVE' ? 'default' : 'destructive'}
            className="h-6"
          >
            {subscription?.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Buffer Period Status */}
        {summary?.bufferPeriodActive ? (
          <Alert className="border-orange-200 bg-orange-50">
            <Pause className="h-4 w-4" />
            <AlertDescription className="text-orange-800">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Buffer Period Active</strong>
                  <p className="text-sm mt-1">
                    Services paused until {activeBuffer ? formatDate(activeBuffer.endDate) : 'TBD'}
                  </p>
                </div>
                <Dialog open={isBufferDialogOpen && bufferAction === 'end'} onOpenChange={setIsBufferDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setBufferAction('end')}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Resume Early
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>End Buffer Period Early?</DialogTitle>
                      <DialogDescription>
                        This will resume your services immediately. Your next cycle will begin with normal scheduling.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setIsBufferDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => handleBufferAction('end')}
                        disabled={actionLoading}
                      >
                        {actionLoading ? 'Processing...' : 'Resume Services'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Services Active</strong>
                  <p className="text-sm mt-1">
                    {daysUntilBuffer !== null && daysUntilBuffer > 0 
                      ? `Next buffer period in ${daysUntilBuffer} days`
                      : 'Monthly services running normally'
                    }
                  </p>
                </div>
                <Dialog open={isBufferDialogOpen && bufferAction === 'start'} onOpenChange={setIsBufferDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setBufferAction('start')}
                    >
                      <Pause className="h-4 w-4 mr-1" />
                      Pause Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Start Buffer Period Now?</DialogTitle>
                      <DialogDescription>
                        This will pause your services for {subscription?.bufferDaysCount || 3} days. 
                        You can resume early if needed.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setIsBufferDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => handleBufferAction('start')}
                        disabled={actionLoading}
                      >
                        {actionLoading ? 'Processing...' : 'Start Buffer Period'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Cycle Progress */}
        {summary && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Monthly Cycle Progress</span>
              <span className="text-muted-foreground">{summary.cycleProgress}%</span>
            </div>
            <Progress value={summary.cycleProgress} className="h-2" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{summary.servicesThisMonth} services this month</span>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-orange-500" />
                <span>
                  {subscription?.bufferDaysUsed || 0} / {subscription?.bufferDaysCount || 3} buffer days used
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Details */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Current Cycle</p>
            <p className="font-medium">
              {subscription?.currentCycleStart 
                ? `${formatTime(subscription.currentCycleStart)} - ${formatTime(subscription.currentCycleEnd || '')}`
                : 'Active'
              }
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Monthly Amount</p>
            <p className="font-medium text-lg">₹{subscription?.amount?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Services/Month</p>
            <p className="font-medium">{subscription?.plan?.sessionsPerMonth || 0}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Completed Cycles</p>
            <p className="font-medium">{subscription?.completedCycles || 0}</p>
          </div>
        </div>

        {/* Next Bill Info */}
        {subscription?.nextBillDate && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Next Billing</p>
                <p className="font-medium">{formatDate(subscription.nextBillDate)}</p>
              </div>
              <Badge variant={subscription.autoRenew ? 'default' : 'outline'}>
                Auto-renewal {subscription.autoRenew ? 'ON' : 'OFF'}
              </Badge>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 pt-4 border-t">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <TrendingUp className="h-4 w-4 mr-1" />
            Refresh Status
          </Button>
          <Link to="/calendar">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-1" />
              View Calendar
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
