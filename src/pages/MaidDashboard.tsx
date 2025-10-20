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
import { ArrowRight, Calendar, CheckCircle, Clock, CreditCard, DollarSign, MessageCircle, Star, User, Package, TrendingUp, AlertTriangle, MapPin, Shield, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MaidBookingRequestsSection } from '@/components/dashboard/MaidBookingRequestsSection';
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

export default function MaidDashboard() {
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

        {verificationStatus === 'APPROVED' && (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 slide-up">
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
                Monthly Earnings
              </CardTitle>
              <DollarSign className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">₹{stats.monthlyEarnings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                This month
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                {booking.customer?.email && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="w-4 h-4 flex items-center justify-center">✉️</span>
                                    <span className="truncate">{booking.customer.email}</span>
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
                            
                            {booking.specialInstructions && (
                              <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border-l-4 border-yellow-400">
                                <div className="flex items-start gap-2">
                                  <MessageCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <span className="font-medium text-yellow-700 dark:text-yellow-300 text-sm">Special Instructions:</span>
                                    <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">{booking.specialInstructions}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Assignment Status & Timeline */}
                            {booking.createdAt && (
                              <div className="mb-3 p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                                  <CheckCircle className="h-4 w-4" />
                                  <span>Assigned on {new Date(booking.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Enhanced Action buttons for maid */}
                      <div className="mt-4 pt-4 border-t border-border">
                        {booking.status === 'CONFIRMED' && (
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                              ▶️ Start Service
                            </Button>
                            <Button size="sm" variant="outline">
                              📞 Contact Client
                            </Button>
                            <Button size="sm" variant="outline">
                              📍 Get Directions
                            </Button>
                            <Button size="sm" variant="ghost" className="text-orange-600">
                              ⚠️ Report Issue
                            </Button>
                          </div>
                        )}
                        {booking.status === 'IN_PROGRESS' && (
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                              ✅ Complete Service
                            </Button>
                            <Button size="sm" variant="outline">
                              ⏱️ Update Progress
                            </Button>
                            <Button size="sm" variant="outline">
                              📞 Contact Client
                            </Button>
                            <Button size="sm" variant="ghost" className="text-orange-600">
                              ⚠️ Report Issue
                            </Button>
                          </div>
                        )}
                        {booking.status === 'PENDING' && (
                          <div className="flex flex-wrap gap-2">
                            <div className="flex items-center gap-2 text-sm text-orange-600">
                              <Clock className="h-4 w-4 animate-pulse" />
                              <span>Awaiting admin assignment...</span>
                            </div>
                          </div>
                        )}
                        {booking.status === 'COMPLETED' && (
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              ✅ Service Completed
                            </Badge>
                            {booking.completedAt && (
                              <span className="text-sm text-muted-foreground">
                                on {new Date(booking.completedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        Showing {Math.min(2, bookings.length)} of {bookings.length} assignments
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          Set Availability
                        </Button>
                        <Link to="/maid-bookings">
                          <Button size="sm">
                            View All Assignments
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-semibold text-lg mb-2">No Assignments Yet</h4>
                  <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                    You'll see your cleaning assignments here once customers book your services. Make sure your availability is up to date!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button className="btn-hero">
                      <Calendar className="h-4 w-4 mr-2" />
                      Set Availability
                    </Button>
                    <Button variant="outline">
                      <User className="h-4 w-4 mr-2" />
                      Update Profile
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="dashboard-card slide-up">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/maid-bookings">
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    My Assignments
                  </Button>
                </Link>
                {!isVerified && (
                  <Link to="/maid-verification">
                    <Button className="w-full justify-start border-warning text-warning hover:bg-warning/10" variant="outline">
                      <Shield className="h-4 w-4 mr-2" />
                      Complete Verification
                    </Button>
                  </Link>
                )}
                {isVerified && (
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Set Availability
                  </Button>
                )}
                <Button className="w-full justify-start" variant="outline">
                  <DollarSign className="h-4 w-4 mr-2" />
                  View Earnings
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Maid Profile */}
          <Card className="dashboard-card slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Maid Profile
              </CardTitle>
              <CardDescription>Your professional information and performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gradient-feature rounded-lg border border-primary/20">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-xl">{user.name}</h4>
                  <p className="text-sm text-muted-foreground">{user.role} • Professional Cleaner</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{stats.averageRating}</span>
                    <span className="text-xs text-muted-foreground">({stats.totalReviews} reviews)</span>
                  </div>
                  <Badge variant="outline" className="mt-2">
                    {user.status}
                  </Badge>
                </div>
              </div>
              
              {/* Profile Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-sm font-medium text-foreground">Total Jobs</p>
                  <p className="text-lg font-bold text-primary">{stats.completedBookings}</p>
                  <p className="text-xs text-muted-foreground">{stats.completionRate}% success</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-sm font-medium text-foreground">Lifetime Earnings</p>
                  <p className="text-lg font-bold text-primary">₹{stats.totalEarnings.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">All time</p>
                </div>
              </div>
              
              {/* Profile Details */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="font-medium">Email:</span>
                  <span className="text-foreground text-sm">{user.email}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="font-medium">Phone:</span>
                  <span className="text-foreground">{user.phone}</span>
                </div>
                {user.address && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <span className="font-medium">Address:</span>
                    <p className="text-foreground mt-1 text-sm">{user.address}</p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Link to="/profile">
                  <Button className="w-full justify-start" variant="outline">
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
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

        {/* Enhanced Earnings Overview */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Earnings Analytics
                </CardTitle>
                <CardDescription>Comprehensive performance metrics and earnings breakdown from API data</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs px-2 py-1">
                  {payments.filter(p => p.status === 'COMPLETED').length} Payments
                </Badge>
                <Button variant="outline" size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {payments.length > 0 ? (
              <div className="space-y-6">
                {/* Earnings Analytics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gradient-feature rounded-lg p-4 border border-primary/20">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      This Month
                    </h4>
                    <p className="text-2xl font-bold text-primary">₹{stats.monthlyEarnings.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">
                      {bookings.filter(b => {
                        const bookingDate = new Date(b.scheduledAt);
                        const currentMonth = new Date().getMonth();
                        const currentYear = new Date().getFullYear();
                        return b.status === 'COMPLETED' && 
                               bookingDate.getMonth() === currentMonth &&
                               bookingDate.getFullYear() === currentYear;
                      }).length} bookings completed
                    </p>
                  </div>
                  
                  <div className="bg-gradient-feature rounded-lg p-4 border border-primary/20">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Average Rating
                    </h4>
                    <p className="text-2xl font-bold text-primary">{stats.averageRating}★</p>
                    <p className="text-sm text-muted-foreground">{stats.totalReviews} reviews</p>
                  </div>
                  
                  <div className="bg-gradient-feature rounded-lg p-4 border border-primary/20">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Completion Rate
                    </h4>
                    <p className="text-2xl font-bold text-primary">{stats.completionRate}%</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.completedBookings}/{stats.totalBookings} bookings
                    </p>
                  </div>
                  
                  <div className="bg-gradient-feature rounded-lg p-4 border border-primary/20">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Total Earnings
                    </h4>
                    <p className="text-2xl font-bold text-primary">₹{stats.totalEarnings.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Lifetime earnings</p>
                  </div>
                </div>
                
                {/* Payment Breakdown */}
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment Breakdown
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-success">
                        ₹{payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Received</div>
                      <div className="text-xs text-success mt-1">
                        {payments.filter(p => p.status === 'COMPLETED').length} payments
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-warning">
                        ₹{payments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Pending</div>
                      <div className="text-xs text-warning mt-1">
                        {payments.filter(p => p.status === 'PENDING').length} pending
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-muted-foreground">
                        ₹{Math.round(stats.totalEarnings / Math.max(stats.completedBookings, 1)).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Avg per Job</div>
                      <div className="text-xs text-muted-foreground mt-1">Per booking</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">
                        {stats.completedBookings > 0 ? Math.round(stats.monthlyEarnings / stats.completedBookings * 30 / new Date().getDate()) : 0}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Projected</div>
                      <div className="text-xs text-primary mt-1">Monthly goal</div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t">
                  <Button variant="outline">
                    <DollarSign className="h-4 w-4 mr-2" />
                    View Detailed Earnings
                  </Button>
                  <Button variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Performance Analytics
                  </Button>
                  <Button variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payment History
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-semibold text-lg mb-2">No Earnings Yet</h4>
                <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                  Your earnings and performance metrics will appear here once you complete your first cleaning assignment.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button className="btn-hero">
                    <Calendar className="h-4 w-4 mr-2" />
                    Set Availability
                  </Button>
                  <Button variant="outline">
                    <User className="h-4 w-4 mr-2" />
                    Complete Profile
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MaidDashboardLayout>
  );
}