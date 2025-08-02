import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ArrowRight,
    BarChart3,
    Calendar,
    CheckCircle,
    DollarSign,
    Settings,
    Shield,
    Users
} from 'lucide-react';
import { Link } from 'react-router-dom';

const adminStats = [
  {
    title: 'Total Users',
    value: '1,247',
    description: '+12% from last month',
    icon: Users,
    color: 'text-primary'
  },
  {
    title: 'Active Maids',
    value: '89',
    description: '23 available today',
    icon: Shield,
    color: 'text-success'
  },
  {
    title: 'Revenue',
    value: '₹2.4M',
    description: '+8% from last month',
    icon: DollarSign,
    color: 'text-warning'
  },
  {
    title: 'Bookings',
    value: '456',
    description: 'This week',
    icon: Calendar,
    color: 'text-primary'
  }
];

const recentActivities = [
  {
    id: 1,
    type: 'user_registration',
    message: 'New user registered: john.doe@email.com',
    time: '2 minutes ago',
    status: 'completed'
  },
  {
    id: 2,
    type: 'booking_created',
    message: 'New booking created by user #1234',
    time: '5 minutes ago',
    status: 'pending'
  },
  {
    id: 3,
    type: 'maid_verified',
    message: 'Maid Sarah Johnson verified successfully',
    time: '10 minutes ago',
    status: 'completed'
  },
  {
    id: 4,
    type: 'payment_received',
    message: 'Payment received: ₹450 from user #5678',
    time: '15 minutes ago',
    status: 'completed'
  }
];

const systemAlerts = [
  {
    id: 1,
    type: 'warning',
    message: 'Server load is high (85%)',
    time: '5 minutes ago'
  },
  {
    id: 2,
    type: 'info',
    message: 'Database backup completed',
    time: '1 hour ago'
  },
  {
    id: 3,
    type: 'success',
    message: 'New maid onboarding completed',
    time: '2 hours ago'
  }
];

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="fade-in">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage the CleanEase platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 slide-up">
          {adminStats.map((stat, index) => (
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
          {/* Recent Activities */}
          <Card className="dashboard-card slide-up">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Latest platform activities and events</CardDescription>
                </div>
                <Link to="/admin/activities">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      activity.status === 'completed' ? 'bg-success' : 
                      activity.status === 'pending' ? 'bg-warning' : 'bg-primary'
                    }`} />
                    <div>
                      <p className="font-medium text-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activity.status === 'completed' ? 'bg-success-light text-success' :
                    activity.status === 'pending' ? 'bg-warning/20 text-warning' : 'bg-primary-light text-primary'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* System Alerts */}
          <Card className="dashboard-card slide-up">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>System Alerts</CardTitle>
                  <CardDescription>Platform status and notifications</CardDescription>
                </div>
                <Link to="/admin/alerts">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {systemAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      alert.type === 'warning' ? 'bg-warning' : 
                      alert.type === 'info' ? 'bg-primary' : 'bg-success'
                    }`} />
                    <div>
                      <p className="font-medium text-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">{alert.time}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {alert.type}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/admin/users">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
              
              <Link to="/admin/maids">
                <Button className="w-full justify-start" variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Manage Maids
                </Button>
              </Link>
              
              <Link to="/admin/analytics">
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </Link>
              
              <Link to="/admin/settings">
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Platform Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Management */}
          <Card className="dashboard-card slide-up">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Overview of user statistics and management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-feature rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">Active Users</h4>
                  <p className="text-2xl font-bold text-primary">1,247</p>
                  <p className="text-sm text-muted-foreground">+12% this month</p>
                </div>
                
                <div className="bg-gradient-feature rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">New Users</h4>
                  <p className="text-2xl font-bold text-primary">89</p>
                  <p className="text-sm text-muted-foreground">This week</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  View All Users
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify Users
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Maid Management */}
          <Card className="dashboard-card slide-up">
            <CardHeader>
              <CardTitle>Maid Management</CardTitle>
              <CardDescription>Overview of maid statistics and management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-feature rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">Active Maids</h4>
                  <p className="text-2xl font-bold text-primary">89</p>
                  <p className="text-sm text-muted-foreground">23 available today</p>
                </div>
                
                <div className="bg-gradient-feature rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">Pending Verification</h4>
                  <p className="text-2xl font-bold text-primary">12</p>
                  <p className="text-sm text-muted-foreground">Need approval</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  View All Maids
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify Maids
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue & Analytics */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <CardTitle>Revenue & Analytics</CardTitle>
            <CardDescription>Financial overview and performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-feature rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">Monthly Revenue</h4>
                <p className="text-2xl font-bold text-primary">₹2.4M</p>
                <p className="text-sm text-muted-foreground">+8% from last month</p>
              </div>
              
              <div className="bg-gradient-feature rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">Total Bookings</h4>
                <p className="text-2xl font-bold text-primary">456</p>
                <p className="text-sm text-muted-foreground">This week</p>
              </div>
              
              <div className="bg-gradient-feature rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">Success Rate</h4>
                <p className="text-2xl font-bold text-primary">94%</p>
                <p className="text-sm text-muted-foreground">Completed bookings</p>
              </div>
              
              <div className="bg-gradient-feature rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">Customer Satisfaction</h4>
                <p className="text-2xl font-bold text-primary">4.7★</p>
                <p className="text-sm text-muted-foreground">Average rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 