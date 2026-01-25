import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { apiRequest, HttpMethod, API_ENDPOINTS } from '@/services/api';
import { 
  Clock, 
  Users, 
  Calendar, 
  Play,
  BarChart3,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Timer,
  User,
  Mail,
  Phone
} from 'lucide-react';

interface CustomerTimeSlot {
  customerId: string;
  customerName: string;
  maidName: string;
  timeSlot: string;
  formattedTimeSlot: string;
  parsedHour: number;
  nextServiceTime: string;
  requestCreationTime: string;
  hoursUntilRequest: number;
}

interface UpcomingRequest {
  id: string;
  bookingId: string;
  customerName: string;
  maidName: string;
  timeSlot: string;
  rawTimeSlot: string;
  serviceName: string;
  scheduledAt: string;
  expiresAt: string;
  status: string;
  createdAt: string;
}

interface Statistics {
  totalActiveAssignments: number;
  todayRequests: number;
  tomorrowRequests: number;
  pendingRequests: number;
}

export const AdminAutomaticAssignmentsSection: React.FC = () => {
  const [customerTimeSlots, setCustomerTimeSlots] = useState<CustomerTimeSlot[]>([]);
  const [upcomingRequests, setUpcomingRequests] = useState<UpcomingRequest[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    totalActiveAssignments: 0,
    todayRequests: 0,
    tomorrowRequests: 0,
    pendingRequests: 0
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchAllData();
    // Set up polling for real-time updates
    const interval = setInterval(fetchAllData, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchCustomerTimeSlots(),
        fetchUpcomingRequests(),
        fetchStatistics()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerTimeSlots = async () => {
    try {
      const response = await apiRequest(
        API_ENDPOINTS.AUTOMATIC_ASSIGNMENTS.CUSTOMER_TIMESLOTS,
        {
          method: HttpMethod.GET,
          requiresAuth: true
        }
      );

      setCustomerTimeSlots(response.data.customers);
    } catch (error) {
      console.error('Error fetching customer time slots:', error);
      toast.error('Failed to fetch customer time slots');
    }
  };

  const fetchUpcomingRequests = async () => {
    try {
      const response = await apiRequest(
        API_ENDPOINTS.AUTOMATIC_ASSIGNMENTS.UPCOMING,
        {
          method: HttpMethod.GET,
          requiresAuth: true
        }
      );

      setUpcomingRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching upcoming requests:', error);
      toast.error('Failed to fetch upcoming requests');
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await apiRequest(
        API_ENDPOINTS.AUTOMATIC_ASSIGNMENTS.STATISTICS,
        {
          method: HttpMethod.GET,
          requiresAuth: true
        }
      );

      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Failed to fetch statistics');
    }
  };

  const triggerManualProcessing = async () => {
    setProcessing(true);
    try {
      const response = await apiRequest(
        API_ENDPOINTS.AUTOMATIC_ASSIGNMENTS.PROCESS,
        {
          method: HttpMethod.POST,
          requiresAuth: true
        }
      );

      if (response.success) {
        toast.success(`Processing completed! Created ${response.data.created} requests`);
      } else {
        toast.error('Processing failed');
      }

      // Refresh data
      await fetchAllData();
    } catch (error) {
      console.error('Error triggering manual processing:', error);
      toast.error('Failed to trigger automatic processing');
    } finally {
      setProcessing(false);
    }
  };

  const formatTimeUntilRequest = (hours: number) => {
    if (hours < 0) return 'Overdue';
    if (hours < 1) return 'Less than 1 hour';
    if (hours < 24) return `${hours} hours`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  };

  const getStatusColor = (hours: number) => {
    if (hours < 0) return 'text-red-600 bg-red-50';
    if (hours < 2) return 'text-orange-600 bg-orange-50';
    if (hours < 12) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  if (loading) {
    return (
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Automatic Assignment System
          </CardTitle>
          <CardDescription>Manage automatic assignment requests based on customer time slots</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading automatic assignments...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Assignments</p>
                <p className="text-2xl font-bold">{statistics.totalActiveAssignments}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Requests</p>
                <p className="text-2xl font-bold">{statistics.todayRequests}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tomorrow's Requests</p>
                <p className="text-2xl font-bold">{statistics.tomorrowRequests}</p>
              </div>
              <Timer className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold">{statistics.pendingRequests}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="dashboard-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Automatic Assignment System
              </CardTitle>
              <CardDescription>
                Automatic assignment requests are created 12 hours before customer time slots
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAllData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={triggerManualProcessing}
                disabled={processing}
                className="bg-primary hover:bg-primary/90"
              >
                {processing ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Process Now
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="timeslots" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="timeslots">Customer Time Slots</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming Requests</TabsTrigger>
            </TabsList>

            <TabsContent value="timeslots" className="space-y-4">
              <div className="space-y-4">
                {customerTimeSlots.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No Customer Time Slots</h3>
                    <p className="text-sm text-muted-foreground">
                      No active customer assignments with time slots found.
                    </p>
                  </div>
                ) : (
                  customerTimeSlots.map((customer) => (
                    <Card key={customer.customerId} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="bg-blue-100 p-2 rounded-full">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{customer.customerName}</h4>
                                <p className="text-sm text-gray-500">Assigned to: {customer.maidName}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Time Slot</p>
                                <p className="font-medium">{customer.formattedTimeSlot}</p>
                                <p className="text-xs text-gray-400">Raw: {customer.timeSlot}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Next Service</p>
                                <p className="font-medium">
                                  {new Date(customer.nextServiceTime).toLocaleDateString()} at{' '}
                                  {new Date(customer.nextServiceTime).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Request Creation</p>
                                <p className="font-medium">
                                  {new Date(customer.requestCreationTime).toLocaleDateString()} at{' '}
                                  {new Date(customer.requestCreationTime).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="ml-4">
                            <Badge 
                              className={`${getStatusColor(customer.hoursUntilRequest)} border-0`}
                            >
                              {formatTimeUntilRequest(customer.hoursUntilRequest)}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-4">
              <div className="space-y-4">
                {upcomingRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No Upcoming Requests</h3>
                    <p className="text-sm text-muted-foreground">
                      No upcoming assignment requests found.
                    </p>
                  </div>
                ) : (
                  upcomingRequests.map((request) => (
                    <Card key={request.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="bg-green-100 p-2 rounded-full">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{request.customerName}</h4>
                                <p className="text-sm text-gray-500">Service: {request.serviceName}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Assigned Homecare Partner</p>
                                <p className="font-medium">{request.maidName}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Time Slot</p>
                                <p className="font-medium">{request.timeSlot}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Scheduled At</p>
                                <p className="font-medium">
                                  {new Date(request.scheduledAt).toLocaleDateString()} at{' '}
                                  {new Date(request.scheduledAt).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Expires At</p>
                                <p className="font-medium">
                                  {new Date(request.expiresAt).toLocaleDateString()} at{' '}
                                  {new Date(request.expiresAt).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="ml-4">
                            <Badge variant="secondary">
                              {request.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
