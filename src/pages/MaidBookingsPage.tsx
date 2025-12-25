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
  RefreshCcw,
  Search,
  User,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useBookings, BookingFilter } from '@/hooks/useBookings';
import MaidQrDialog from '@/components/qr/MaidQrDialog';

export default function MaidBookingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [qrOpen, setQrOpen] = useState(false);
  const {
    bookings,
    stats,
    loading,
    error,
    filter,
    setFilter,
    refreshBookings,
    updateBookingStatus,
  } = useBookings('MAID');

  const filteredBookings = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return bookings;
    return bookings.filter((b) => {
      const name = b.customer?.name?.toLowerCase() || '';
      const addr = b.serviceAddress?.toLowerCase() || '';
      const service = b.service?.name?.toLowerCase() || '';
      return name.includes(term) || addr.includes(term) || service.includes(term);
    });
  }, [bookings, searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'ASSIGNED':
        return 'bg-primary/15 text-primary';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300';
      case 'COMPLETED':
        return 'bg-success/15 text-success';
      case 'PENDING':
        return 'bg-warning/20 text-warning';
      case 'CANCELLED':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'ASSIGNED':
        return <Calendar className="h-4 w-4" />;
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'PENDING':
      case 'CANCELLED':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const onStartService = async (bookingId: string) => {
    await updateBookingStatus(bookingId, 'IN_PROGRESS');
  };

  const onCompleteService = async (bookingId: string) => {
    await updateBookingStatus(bookingId, 'COMPLETED');
  };

  const filterOptions: { key: BookingFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'scheduled', label: 'Scheduled' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <MaidDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="fade-in flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">My Assignments</h1>
            <p className="text-muted-foreground mt-2">Manage and track all your cleaning appointments</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button variant="outline" size="sm" onClick={refreshBookings} disabled={loading} className="w-full sm:w-auto">
              <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button size="sm" onClick={() => setQrOpen(true)} className="w-full sm:w-auto">
              Show My QR
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 slide-up">
          <Card className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.scheduled ?? 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.completed ?? 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.cancelled ?? 0}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.total ?? 0}</p>
                </div>
                <DollarSign className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="dashboard-card slide-up">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filter by:</span>
                <div className="flex space-x-2">
                  {filterOptions.map((opt) => (
                    <Button
                      key={opt.key}
                      variant={filter === opt.key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter(opt.key)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="relative w-full md:w-auto">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by customer, address or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-80 pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>
                  {loading ? 'Loading...' : `${filteredBookings.length} booking${filteredBookings.length !== 1 ? 's' : ''} found`}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={refreshBookings} disabled={loading} className="w-full md:w-auto">
                <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
                <Button variant="outline" size="sm" className="ml-auto" onClick={refreshBookings} disabled={loading}>
                  Retry
                </Button>
              </div>
            )}

            <div className="space-y-4">
              {!loading && filteredBookings.map((booking) => (
                <div key={booking.id} className="border border-border rounded-2xl p-6 hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{booking.customer?.name || 'Customer'}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(booking.scheduledAt).toLocaleDateString()} at {new Date(booking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {booking.serviceAddress && (
                              <p className="text-xs text-muted-foreground">{booking.serviceAddress}</p>
                            )}
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(booking.status)} w-fit`}>
                          {booking.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{booking.serviceAddress}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{booking.timeSlot || `${booking.estimatedDuration || 180} mins`}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">₹{(booking.finalAmount ?? booking.totalAmount ?? 0).toLocaleString()}</span>
                        </div>
                        {booking.customer?.phone && (
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{booking.customer.phone}</span>
                          </div>
                        )}
                      </div>

                      {booking.specialInstructions && (
                        <div className="mb-2 p-3 bg-muted/30 rounded-lg">
                          <p className="text-sm font-medium text-foreground mb-1">Special Instructions:</p>
                          <p className="text-sm text-muted-foreground break-words">{booking.specialInstructions}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex w-full flex-col space-y-2 min-w-[160px] lg:w-[180px]">
                      <Button size="sm" variant="outline" className="w-full">
                        View Details
                      </Button>
                      {(booking.status === 'CONFIRMED' || booking.status === 'ASSIGNED') && (
                        <Button size="sm" variant="outline" onClick={() => onStartService(booking.id)} className="w-full">
                          Start Service
                        </Button>
                      )}
                      {booking.status === 'IN_PROGRESS' && (
                        <Button size="sm" variant="outline" onClick={() => onCompleteService(booking.id)} className="w-full">
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {!loading && filteredBookings.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No bookings found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search terms.' : 'No bookings match the selected filter.'}
                  </p>
                </div>
              )}

              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-muted-foreground">Loading bookings...</span>
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
      <MaidQrDialog open={qrOpen} onOpenChange={setQrOpen} />
    </MaidDashboardLayout>
  );
}
