import { MaidDashboardLayout } from '@/components/dashboard/MaidDashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Calendar, CheckCircle, Clock, CreditCard, MessageCircle, Star, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const maidStats = [
  {
    title: 'Maid Details',
    value: 'Sarah Johnson',
    description: 'Professional Cleaner • 4.8★ Rating',
    icon: User,
    color: 'text-primary'
  },
  {
    title: 'Upcoming Bookings',
    value: '5',
    description: 'Next: Tomorrow 10:00 AM',
    icon: Calendar,
    color: 'text-success'
  },
  {
    title: 'Total Visits',
    value: '127',
    description: 'This month: 23 completed',
    icon: CheckCircle,
    color: 'text-warning'
  },
  {
    title: 'Earnings',
    value: '₹12,450',
    description: 'This month: ₹8,200',
    icon: CreditCard,
    color: 'text-primary'
  }
];

const recentBookings = [
  {
    id: 1,
    date: 'Today',
    time: '2:00 PM',
    client: 'John Smith',
    address: '123 Main St, City',
    status: 'completed',
    duration: '3 hours',
    earnings: '₹450'
  },
  {
    id: 2,
    date: 'Tomorrow',
    time: '10:00 AM',
    client: 'Maria Garcia',
    address: '456 Oak Ave, City',
    status: 'scheduled',
    duration: '3 hours',
    earnings: '₹450'
  },
  {
    id: 3,
    date: 'Dec 16',
    time: '2:00 PM',
    client: 'David Wilson',
    address: '789 Pine Rd, City',
    status: 'scheduled',
    duration: '3 hours',
    earnings: '₹450'
  }
];

const myBookings = [
  {
    id: 1,
    date: 'Dec 18',
    time: '10:00 AM',
    client: 'Lisa Brown',
    address: '321 Elm St, City',
    status: 'confirmed',
    duration: '3 hours',
    earnings: '₹450'
  },
  {
    id: 2,
    date: 'Dec 19',
    time: '2:00 PM',
    client: 'Mike Davis',
    address: '654 Maple Dr, City',
    status: 'pending',
    duration: '3 hours',
    earnings: '₹450'
  },
  {
    id: 3,
    date: 'Dec 20',
    time: '10:00 AM',
    client: 'Anna White',
    address: '987 Cedar Ln, City',
    status: 'confirmed',
    duration: '3 hours',
    earnings: '₹450'
  }
];

export default function MaidDashboard() {
  return (
    <MaidDashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="fade-in">
          <h1 className="text-3xl font-bold text-foreground">Welcome back, Sarah!</h1>
          <p className="text-muted-foreground mt-2">
            Here's your cleaning schedule and earnings overview for today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 slide-up">
          {maidStats.map((stat, index) => (
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
                  <CardDescription>Your recent and upcoming cleaning sessions</CardDescription>
                </div>
                <Link to="/maid-bookings">
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
                      <p className="text-sm text-muted-foreground">{booking.client} • {booking.address}</p>
                      <p className="text-xs text-muted-foreground">{booking.duration} • {booking.earnings}</p>
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

          {/* My Bookings */}
          <Card className="dashboard-card slide-up">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Bookings</CardTitle>
                  <CardDescription>Your confirmed and pending bookings</CardDescription>
                </div>
                <Link to="/maid-bookings">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {myBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      booking.status === 'confirmed' ? 'bg-success' : 
                      booking.status === 'pending' ? 'bg-warning' : 'bg-primary'
                    }`} />
                    <div>
                      <p className="font-medium text-foreground">{booking.date} at {booking.time}</p>
                      <p className="text-sm text-muted-foreground">{booking.client} • {booking.address}</p>
                      <p className="text-xs text-muted-foreground">{booking.duration} • {booking.earnings}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    booking.status === 'confirmed' ? 'bg-success-light text-success' :
                    booking.status === 'pending' ? 'bg-warning/20 text-warning' : 'bg-primary-light text-primary'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Maid Profile & Support */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Maid Profile */}
          <Card className="dashboard-card slide-up">
            <CardHeader>
              <CardTitle>Maid Profile</CardTitle>
              <CardDescription>Your professional information and ratings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gradient-feature rounded-lg">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Sarah Johnson</h4>
                  <p className="text-sm text-muted-foreground">Professional Cleaner</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">4.8</span>
                    <span className="text-xs text-muted-foreground">(127 reviews)</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-sm font-medium text-foreground">Experience</p>
                  <p className="text-lg font-bold text-primary">3+ Years</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-sm font-medium text-foreground">Specialization</p>
                  <p className="text-lg font-bold text-primary">Deep Cleaning</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Set Availability
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Support Chat */}
          <Card className="dashboard-card slide-up">
            <CardHeader>
              <CardTitle>Support Chat</CardTitle>
              <CardDescription>Get help with bookings and technical issues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-feature rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Live Support</h4>
                    <p className="text-sm text-muted-foreground">Available 24/7</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Need help with your bookings, payments, or have any questions? Our support team is here to help you.
                </p>
                <Button className="btn-hero w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start Chat
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-success-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Booking Issue</p>
                      <p className="text-xs text-muted-foreground">Resolved 2 hours ago</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">Resolved</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-warning rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-warning-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Payment Query</p>
                      <p className="text-xs text-muted-foreground">Waiting for response</p>
                    </div>
                  </div>
                  <Badge className="text-xs">Pending</Badge>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Report Issue
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Payment Help
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Account Settings
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Overview */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <CardTitle>Earnings Overview</CardTitle>
            <CardDescription>Your monthly earnings and performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-feature rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">This Month</h4>
                <p className="text-2xl font-bold text-primary">₹8,200</p>
                <p className="text-sm text-muted-foreground">23 bookings completed</p>
              </div>
              
              <div className="bg-gradient-feature rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">Average Rating</h4>
                <p className="text-2xl font-bold text-primary">4.8★</p>
                <p className="text-sm text-muted-foreground">127 reviews</p>
              </div>
              
              <div className="bg-gradient-feature rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">Completion Rate</h4>
                <p className="text-2xl font-bold text-primary">98%</p>
                <p className="text-sm text-muted-foreground">127/130 bookings</p>
              </div>
              
              <div className="bg-gradient-feature rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">Total Earnings</h4>
                <p className="text-2xl font-bold text-primary">₹12,450</p>
                <p className="text-sm text-muted-foreground">Lifetime earnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MaidDashboardLayout>
  );
} 