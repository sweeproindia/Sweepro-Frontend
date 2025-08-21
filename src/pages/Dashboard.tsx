import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CreditCard, Clock, CheckCircle, Plus, ArrowRight, AlertTriangle, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { SubscriptionModal } from '@/components/SubscriptionModal';
import { useToast } from '@/hooks/use-toast';
import { BookingButton, BookTodayButton, BookTomorrowButton } from '@/components/buttons/BookingButton';
import { useBookingForm } from '@/contexts/BookingFormContext';

const stats = [
  {
    title: 'Active Plan',
    value: 'Standard',
    description: '5 visits per week',
    icon: CreditCard,
    color: 'text-primary'
  },
  {
    title: 'Upcoming Bookings',
    value: '3',
    description: 'Next: Tomorrow 10:00 AM',
    icon: Calendar,
    color: 'text-success'
  },
  {
    title: 'Total Visits',
    value: '47',
    description: 'This month: 12 completed',
    icon: CheckCircle,
    color: 'text-warning'
  },
  {
    title: 'Next Payment',
    value: '₹3,499',
    description: 'Due: Dec 15, 2024',
    icon: Clock,
    color: 'text-primary'
  }
];

const recentBookings = [
  {
    id: 1,
    date: 'Today',
    time: '2:00 PM',
    cleaner: 'Sarah Johnson',
    status: 'completed',
    duration: '3 hours'
  },
  {
    id: 2,
    date: 'Tomorrow',
    time: '10:00 AM',
    cleaner: 'Maria Garcia',
    status: 'scheduled',
    duration: '3 hours'
  },
  {
    id: 3,
    date: 'Dec 16',
    time: '2:00 PM',
    cleaner: 'Sarah Johnson',
    status: 'scheduled',
    duration: '3 hours'
  }
];

