import { useEffect, useState } from 'react';
import { MaidDashboardLayout } from '@/components/dashboard/MaidDashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';
import { BookingService, Booking } from '@/services/bookingService';
import { PaymentService, Payment } from '@/services/paymentService';
import { verificationService } from '@/services/verificationService';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Calendar, CheckCircle, Clock, CreditCard, DollarSign, MessageCircle, Star, User, Package, TrendingUp, AlertTriangle, MapPin, Shield, Upload, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MaidBookingRequestsSection } from '@/components/dashboard/MaidBookingRequestsSection';
import { MaidAssignmentRequestsSection } from '@/components/dashboard/MaidAssignmentRequestsSection';

// Service interface to match backend
interface Service {
  id: string;
  name: string;
  description: string;
  category: 'CLEANING' | 'DEEP_CLEANING' | 'MAINTENANCE' | 'SPECIAL_EVENT';
  baseDuration: number;
  basePrice: number;
  isActive: boolean;
  bufferTime?: number;
  maxDailyBookings?: number;
  isSubscriptionService: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface MaidStats {
  totalBookings: number;
  completedBookings: number;
  upcomingBookings: number;
  totalEarnings: number;
  monthlyEarnings: number;
  averageRating: number;
  totalReviews: number;
  completionRate: number;
}

export default function MaidDashboardEnhanced() {
  const { user, refreshUser, isAuthenticated } = useUser();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MaidStats>({
    totalBookings: 0,
    completedBookings: 0,
    upcomingBookings: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    averageRating: 4.8,
    totalReviews: 0,
    completionRate: 0
  });
  
  // Real verification status - fetched from backend
  const [isVerified, setIsVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED'>('NOT_SUBMITTED');
  const [verificationData, setVerificationData] = useState<any>(null);
  const [showVerificationAlert, setShowVerificationAlert] = useState(true);
  const [verificationApprovedTime, setVerificationApprovedTime] = useState<number | null>(null);

  useEffect(() => {
    if (user && isAuthenticated && user.role === 'MAID') {
      fetchMaidDashboardData();
      fetchVerificationStatus();
    }
  }, [user, isAuthenticated]);

  const fetchVerificationStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/documents/maid-verification-status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const data = result.data;
          
          // Transform backend data to frontend format
          const transformedDocuments: any = {};
          
          if (data.documents) {
            // Map backend document types to frontend
            const docMapping = {
              'AADHAR_CARD': 'aadharCard',
              'PAN_CARD': 'panCard', 
              'ADDRESS_PROOF': 'electricityBill'
            };
            
            data.documents.forEach((doc: any) => {
              const frontendKey = docMapping[doc.type as keyof typeof docMapping];
              if (frontendKey) {
                transformedDocuments[frontendKey] = {
                  id: doc.id,
                  status: doc.verificationStatus,
                  rejectionReason: doc.rejectionReason,
                  filename: doc.fileName,
                  uploadedAt: doc.createdAt,
                  canReupload: doc.verificationStatus === 'REJECTED'
                };
              }
            });
          }
          
          setVerificationStatus(data.overallStatus || 'NOT_SUBMITTED');
          setIsVerified(data.overallStatus === 'APPROVED');
          
          // Handle 24-hour alert logic for APPROVED status
          if (data.overallStatus === 'APPROVED') {
            // Check if verification was approved and store the time
            const storedApprovedTime = localStorage.getItem(`maid_verification_approved_${user?.id}`);
            if (!storedApprovedTime) {
              // First time approval - store the time
              const currentTime = Date.now();
              localStorage.setItem(`maid_verification_approved_${user?.id}`, currentTime.toString());
              setVerificationApprovedTime(currentTime);
              setShowVerificationAlert(true);
            } else {
              // Check if 24 hours have passed
              const approvedTime = parseInt(storedApprovedTime);
              const currentTime = Date.now();
              const hoursPassed = (currentTime - approvedTime) / (1000 * 60 * 60);
              
              if (hoursPassed < 24) {
                setShowVerificationAlert(true);
              } else {
                // Hide alert if 24 hours have passed
                setShowVerificationAlert(false);
              }
              setVerificationApprovedTime(approvedTime);
            }
          } else {
            // For other statuses, always show the alert
            setShowVerificationAlert(true);
          }
          
          setVerificationData({
            ...data,
            documents: transformedDocuments
          });
        }
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
    }
  };

  const fetchMaidDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch maid-specific data in parallel
      const [bookingsResponse, paymentsResponse] = await Promise.allSettled([
        BookingService.getMaidBookings(), // Maid assignments
        PaymentService.getUserPayments()
      ]);

      // Handle maid bookings/assignments
      if (bookingsResponse.status === 'fulfilled' && bookingsResponse.value.success) {
        const bookingsData = Array.isArray(bookingsResponse.value.data) ? 
          bookingsResponse.value.data : [];
        setBookings(bookingsData);
      }

      // Handle payments (earnings)
      if (paymentsResponse.status === 'fulfilled' && paymentsResponse.value.success) {
        const paymentsData = Array.isArray(paymentsResponse.value.data) ? 
          paymentsResponse.value.data : [];
        setPayments(paymentsData);
      }

      // Calculate stats after data is loaded
      calculateMaidStats();

    } catch (error) {
      console.error('Error fetching maid dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data. Please try refreshing.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMaidStats = () => {
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
    const upcomingBookings = bookings.filter(b => 
      b.status === 'PENDING' || b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS'
    ).length;
    
    const totalEarnings = payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0);
    
    // Calculate monthly earnings (current month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyEarnings = payments
      .filter(p => {
        const paymentDate = new Date(p.createdAt);
        return p.status === 'COMPLETED' && 
               paymentDate.getMonth() === currentMonth &&
               paymentDate.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + p.amount, 0);
    
    const completionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;

    setStats({
      totalBookings,
      completedBookings,
      upcomingBookings,
      totalEarnings,
      monthlyEarnings,
      averageRating: 4.8, // This would come from a rating system
      totalReviews: completedBookings, // Assuming 1 review per completed booking
      completionRate
    });
  };

  useEffect(() => {
    if (bookings.length > 0 || payments.length > 0) {
      calculateMaidStats();
    }
  }, [bookings, payments]);

  if (loading) {
    return (
      <MaidDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MaidDashboardLayout>
    );
  }

  if (!user || !isAuthenticated || user.role !== 'MAID') {
    return (
      <MaidDashboardLayout>
        <div className="text-center p-8">
          <p className="text-muted-foreground">Please log in as a maid to view this dashboard.</p>
        </div>
      </MaidDashboardLayout>
    );
  }

  return (
    <MaidDashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="fade-in">
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground mt-2">
            Here's your comprehensive cleaning schedule, earnings overview, and performance metrics.
          </p>
        </div>
     
        {/* Verification Status Banners */}
        {verificationStatus === 'NOT_SUBMITTED' && (
          <Alert className="border-2 border-warning bg-gradient-to-r from-warning/5 to-orange/5">
            <Shield className="h-5 w-5 text-warning" />
            <div className="flex items-center justify-between w-full">
              <div>
                <h4 className="font-semibold text-lg mb-2">Complete Your Profile Verification</h4>
                <AlertDescription className="text-base">
                  To start receiving cleaning assignments and earn money, please complete your profile verification by uploading your documents (Aadhar card, PAN card, and electricity bill for address verification).
                </AlertDescription>
              </div>
              <div className="flex gap-3 ml-4">
                <Link to="/maid-verification">
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    <Upload className="h-4 w-4 mr-2" />
                    Verify Now
                  </Button>
                </Link>
              </div>
            </div>
          </Alert>
        )}

        {verificationStatus === 'PENDING' && (
          <Alert className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <h4 className="font-semibold text-lg mb-2 text-blue-800">Verification Under Review</h4>
              <AlertDescription className="text-blue-700">
                Your verification documents are being reviewed by our admin team. This typically takes 24-48 hours. You'll receive a notification once the review is complete.
              </AlertDescription>
            </div>
          </Alert>
        )}

        {verificationStatus === 'APPROVED' && showVerificationAlert && (
          <Alert className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="flex items-center justify-between w-full">
              <div>
                <h4 className="font-semibold text-lg mb-2 text-green-800">🎉 Welcome to Sweep Pro!</h4>
                <AlertDescription className="text-green-700">
                  Congratulations! Your profile has been verified and approved. You can now receive cleaning assignments and start earning money. Your account is fully active!
                </AlertDescription>
              </div>
              <div className="flex gap-3 ml-4">
                <Link to="/maid-bookings">
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Assignments
                  </Button>
                </Link>
              </div>
            </div>
          </Alert>
        )}

        {verificationStatus === 'REJECTED' && (
          <Alert className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-rose-50">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div className="flex items-center justify-between w-full">
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2 text-red-800">Verification Rejected</h4>
                <AlertDescription className="text-red-700">
                  Some of your verification documents have been rejected. Please review the feedback below and upload the corrected documents.
                </AlertDescription>
                
                {/* Individual Document Status */}
                {verificationData?.documents && (
                  <div className="mt-3 space-y-2">
                    {verificationData.documents.aadharCard?.status === 'REJECTED' && (
                      <div className="p-2 bg-red-100 border border-red-200 rounded text-sm">
                        <strong className="text-red-800">Aadhar Card - Rejected</strong>
                        {verificationData.documents.aadharCard.rejectionReason && (
                          <p className="text-red-600 mt-1">{verificationData.documents.aadharCard.rejectionReason}</p>
                        )}
                      </div>
                    )}
                    {verificationData.documents.panCard?.status === 'REJECTED' && (
                      <div className="p-2 bg-red-100 border border-red-200 rounded text-sm">
                        <strong className="text-red-800">PAN Card - Rejected</strong>
                        {verificationData.documents.panCard.rejectionReason && (
                          <p className="text-red-600 mt-1">{verificationData.documents.panCard.rejectionReason}</p>
                        )}
                      </div>
                    )}
                    {verificationData.documents.electricityBill?.status === 'REJECTED' && (
                      <div className="p-2 bg-red-100 border border-red-200 rounded text-sm">
                        <strong className="text-red-800">Address Proof - Rejected</strong>
                        {verificationData.documents.electricityBill.rejectionReason && (
                          <p className="text-red-600 mt-1">{verificationData.documents.electricityBill.rejectionReason}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-3 ml-4">
                <Link to="/maid-verification">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    <Upload className="h-4 w-4 mr-2" />
                    Re-upload Documents
                  </Button>
                </Link>
              </div>
            </div>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 slide-up">
          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Bookings
              </CardTitle>
              <Calendar className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.upcomingBookings} upcoming
              </p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed Services
              </CardTitle>
              <CheckCircle className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.completedBookings}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.completionRate}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Rating
              </CardTitle>
              <Star className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.averageRating}★</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalReviews} reviews
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Assignment Requests Section - Prominently displayed for verified maids */}
        {/* {isVerified && (
          <div className="slide-up">
            <Card className="dashboard-card border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-blue-50 dark:to-blue-950/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Bell className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Assignment Requests</CardTitle>
                      <CardDescription>New cleaning assignments waiting for your response</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <MaidBookingRequestsSection onRefresh={fetchMaidDashboardData} />
              </CardContent>
            </Card>
          </div>
        )} */}

        {/* Customer Assignment Requests Section */}
        <div className="mb-8">
          <Card className="dashboard-card slide-up">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Customer Assignment Requests</CardTitle>
                    <CardDescription>New customer assignment requests waiting for your response</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-600">
                  New
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <MaidAssignmentRequestsSection onRefresh={fetchMaidDashboardData} />
            </CardContent>
          </Card>
        </div>

        {/* Add automatic booking assignment requests for maids */}
        <div className="mb-8">
          <Card className="dashboard-card slide-up">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Bell className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Automatic Booking Assignment Requests</CardTitle>
                    <CardDescription>Accept or reject automatic bookings assigned to you</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-600">
                  Auto
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <MaidBookingRequestsSection onRefresh={fetchMaidDashboardData} />
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings and Quick Actions Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* Recent Bookings */}
          <Card className="dashboard-card slide-up">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Recent Assignments
                  </CardTitle>
                  <CardDescription>Your recent and upcoming cleaning sessions</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    {stats.totalBookings} Total
                  </Badge>
                  <Link to="/maid-bookings">
                    <Button variant="outline" size="sm">
                      View All
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.slice(0, 2).map((booking) => (
                    <div key={booking.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-gradient-to-r from-card to-muted/20">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`w-4 h-4 rounded-full mt-1 flex-shrink-0 ${
                            booking.status === 'COMPLETED' ? 'bg-success' : 
                            booking.status === 'PENDING' || booking.status === 'CONFIRMED' ? 'bg-primary' :
                            booking.status === 'IN_PROGRESS' ? 'bg-warning' : 'bg-destructive'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <p className="font-semibold text-foreground text-lg">
                                {booking.service?.name || 'Cleaning Service'}
                              </p>
                              <Badge variant={
                                booking.status === 'COMPLETED' ? 'default' :
                                booking.status === 'PENDING' || booking.status === 'CONFIRMED' ? 'secondary' :
                                booking.status === 'IN_PROGRESS' ? 'outline' : 'destructive'
                              }>
                                {booking.status}
                              </Badge>
                            </div>
                            
                            {/* Enhanced Assignment Details */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="h-4 w-4 text-primary" />
                                  <span className="font-medium">{new Date(booking.scheduledAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="h-4 w-4 text-primary" />
                                  <span>{booking.timeSlot || new Date(booking.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                  {booking.estimatedDuration && (
                                    <span className="text-muted-foreground">({booking.estimatedDuration} mins)</span>
                                  )}
                                </div>
                                {booking.customer?.name && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4 text-primary" />
                                    <span className="font-medium">{booking.customer.name}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                {booking.customer?.phone && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="w-4 h-4 flex items-center justify-center">📞</span>
                                    <span>{booking.customer.phone}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="w-4 h-4 flex items-center justify-center text-green-600">💰</span>
                                  <span className="font-bold text-green-600">₹{(booking.finalAmount || booking.totalAmount).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            
                            {booking.serviceAddress && (
                              <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                <div className="flex items-start gap-2 text-sm">
                                  <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <span className="font-medium text-blue-700 dark:text-blue-300">Service Location:</span>
                                    <p className="text-blue-600 dark:text-blue-400">{booking.serviceAddress}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-semibold text-lg mb-2">No Assignments Yet</h4>
                  <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                    You'll see your cleaning assignments here once customers book your services. Make sure your availability is up to date!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MaidDashboardLayout>
  );
}
