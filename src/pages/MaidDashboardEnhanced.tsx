import { useEffect, useRef, useState } from 'react';
import { MaidDashboardLayout } from '@/components/dashboard/MaidDashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';
import { BookingService, Booking } from '@/services/bookingService';
import { PaymentService, Payment } from '@/services/paymentService';
import { verificationService } from '@/services/verificationService';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, HttpMethod } from '@/services/api';
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
  const [verificationStatus, setVerificationStatus] = useState<'UNKNOWN' | 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED'>('UNKNOWN');
  const [verificationStatusLoaded, setVerificationStatusLoaded] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [showVerificationAlert, setShowVerificationAlert] = useState(true);
  const [verificationApprovedTime, setVerificationApprovedTime] = useState<number | null>(null);
  const hasRefreshedUserAfterApprovalRef = useRef(false);

  const isMaidVerifiedFromProfile = Boolean((user as any)?.profiles?.maid?.isVerified) || ((user as any)?.profiles?.maid?.status === 'ACTIVE');

  const hasFetchedDashboardDataRef = useRef(false);

  useEffect(() => {
    if (user && isAuthenticated && user.role === 'MAID' && !hasFetchedDashboardDataRef.current) {
      hasFetchedDashboardDataRef.current = true;
      fetchMaidDashboardData();
      fetchVerificationStatus();
    }
  }, [user?.id, user?.role, isAuthenticated]);

  const fetchVerificationStatus = async () => {
    try {
      setVerificationStatusLoaded(false);
      const result = await apiRequest('/documents/maid-verification-status', {
        method: HttpMethod.GET,
        requiresAuth: true
      });

      if (result.success && (result as any).data) {
        const data = (result as any).data;

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

        const effectiveStatus = isMaidVerifiedFromProfile ? 'APPROVED' : (data.overallStatus || 'NOT_SUBMITTED');
        setVerificationStatus(effectiveStatus);
        setIsVerified(effectiveStatus === 'APPROVED');

        // Avoid infinite loops: refresh user only once, and only if profile doesn't already indicate verified
        if (!isMaidVerifiedFromProfile && effectiveStatus === 'APPROVED' && !hasRefreshedUserAfterApprovalRef.current) {
          hasRefreshedUserAfterApprovalRef.current = true;
          await refreshUser();
        }

        // Handle 24-hour alert logic for APPROVED status
        if (effectiveStatus === 'APPROVED') {
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
    } catch (error) {
      console.error('Error fetching verification status:', error);
    } finally {
      setVerificationStatusLoaded(true);
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
          <p className="text-muted-foreground">Please log in as a homecare partner to view this dashboard.</p>
        </div>
      </MaidDashboardLayout>
    );
  }

  return (
    <MaidDashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="fade-in">
          <h1 className="text-xl sm:text-3xl font-bold text-foreground">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base hidden sm:block">
            Here's your comprehensive cleaning schedule, earnings overview, and performance metrics.
          </p>
        </div>

        {/* Verification Status Banners */}
        {verificationStatus === 'NOT_SUBMITTED' && (
          <Alert className="border-2 border-warning bg-gradient-to-r from-warning/5 to-orange/5">
            <Shield className="h-5 w-5 text-warning" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3">
              <div>
                <h4 className="font-semibold text-base sm:text-lg mb-1">Complete Your Profile Verification</h4>
                <AlertDescription className="text-sm">
                  Upload your documents to start receiving assignments.
                </AlertDescription>
              </div>
              <Link to="/maid-verification">
                <Button className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Verify Now
                </Button>
              </Link>
            </div>
          </Alert>
        )}

        {verificationStatus === 'PENDING' && (
          <Alert className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <h4 className="font-semibold text-base mb-1 text-blue-800">Verification Under Review</h4>
              <AlertDescription className="text-blue-700 text-sm">
                Your documents are being reviewed. This typically takes 24-48 hours.
              </AlertDescription>
            </div>
          </Alert>
        )}

        {verificationStatus === 'APPROVED' && showVerificationAlert && (
          <Alert className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3">
              <div>
                <h4 className="font-semibold text-base mb-1 text-green-800">🎉 Welcome to Sweepro!</h4>
                <AlertDescription className="text-green-700 text-sm">
                  Your profile is verified. You can now receive assignments!
                </AlertDescription>
              </div>
              <Link to="/maid-bookings">
                <Button className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Assignments
                </Button>
              </Link>
            </div>
          </Alert>
        )}

        {verificationStatus === 'REJECTED' && (
          <Alert className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-rose-50">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between w-full gap-3">
              <div className="flex-1">
                <h4 className="font-semibold text-base mb-1 text-red-800">Verification Rejected</h4>
                <AlertDescription className="text-red-700 text-sm">
                  Some documents were rejected. Please upload corrected documents.
                </AlertDescription>

                {verificationData?.documents && (
                  <div className="mt-2 space-y-1.5">
                    {verificationData.documents.aadharCard?.status === 'REJECTED' && (
                      <div className="p-1.5 bg-red-100 border border-red-200 rounded text-xs">
                        <strong className="text-red-800">Aadhar Card</strong>
                        {verificationData.documents.aadharCard.rejectionReason && (
                          <span className="text-red-600 ml-1">- {verificationData.documents.aadharCard.rejectionReason}</span>
                        )}
                      </div>
                    )}
                    {verificationData.documents.panCard?.status === 'REJECTED' && (
                      <div className="p-1.5 bg-red-100 border border-red-200 rounded text-xs">
                        <strong className="text-red-800">PAN Card</strong>
                        {verificationData.documents.panCard.rejectionReason && (
                          <span className="text-red-600 ml-1">- {verificationData.documents.panCard.rejectionReason}</span>
                        )}
                      </div>
                    )}
                    {verificationData.documents.electricityBill?.status === 'REJECTED' && (
                      <div className="p-1.5 bg-red-100 border border-red-200 rounded text-xs">
                        <strong className="text-red-800">Address Proof</strong>
                        {verificationData.documents.electricityBill.rejectionReason && (
                          <span className="text-red-600 ml-1">- {verificationData.documents.electricityBill.rejectionReason}</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Link to="/maid-verification">
                <Button className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Re-upload
                </Button>
              </Link>
            </div>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 slide-up">
          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
              <CardTitle className="text-[10px] sm:text-sm font-medium text-muted-foreground">
                Bookings
              </CardTitle>
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-lg sm:text-2xl font-bold text-foreground">{stats.totalBookings}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                {stats.upcomingBookings} upcoming
              </p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
              <CardTitle className="text-[10px] sm:text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-lg sm:text-2xl font-bold text-foreground">{stats.completedBookings}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                {stats.completionRate}% rate
              </p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
              <CardTitle className="text-[10px] sm:text-sm font-medium text-muted-foreground">
                Rating
              </CardTitle>
              <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-lg sm:text-2xl font-bold text-foreground">{stats.averageRating}★</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
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

        {/* Customer Assignment Requests Section - rendered directly, no wrapper card */}
        <div className="slide-up">
          <MaidAssignmentRequestsSection onRefresh={fetchMaidDashboardData} />
        </div>

        {/* Automatic Booking Assignment Requests - rendered directly, no wrapper card */}
        <div className="slide-up">
          <MaidBookingRequestsSection onRefresh={fetchMaidDashboardData} />
        </div>

        {/* Recent Bookings and Quick Actions Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* Recent Bookings */}
          <Card className="dashboard-card slide-up">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                    Recent Assignments
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-0.5">Your recent and upcoming cleaning sessions</CardDescription>
                </div>
                <Link to="/maid-bookings">
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                    View All
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              {bookings.length > 0 ? (
                <div className="space-y-3">
                  {bookings.slice(0, 2).map((booking) => (
                    <div key={booking.id} className="p-3 sm:p-4 border rounded-xl hover:shadow-md transition-shadow bg-gradient-to-r from-card to-muted/20">
                      <div className="flex items-start gap-3">
                        <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${booking.status === 'COMPLETED' ? 'bg-success' :
                              booking.status === 'PENDING' || booking.status === 'CONFIRMED' ? 'bg-primary' :
                                booking.status === 'IN_PROGRESS' ? 'bg-warning' : 'bg-destructive'
                            }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-foreground text-sm sm:text-base truncate">
                              {booking.service?.name || 'Cleaning Service'}
                            </p>
                            <Badge variant={
                              booking.status === 'COMPLETED' ? 'default' :
                                booking.status === 'PENDING' || booking.status === 'CONFIRMED' ? 'secondary' :
                                  booking.status === 'IN_PROGRESS' ? 'outline' : 'destructive'
                            } className="text-[10px] px-1.5 py-0 shrink-0">
                              {booking.status}
                            </Badge>
                          </div>

                          {/* Compact info row */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-primary" />
                              {new Date(booking.scheduledAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-primary" />
                              {booking.timeSlot || new Date(booking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {booking.customer?.name && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3 text-primary" />
                                {booking.customer.name}
                              </span>
                            )}
                            <span className="font-bold text-green-600">
                              ₹{(booking.finalAmount || booking.totalAmount).toLocaleString()}
                            </span>
                          </div>

                          {booking.serviceAddress && (
                            <div className="mt-1.5 flex items-start gap-1.5 text-xs text-muted-foreground hidden sm:flex">
                              <MapPin className="h-3 w-3 text-blue-600 mt-0.5 shrink-0" />
                              <span className="truncate">{booking.serviceAddress}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3" />
                  <h4 className="font-semibold text-base sm:text-lg mb-1">No Assignments Yet</h4>
                  <p className="text-muted-foreground text-xs sm:text-sm max-w-md mx-auto">
                    Assignments will appear here once customers book your services.
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
