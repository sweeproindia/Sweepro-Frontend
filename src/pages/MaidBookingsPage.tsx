import { MaidDashboardLayout } from '@/components/dashboard/MaidDashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    Filter,
    MapPin,
    Plus,
    Search,
    User
} from 'lucide-react';
import { useState } from 'react';

interface Booking {
  id: number;
  date: string;
  time: string;
  client: string;
  address: string;
  status: 'upcoming' | 'recent' | 'completed' | 'pending' | 'cancelled';
  duration: string;
  earnings: string;
  clientPhone?: string;
  specialInstructions?: string;
  rating?: number;
  review?: string;
}

const allBookings: Booking[] = [
  // Upcoming Bookings
  {
    id: 1,
    date: 'Tomorrow',
    time: '10:00 AM',
    client: 'Maria Garcia',
    address: '456 Oak Ave, City',
    status: 'upcoming',
    duration: '3 hours',
    earnings: '₹450',
    clientPhone: '+91 98765 43210',
    specialInstructions: 'Focus on kitchen and bathroom cleaning'
  },
  {
    id: 2,
    date: 'Dec 18',
    time: '2:00 PM',
    client: 'David Wilson',
    address: '789 Pine Rd, City',
    status: 'upcoming',
    duration: '3 hours',
    earnings: '₹450',
    clientPhone: '+91 98765 43211'
  },
  {
    id: 3,
    date: 'Dec 20',
    time: '10:00 AM',
    client: 'Anna White',
    address: '987 Cedar Ln, City',
    status: 'upcoming',
    duration: '3 hours',
    earnings: '₹450',
    clientPhone: '+91 98765 43212'
  },
  {
    id: 4,
    date: 'Dec 22',
    time: '2:00 PM',
    client: 'Lisa Brown',
    address: '321 Elm St, City',
    status: 'upcoming',
    duration: '3 hours',
    earnings: '₹450',
    clientPhone: '+91 98765 43213'
  },

  // Recent Bookings
  {
    id: 5,
    date: 'Today',
    time: '2:00 PM',
    client: 'John Smith',
    address: '123 Main St, City',
    status: 'recent',
    duration: '3 hours',
    earnings: '₹450',
    clientPhone: '+91 98765 43214',
    rating: 5,
    review: 'Excellent service! Very thorough cleaning.'
  },
  {
    id: 6,
    date: 'Yesterday',
    time: '10:00 AM',
    client: 'Mike Davis',
    address: '654 Maple Dr, City',
    status: 'recent',
    duration: '3 hours',
    earnings: '₹450',
    clientPhone: '+91 98765 43215',
    rating: 4,
    review: 'Good work, very professional.'
  },

  // Completed Bookings
  {
    id: 7,
    date: 'Dec 15',
    time: '2:00 PM',
    client: 'Sarah Johnson',
    address: '147 Oak St, City',
    status: 'completed',
    duration: '3 hours',
    earnings: '₹450',
    clientPhone: '+91 98765 43216',
    rating: 5,
    review: 'Amazing service! Will book again.'
  },
  {
    id: 8,
    date: 'Dec 14',
    time: '10:00 AM',
    client: 'Robert Chen',
    address: '258 Pine Ave, City',
    status: 'completed',
    duration: '3 hours',
    earnings: '₹450',
    clientPhone: '+91 98765 43217',
    rating: 4,
    review: 'Very satisfied with the cleaning.'
  },

  // Pending Bookings
  {
    id: 9,
    date: 'Dec 25',
    time: '10:00 AM',
    client: 'Emma Wilson',
    address: '369 Cedar Rd, City',
    status: 'pending',
    duration: '3 hours',
    earnings: '₹450',
    clientPhone: '+91 98765 43218'
  },
  {
    id: 10,
    date: 'Dec 27',
    time: '2:00 PM',
    client: 'James Miller',
    address: '741 Elm Ave, City',
    status: 'pending',
    duration: '3 hours',
    earnings: '₹450',
    clientPhone: '+91 98765 43219'
  }
];

export default function MaidBookingsPage() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'recent' | 'completed' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBookings = allBookings.filter(booking => {
    const matchesFilter = selectedFilter === 'all' || booking.status === selectedFilter;
    const matchesSearch = booking.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-primary-light text-primary';
      case 'recent':
        return 'bg-success-light text-success';
      case 'completed':
        return 'bg-success-light text-success';
      case 'pending':
        return 'bg-warning/20 text-warning';
      case 'cancelled':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Calendar className="h-4 w-4" />;
      case 'recent':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <MaidDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="fade-in">
          <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track all your cleaning appointments
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 slide-up">
          <Card className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold text-foreground">4</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold text-foreground">6</p>
                </div>
                <Clock className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-foreground">127</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Earnings</p>
                  <p className="text-2xl font-bold text-foreground">₹12,450</p>
                </div>
                <DollarSign className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="dashboard-card slide-up">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filter by:</span>
                <div className="flex space-x-2">
                  {(['all', 'upcoming', 'recent', 'completed', 'pending'] as const).map((filter) => (
                    <Button
                      key={filter}
                      variant={selectedFilter === filter ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedFilter(filter)}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by client or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>
                  {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} found
                </CardDescription>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Availability
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="border border-border rounded-lg p-6 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{booking.client}</h3>
                          <p className="text-sm text-muted-foreground">{booking.date} at {booking.time}</p>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{booking.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{booking.duration}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{booking.earnings}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{booking.clientPhone}</span>
                        </div>
                      </div>

                      {booking.specialInstructions && (
                        <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                          <p className="text-sm font-medium text-foreground mb-1">Special Instructions:</p>
                          <p className="text-sm text-muted-foreground">{booking.specialInstructions}</p>
                        </div>
                      )}

                      {booking.rating && (
                        <div className="mb-4 p-3 bg-success/10 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium">Client Rating:</span>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={`text-sm ${i < booking.rating! ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                                  ★
                                </span>
                              ))}
                              <span className="text-sm text-muted-foreground">({booking.rating}/5)</span>
                            </div>
                          </div>
                          {booking.review && (
                            <p className="text-sm text-muted-foreground italic">"{booking.review}"</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      {booking.status === 'upcoming' && (
                        <Button size="sm" variant="outline">
                          Start Service
                        </Button>
                      )}
                      {booking.status === 'recent' && (
                        <Button size="sm" variant="outline">
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredBookings.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No bookings found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search terms.' : 'No bookings match the selected filter.'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common booking management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Set Availability
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                View Schedule
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <DollarSign className="h-4 w-4 mr-2" />
                Earnings Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MaidDashboardLayout>
  );
} 