export default function Dashboard() {
  const { user, updateUser, isAuthenticated } = useUser();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { toast } = useToast();
  const { openBookingForm } = useBookingForm();

  // Show subscription modal for inactive and pending users
  useEffect(() => {
    if (user && (user.status === 'INACTIVE' || user.status === 'PENDING')) {
      setShowSubscriptionModal(true);
    }
  }, [user]);

  const handleSubscriptionComplete = () => {
    if (user) {
      // Update user status to active and add subscription
      const updatedUser = {
        ...user,
        status: 'active' as const,
        subscription: {
          id: 'new_sub',
          planName: 'Standard',
          planType: 'Standard',
          price: 3499,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          isActive: true,
          autoRenewal: true,
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      };
      updateUser(updatedUser);
      
      toast({
        title: "Welcome to SweepPro!",
        description: "Your subscription has been activated successfully.",
      });
    }
  };

  // If no user or not authenticated, show loading
  if (!user || !isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Render different content based on user status
  if (user.status === 'INACTIVE') {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="fade-in">
            <h1 className="text-3xl font-bold text-foreground">Welcome, {user.name}!</h1>
            <div className="mt-4 p-4 bg-muted/30 rounded-lg">
              <h3 className="font-semibold mb-2">Your Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Email:</span> {user.email}</div>
                <div><span className="font-medium">Phone:</span> {user.phone}</div>
                <div><span className="font-medium">Role:</span> {user.role}</div>
                <div><span className="font-medium">Status:</span> <Badge variant="outline">{user.status}</Badge></div>
                {user.address && <div className="md:col-span-2"><span className="font-medium">Address:</span> {user.address}</div>}
              </div>
            </div>
            <p className="text-muted-foreground mt-4">
              Complete your subscription to start enjoying our premium cleaning services.
            </p>
          </div>

          {/* Subscription Required Card */}
          <Card className="dashboard-card slide-up bg-gradient-feature">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Crown className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-2xl">Choose Your Plan</CardTitle>
              <CardDescription>
                Select a subscription plan to unlock premium cleaning services
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="max-w-md mx-auto">
                <p className="text-muted-foreground mb-6">
                  Get started with our professional cleaning services. Choose from our flexible plans designed to meet your needs.
                </p>
                <Button 
                  className="btn-hero"
                  onClick={() => setShowSubscriptionModal(true)}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Choose Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          userStatus="inactive"
          onSubscriptionComplete={handleSubscriptionComplete}
        />
      </DashboardLayout>
    );
  }

  if (user.status === 'PENDING') {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="fade-in">
            <h1 className="text-3xl font-bold text-foreground">Welcome back, {user.name}!</h1>
            <div className="mt-4 p-4 bg-muted/30 rounded-lg">
              <h3 className="font-semibold mb-2">Your Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Email:</span> {user.email}</div>
                <div><span className="font-medium">Phone:</span> {user.phone}</div>
                <div><span className="font-medium">Role:</span> {user.role}</div>
                <div><span className="font-medium">Status:</span> <Badge variant="destructive">{user.status}</Badge></div>
                {user.address && <div className="md:col-span-2"><span className="font-medium">Address:</span> {user.address}</div>}
              </div>
            </div>
            <p className="text-muted-foreground mt-4">
              Your account status requires attention. Renew to continue enjoying our services.
            </p>
          </div>

          {/* Subscription Expired Card */}
          <Card className="dashboard-card slide-up bg-gradient-feature">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-warning" />
              </div>
              <CardTitle className="text-2xl">Subscription Expired</CardTitle>
              <CardDescription>
                Your subscription has expired. Renew now to continue services.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="max-w-md mx-auto">
                <p className="text-muted-foreground mb-6">
                  Don't miss out on our premium cleaning services. Renew your subscription to continue enjoying a clean home.
                </p>
                <Button 
                  className="btn-hero"
                  onClick={() => setShowSubscriptionModal(true)}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Renew Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          userStatus="pending"
          onSubscriptionComplete={handleSubscriptionComplete}
        />
      </DashboardLayout>
    );
  }

  // Active user dashboard (original content)
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="fade-in">
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground mt-2">
            Here's what's happening with your cleaning services today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 slide-up">
          {stats.map((stat, index) => (
            <Card key={stat.title} className="dashboard-card" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <Card className="dashboard-card slide-up">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Your upcoming and recent cleaning sessions</CardDescription>
                </div>
                <Link to="/bookings">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      booking.status === 'completed' ? 'bg-success' : 
                      booking.status === 'scheduled' ? 'bg-primary' : 'bg-warning'
                    }`} />
                    <div>
                      <p className="font-medium text-foreground">{booking.date} at {booking.time}</p>
                      <p className="text-sm text-muted-foreground">{booking.cleaner} • {booking.duration}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    booking.status === 'completed' ? 'bg-success-light text-success' :
                    booking.status === 'scheduled' ? 'bg-primary-light text-primary' : 'bg-warning/20 text-warning'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="dashboard-card slide-up">
            <CardHeader>
              <CardTitle>Quick Booking</CardTitle>
              <CardDescription>Book services with your fixed time slot (10:00 AM - 1:00 PM)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Today Booking */}
              <div className="p-4 bg-gradient-feature rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-foreground">Book for Today</h4>
                  <Badge className="bg-success text-success-foreground">Available</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Schedule cleaning service for today at your preferred time
                </p>
                <BookTodayButton
                  onClick={openBookingForm}
                  className="btn-hero w-full"
                />
              </div>

              {/* Tomorrow Booking */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-foreground">Book for Tomorrow</h4>
                  <Badge variant="outline">Already Booked</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()} at 10:00 AM - Sarah Johnson
                </p>
                <Button variant="outline" disabled className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Booking Confirmed
                </Button>
              </div>
              
              <div className="space-y-2">
                <Link to="/bookings">
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    View All Bookings
                  </Button>
                </Link>
                
                <Link to="/subscription">
                  <Button className="w-full justify-start" variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Subscription
                  </Button>
                </Link>
              </div>
              
              <div className="pt-4 border-t border-border">
                <div className="bg-gradient-feature rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">Need Extra Cleaning?</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Book additional sessions for special occasions or deep cleaning.
                  </p>
                <BookingButton
                  onClick={openBookingForm}
                  text="Book One-Time Service"
                  size="sm"
                  className="btn-hero"
                />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Status */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <CardTitle>Subscription Overview</CardTitle>
            <CardDescription>Your current plan and billing information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-feature rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">Current Plan</h4>
                <p className="text-2xl font-bold text-primary">
                  {user.subscription?.planName || 'Standard'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user.subscription?.planType === 'Standard' ? '5 visits per week' : 
                   user.subscription?.planType === 'Premium' ? 'Daily visits' : '2 visits per week'}
                </p>
              </div>
              
              <div className="bg-gradient-feature rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">Monthly Cost</h4>
                <p className="text-2xl font-bold text-primary">
                  ₹{user.subscription?.price?.toLocaleString() || '3,499'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user.subscription?.autoRenewal ? 'Auto-renewal enabled' : 'Auto-renewal disabled'}
                </p>
              </div>
              
              <div className="bg-gradient-feature rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">Next Billing</h4>
                <p className="text-2xl font-bold text-primary">
                  {user.subscription?.nextBillingDate ? 
                    new Date(user.subscription.nextBillingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) :
                    'Dec 15'
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  {user.subscription?.nextBillingDate ? 
                    new Date(user.subscription.nextBillingDate).getFullYear().toString() :
                    '2024'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}