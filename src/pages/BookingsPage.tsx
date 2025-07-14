import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, User, Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const bookings = [
  {
    id: 1,
    date: '2024-12-16',
    time: '10:00 AM',
    duration: '3 hours',
    cleaner: {
      name: 'Sarah Johnson',
      avatar: '/placeholder-avatar.jpg',
      rating: 4.9
    },
    services: ['Regular Cleaning', 'Kitchen Deep Clean'],
    status: 'scheduled',
    address: '123 Main St, Apartment 4B'
  },
  {
    id: 2,
    date: '2024-12-18',
    time: '2:00 PM',
    duration: '3 hours',
    cleaner: {
      name: 'Maria Garcia',
      avatar: '/placeholder-avatar.jpg',
      rating: 4.8
    },
    services: ['Regular Cleaning', 'Bathroom Deep Clean'],
    status: 'scheduled',
    address: '123 Main St, Apartment 4B'
  },
  {
    id: 3,
    date: '2024-12-14',
    time: '10:00 AM',
    duration: '3 hours',
    cleaner: {
      name: 'Sarah Johnson',
      avatar: '/placeholder-avatar.jpg',
      rating: 4.9
    },
    services: ['Regular Cleaning'],
    status: 'completed',
    address: '123 Main St, Apartment 4B'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-success text-success-foreground';
    case 'scheduled':
      return 'bg-primary text-primary-foreground';
    case 'cancelled':
      return 'bg-destructive text-destructive-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export default function BookingsPage() {
  const [filter, setFilter] = useState('all');
  
  // User's preferred time slot from subscription
  const preferredTimeSlot = '10:00 AM';
  const preferredDuration = '3 hours';

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
            <p className="text-muted-foreground mt-2">
              Your preferred time: {preferredTimeSlot} ({preferredDuration}) • Click below to book for tomorrow
            </p>
          </div>
          <Button className="btn-hero">
            <Plus className="h-4 w-4 mr-2" />
            Book Service for Tomorrow
          </Button>
        </div>

        {/* Filters */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <CardTitle>Filter Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {['all', 'scheduled', 'completed', 'cancelled'].map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(status)}
                  className="capitalize"
                >
                  {status === 'all' ? 'All Bookings' : status}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <div className="space-y-4 slide-up">
          {filteredBookings.map((booking, index) => (
            <Card 
              key={booking.id} 
              className="dashboard-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                      {booking.cleaner.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{booking.cleaner.name}</CardTitle>
                      <div className="flex items-center space-x-1 mt-1">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < Math.floor(booking.cleaner.rating) ? 'text-yellow-400' : 'text-gray-300'}>
                              ⭐
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">({booking.cleaner.rating})</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Booking Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm">{new Date(booking.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm">{booking.time} ({booking.duration})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm">{booking.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-sm">{booking.services.length} services</span>
                  </div>
                </div>

                {/* Services */}
                <div>
                  <h4 className="font-medium text-foreground mb-2">Services Included:</h4>
                  <div className="flex flex-wrap gap-2">
                    {booking.services.map((service, index) => (
                      <Badge key={index} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                  {booking.status === 'scheduled' && (
                    <>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Reschedule
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  )}
                  {booking.status === 'completed' && (
                    <Button variant="outline" size="sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Rate & Review
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredBookings.length === 0 && (
          <Card className="dashboard-card text-center py-12">
            <CardContent>
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No bookings found</h3>
              <p className="text-muted-foreground mb-4">
                {filter === 'all' 
                  ? "You don't have any bookings yet. Schedule your first cleaning service!"
                  : `No ${filter} bookings found. Try adjusting your filter.`
                }
              </p>
              {filter === 'all' && (
                <Button className="btn-hero">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Your First Cleaning
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Booking History */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <CardTitle>Booking History</CardTitle>
            <CardDescription>
              Complete history of your cleaning services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Cleaner</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Duration</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(booking.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground">
                        {booking.cleaner.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {booking.duration}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(booking.status)} variant="secondary">
                          {booking.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {booking.status === 'completed' ? 'Excellent service' : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Booking Card */}
        <Card className="dashboard-card slide-up bg-gradient-feature">
          <CardHeader>
            <CardTitle>Quick Booking</CardTitle>
            <CardDescription>
              Your next service will be scheduled at {preferredTimeSlot} for {preferredDuration}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="btn-hero">
                <Plus className="h-4 w-4 mr-2" />
                Book for Tomorrow ({new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()})
              </Button>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule for Specific Date
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Need to change your preferred time slot? Contact support or update in subscription settings.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}