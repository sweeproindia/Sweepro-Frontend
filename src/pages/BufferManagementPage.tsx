import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  Calendar,
  Clock,
  Lock,
  Package,
  CheckCircle,
  XCircle,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { SubscriptionService, Subscription, BufferPeriod } from '@/services/subscriptionService';
import { BufferService, BufferDayInfo } from '@/services/bufferService';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BufferManagementSkeleton from '@/components/buffer/BufferManagementSkeleton';
import { BufferDaysRequestDialog } from '@/components/forms/BufferDaysRequestDialog';

function BufferManagementPage() {
  const { user, isAuthenticated } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [bufferPeriods, setBufferPeriods] = useState<BufferPeriod[]>([]);
  const [bufferInfo, setBufferInfo] = useState<BufferDayInfo | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessDeniedReason, setAccessDeniedReason] = useState('');

  useEffect(() => {
    if (user && isAuthenticated) {
      checkAccessAndFetchData();
    }
  }, [user, isAuthenticated]);

  const checkAccessAndFetchData = async () => {
    setLoading(true);
    try {
      // Get user's subscription
      const subscriptionResponse = await SubscriptionService.getUserSubscription();
      
      if (subscriptionResponse.success) {
        const subscriptionData = subscriptionResponse.data?.subscription || (subscriptionResponse as any).subscription;
        setSubscription(subscriptionData);

        // Check if user has buffer access (Sweepro Lux plan)
        const plan = subscriptionData?.plan;
        const isLuxPlan = plan?.hasBufferSystem === true;

        if (!isLuxPlan) {
          setHasAccess(false);
          setAccessDeniedReason(
            `Buffer system is only available for Sweepro Lux plan. Your current plan is "${plan?.name || 'Unknown'}".`
          );
          setLoading(false);
          return;
        }

        if (subscriptionData?.status !== 'ACTIVE') {
          setHasAccess(false);
          setAccessDeniedReason('Your subscription is not active. Please activate your subscription to access buffer features.');
          setLoading(false);
          return;
        }

        setHasAccess(true);

        // Fetch buffer history if user has access
        try {
          const historyResponse = await SubscriptionService.getBufferPeriodHistory(1, 10);
          if (historyResponse.success) {
            setBufferPeriods(historyResponse.data?.data || []);
          }
        } catch (error) {
          console.error('Error fetching buffer history:', error);
        }

        // Fetch remaining buffer days for this subscription
        try {
          const remainingResponse = await BufferService.getRemainingBufferDays(subscriptionData.id);
          if (remainingResponse.success) {
            setBufferInfo(remainingResponse.data || null);
          }
        } catch (error) {
          console.error('Error fetching remaining buffer days:', error);
        }
      } else {
        setHasAccess(false);
        setAccessDeniedReason('No active subscription found. Please subscribe to a plan to access buffer features.');
      }
    } catch (error) {
      console.error('Error checking access:', error);
      setHasAccess(false);
      setAccessDeniedReason('Error checking buffer access. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to load buffer management data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <BufferManagementSkeleton />
      </DashboardLayout>
    );
  }

  if (!user || !isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="text-center p-8">
          <p className="text-muted-foreground">
            Please log in to access buffer management.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (!hasAccess) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="fade-in">
            <h1 className="text-3xl font-bold text-foreground">Buffer Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage your monthly service buffer
            </p>
          </div>

          <Card className="dashboard-card slide-up border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Lock className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
                <CardTitle className="text-xl text-yellow-900 dark:text-yellow-100">
                  Premium Feature
                </CardTitle>
              </div>
              <CardDescription className="text-yellow-800 dark:text-yellow-200">
                Buffer management is exclusive to SweePro Lux subscribers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                    {accessDeniedReason}
                  </p>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4">
                    Upgrade to SweePro Lux to unlock buffer management and enjoy:
                  </p>
                  <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200 mb-6">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>3 complimentary buffer days per month</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Flexible service scheduling</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Weekly premium cleaning service</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>24/7 priority support</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-yellow-200 dark:border-yellow-800">
                <Button
                  onClick={() => navigate('/subscription')}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Upgrade to Sweepro Lux
                </Button>
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  className="flex-1"
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="fade-in">
          <h1 className="text-3xl font-bold text-foreground">Buffer Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your monthly service buffer days
          </p>
        </div>

        {/* Current Subscription Info */}
        {subscription && (
          <Card className="dashboard-card slide-up bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Your Subscription
              </CardTitle>
              <CardDescription>Sweepro Lux - Premium Cleaning Service</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Plan</p>
                  <p className="text-lg font-bold text-foreground">{subscription.plan?.name}</p>
                </div>
                <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Badge variant={subscription.status === 'ACTIVE' ? 'default' : 'destructive'}>
                    {subscription.status}
                  </Badge>
                </div>
                <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Buffer Days Available</p>
                  <p className="text-lg font-bold text-primary">
                    {bufferInfo ? bufferInfo.remaining : (subscription.bufferDaysCount || 3) - (subscription.bufferDaysUsed || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Request Buffer Days */}
        {subscription && (
          <Card className="dashboard-card slide-up">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Request Buffer Days
                  </CardTitle>
                  <CardDescription>
                    Request a temporary pause. Your request will be reviewed by an administrator.
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setIsRequestDialogOpen(true)}
                  disabled={!bufferInfo || bufferInfo.remaining === 0}
                >
                  Request
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {bufferInfo ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Total</p>
                    <p className="text-2xl font-bold text-foreground">{bufferInfo.total}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Used</p>
                    <p className="text-2xl font-bold text-foreground">{bufferInfo.used}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                    <p className="text-2xl font-bold text-primary">{bufferInfo.remaining}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Loading your buffer days…</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => checkAccessAndFetchData()}
                  >
                    Refresh
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {subscription && bufferInfo && (
          <BufferDaysRequestDialog
            isOpen={isRequestDialogOpen}
            onClose={() => setIsRequestDialogOpen(false)}
            onSuccess={() => {
              setIsRequestDialogOpen(false);
              checkAccessAndFetchData();
            }}
            subscriptionId={subscription.id}
            remainingBufferDays={bufferInfo.remaining}
          />
        )}

        {/* Buffer Status Card */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Buffer Status
            </CardTitle>
            <CardDescription>Current buffer period information</CardDescription>
          </CardHeader>
          <CardContent>
            {subscription?.isInBufferPeriod ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-blue-900 dark:text-blue-100">
                      Buffer Period Active
                    </span>
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                    Your buffer period is currently active. Services will resume on the date below.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Started:</span>
                      <p className="font-medium">
                        {subscription.bufferStartDate ? new Date(subscription.bufferStartDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ends:</span>
                      <p className="font-medium">
                        {subscription.bufferEndDate ? new Date(subscription.bufferEndDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="font-semibold text-green-900 dark:text-green-100">
                    No Active Buffer
                  </span>
                </div>
                <p className="text-sm text-green-800 dark:text-green-200">
                  You have <strong>{(subscription?.bufferDaysCount || 3) - (subscription?.bufferDaysUsed || 0)}</strong> buffer days available for use.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Buffer History */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Buffer History
            </CardTitle>
            <CardDescription>Your recent buffer periods</CardDescription>
          </CardHeader>
          <CardContent>
            {bufferPeriods.length > 0 ? (
              <div className="space-y-3">
                {bufferPeriods.map((period) => (
                  <div
                    key={period.id}
                    className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-foreground">
                          {period.daysCount} days - {period.reason?.replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(period.startDate).toLocaleDateString()} to{' '}
                          {new Date(period.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          period.status === 'ACTIVE'
                            ? 'default'
                            : period.status === 'COMPLETED'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {period.status}
                      </Badge>
                    </div>
                    {period.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{period.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No buffer periods yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Buffer Information */}
        <Card className="dashboard-card slide-up bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              About Buffer Days
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What are Buffer Days?</h4>
              <p className="text-sm text-muted-foreground">
                Buffer days are complimentary days at the end of each month where you can pause your regular cleaning services. This is perfect for vacations, special events, or when you need a break from your scheduled services.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">How Many Days Do I Get?</h4>
              <p className="text-sm text-muted-foreground">
                Sweepro Lux subscribers receive 3 complimentary buffer days per month. These days reset at the beginning of each billing cycle.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">How to Use Buffer Days</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start space-x-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Buffer days are automatically applied at the end of your billing cycle</span>
                </li>
                <li className="flex items-start space-x-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>You can request additional buffer days if needed (subject to approval)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Unused buffer days do not carry over to the next month</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default BufferManagementPage;
