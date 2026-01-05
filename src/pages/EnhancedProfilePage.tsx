import React, { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Award,
  Calendar,
  Camera,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Settings,
  Shield,
  Star,
  User,
  Globe,
  Briefcase,
  TrendingUp,
  Eye,
  AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ProfileEditDialog } from '@/components/profile/ProfileEditDialog';
import { ImageUploadDialog } from '@/components/profile/ImageUploadDialog';
import { apiRequest, API_ENDPOINTS, HttpMethod } from '@/services/api';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface ProfileStats {
  profileCompleteness: number;
  totalActivity: number;
  totalBookings?: number;
  totalSpent?: number;
  completedBookings?: number;
  totalEarnings?: number;
  averageRating?: number;
  totalRatings?: number;
}

interface Activity {
  id: string;
  type: string;
  action: string;
  details: string;
  status: string;
  time: string;
  icon: string;
}

const EnhancedProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageType, setImageType] = useState<'profile' | 'cover'>('profile');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // Fetch complete profile
      const profileResponse = await apiRequest(API_ENDPOINTS.PROFILE.ME, {
        method: HttpMethod.GET,
        requiresAuth: true
      });

      if (profileResponse.success) {
        setUserData(profileResponse.data);
        setStats(profileResponse.data.stats);
      }

      // Fetch recent activity
      const activityResponse = await apiRequest(API_ENDPOINTS.PROFILE.ACTIVITY, {
        method: HttpMethod.GET,
        requiresAuth: true
      });

      if (activityResponse.success) {
        setActivities(activityResponse.data);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (type: 'profile' | 'cover') => {
    setImageType(type);
    setImageDialogOpen(true);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="h-5 w-5" />;
      case 'MAID':
        return <Briefcase className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'border border-emerald-400/50 bg-emerald-500/15 text-emerald-100';
      case 'INACTIVE':
        return 'border border-rose-400/50 bg-rose-500/15 text-rose-100';
      case 'PENDING':
        return 'border border-amber-400/50 bg-amber-500/15 text-amber-100';
      default:
        return 'border border-white/30 bg-white/10 text-white/80';
    }
  };

  const getActivityIcon = (icon: string) => {
    switch (icon) {
      case 'calendar':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'briefcase':
        return <Briefcase className="h-4 w-4 text-green-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-64 w-full mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="h-96" />
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayName = useMemo(() => {
    if (!userData) return '';
    return (
      userData.name ||
      userData.fullName ||
      userData.customerProfile?.fullName ||
      userData.customerProfile?.user?.name ||
      userData.email ||
      'Guest User'
    );
  }, [userData]);

  const derivedAddress = useMemo(() => {
    if (!userData) return '';
    const segments = [
      userData.addressLine || userData.address,
      userData.locality,
      userData.city,
      userData.state,
      userData.pincode
    ].filter(Boolean);
    return segments.join(', ');
  }, [userData]);

  const customerInsights = useMemo(() => {
    if (!userData || userData.role !== 'CUSTOMER') {
      return null;
    }

    const profile = userData.customerProfile || {};
    const subscription = profile.subscription || {};
    const totalBookings = stats?.totalBookings ?? profile.totalBookingsCount ?? userData.customerBookings?.length ?? 0;
    const totalSpent = stats?.totalSpent ?? profile.totalSpent ?? 0;

    const hasActiveSubscription = subscription?.status === 'ACTIVE';
    const bufferStatus = profile.bufferStatus || userData.bufferStatus || null;

    return {
      totalBookings,
      totalSpent,
      favoriteServices: profile.favoriteServices || [],
      interests: profile.interests || [],
      memberSince: profile.memberSince || userData.createdAt,
      lastBookingDate: profile.lastBookingDate || userData.customerBookings?.[0]?.scheduledAt,
      nextAutomaticBooking: profile.nextAutomaticBooking,
      subscription: subscription || null,
      hasActiveSubscription,
      bufferStatus,
      emergencyContact: profile.emergencyContact,
      specialInstructions: profile.specialInstructions,
      preferredMaidIds: profile.preferredMaidIds || []
    };
  }, [stats, userData]);

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Failed to load profile data</p>
            <Button onClick={fetchProfileData} className="w-full mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Hero */}
        <div className="mb-10">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950 text-white shadow-[0_35px_120px_-60px_rgba(15,23,42,0.8)]">
            <div className="absolute inset-0 opacity-50">
              <div
                className="h-full w-full"
                style={{
                  backgroundImage: userData.coverImage
                    ? `linear-gradient(120deg, rgba(14,165,233,0.25), rgba(147,51,234,0.25)), url(${userData.coverImage})`
                    : 'linear-gradient(120deg, rgba(14,165,233,0.35), rgba(147,51,234,0.35))',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_55%)]" />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950/95 to-slate-950/90" />

            <div className="relative grid gap-10 p-6 sm:p-10 lg:p-12 lg:grid-cols-[auto,1fr] lg:items-center">
              <div className="flex flex-col items-center gap-5 text-center lg:items-start lg:text-left">
                <div className="relative">
                  <div className="absolute inset-0 rounded-[1.75rem] bg-gradient-to-br from-cyan-500/40 via-white/10 to-purple-500/40 blur-xl" />
                  <div className="relative h-32 w-32 rounded-[1.75rem] border border-white/25 bg-white/10 p-2 backdrop-blur">
                    <div className="h-full w-full overflow-hidden rounded-[1.3rem] bg-white/10">
                      {userData.profileImage ? (
                        <img
                          src={userData.profileImage}
                          alt={displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-white/10">
                          <User className="h-12 w-12 text-white/60" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleImageUpload('profile')}
                      className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white text-slate-900 shadow-lg transition hover:bg-white/90"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => handleImageUpload('cover')}
                  className="w-full rounded-full border-white/20 bg-white/10 text-white transition hover:bg-white/20"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Update Cover
                </Button>
              </div>

              <div className="space-y-8">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{displayName}</h2>
                    <Badge className="rounded-full border border-white/25 bg-white/10 text-white/80">
                      <div className="flex items-center gap-1">
                        {getRoleIcon(userData.role)}
                        <span className="capitalize text-sm font-medium">
                          {userData.role?.toLowerCase()}
                        </span>
                      </div>
                    </Badge>
                    <Badge className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(userData.status)}`}>
                      {userData.status}
                    </Badge>
                    {userData.role === 'MAID' && userData.maidProfile?.isVerified && (
                      <Badge className="rounded-full border border-white/20 bg-white/15 text-white">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  {userData.role === 'MAID' && userData.maidProfile && (
                    <div className="flex flex-wrap items-center gap-2 text-sm text-white/80">
                      <div className="flex items-center gap-1 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-1">
                        <Star className="h-4 w-4 text-yellow-300" />
                        <span className="text-base font-semibold">{userData.maidProfile.rating.toFixed(1)}</span>
                        <span className="text-xs text-white/70">({userData.maidProfile.totalRatings} reviews)</span>
                      </div>
                      {userData.maidProfile.profileViews ? (
                        <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs uppercase tracking-wide text-white/70">
                          {userData.maidProfile.profileViews} profile views
                        </span>
                      ) : null}
                    </div>
                  )}

                  {userData.bio && (
                    <p className="max-w-2xl text-base text-white/75 sm:text-lg">{userData.bio}</p>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/80 backdrop-blur">
                    <Mail className="h-4 w-4 text-white/60" />
                    <span className="truncate">{userData.email}</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/80 backdrop-blur">
                    <Phone className="h-4 w-4 text-white/60" />
                    <span className="truncate">{userData.phone}</span>
                  </div>
                  {derivedAddress && (
                    <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/80 backdrop-blur sm:col-span-2">
                      <MapPin className="mt-0.5 h-4 w-4 text-white/60" />
                      <div className="space-y-1">
                        <span className="block truncate">{derivedAddress}</span>
                        {userData.landmark ? (
                          <span className="block text-xs uppercase tracking-wide text-white/60">Landmark: {userData.landmark}</span>
                        ) : null}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/80 backdrop-blur">
                    <Calendar className="h-4 w-4 text-white/60" />
                    <div>
                      <span className="block">
                        Joined {new Date(userData.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                      {customerInsights?.memberSince && (
                        <span className="block text-xs text-white/60">
                          Member since {new Date(customerInsights.memberSince).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  {stats && (
                    <div className="w-full max-w-xl space-y-3">
                      <div className="flex flex-col gap-1">
                        <div className="text-xs uppercase tracking-[0.2em] text-white/50">
                          Profile Completeness
                        </div>
                        <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
                          <span
                            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-400"
                            style={{ width: `${stats.profileCompleteness}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-white/60">
                          <span>{stats.profileCompleteness}% complete</span>
                          <span>Total activity • {stats.totalActivity || 0}</span>
                        </div>
                      </div>

                      {customerInsights && (
                        <div className="grid gap-3 sm:grid-cols-3 text-sm">
                          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                            <p className="text-xs uppercase tracking-wide text-white/60">Bookings</p>
                            <p className="mt-1 text-lg font-semibold text-white">{customerInsights.totalBookings}</p>
                          </div>
                          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                            <p className="text-xs uppercase tracking-wide text-white/60">Total spent</p>
                            <p className="mt-1 text-lg font-semibold text-white">₹{customerInsights.totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                          </div>
                          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                            <p className="text-xs uppercase tracking-wide text-white/60">Last booking</p>
                            <p className="mt-1 text-sm font-medium text-white">
                              {customerInsights.lastBookingDate
                                ? new Date(customerInsights.lastBookingDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })
                                : 'No bookings yet'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => setEditDialogOpen(true)}
                      className="rounded-full bg-white px-5 py-2 text-slate-900 shadow-lg transition hover:bg-white/90"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/settings')}
                      className="rounded-full border-white/20 bg-white/10 px-5 py-2 text-white transition hover:bg-white/15"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => navigate('/profile/public')}
                      className="rounded-full border border-white/15 bg-transparent px-5 py-2 text-white/80 transition hover:bg-white/10"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Public Profile
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Contact & Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="truncate font-medium">{userData.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="truncate font-medium">{userData.phone}</span>
                </div>
                {derivedAddress && (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                    <div>
                      <span className="block text-sm font-medium text-gray-700">{derivedAddress}</span>
                      {userData.landmark && (
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Landmark: {userData.landmark}</span>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div className="space-y-1">
                    <span className="text-sm text-gray-600">
                      Joined {new Date(userData.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                    {customerInsights?.memberSince && (
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">
                        Member since {new Date(customerInsights.memberSince).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userData.role === 'CUSTOMER' && customerInsights && (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-gray-600">Total Bookings</span>
                        </div>
                        <span className="font-semibold">{customerInsights.totalBookings}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-600">Total Spent</span>
                        </div>
                        <span className="font-semibold">₹{customerInsights.totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                      {customerInsights.nextAutomaticBooking && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-purple-500" />
                            <span className="text-sm text-gray-600">Next Scheduled Booking</span>
                          </div>
                          <span className="font-semibold">
                            {new Date(customerInsights.nextAutomaticBooking).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {userData.role === 'MAID' && (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-600">Completed Jobs</span>
                        </div>
                        <span className="font-semibold">{stats.completedBookings || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-600">Total Earnings</span>
                        </div>
                        <span className="font-semibold">₹{stats.totalEarnings?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-gray-600">Average Rating</span>
                        </div>
                        <span className="font-semibold">{stats.averageRating?.toFixed(1) || 0}</span>
                      </div>
                      {userData.maidProfile && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Eye className="h-4 w-4 text-purple-500" />
                            <span className="text-sm text-gray-600">Profile Views</span>
                          </div>
                          <span className="font-semibold">{userData.maidProfile.profileViews || 0}</span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-600">Total Activity</span>
                    </div>
                    <span className="font-semibold">{stats.totalActivity || 0}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {customerInsights && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Service Snapshot
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-gray-600">
                  {customerInsights.subscription ? (
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-blue-600">Subscription</p>
                          <p className="text-base font-semibold text-blue-900">
                            {customerInsights.subscription?.planName || 'Active Plan'}
                          </p>
                        </div>
                        <Badge variant={customerInsights.hasActiveSubscription ? 'default' : 'secondary'}>
                          {customerInsights.subscription.status || 'INACTIVE'}
                        </Badge>
                      </div>
                      {customerInsights.subscription?.renewalDate && (
                        <p className="mt-2 text-xs text-blue-700">
                          Renews on {new Date(customerInsights.subscription.renewalDate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="rounded-xl border border-dashed border-gray-200 p-4 text-center text-sm text-muted-foreground">
                      No active subscription. Explore plans to unlock automatic bookings.
                    </p>
                  )}

                  {customerInsights.bufferStatus && (
                    <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-amber-600">Buffer Status</p>
                      <p className="mt-1 text-sm font-medium text-amber-900">
                        {customerInsights.bufferStatus.isActive ? 'Buffer Active' : 'Buffer Scheduled'}
                      </p>
                      {customerInsights.bufferStatus.reason && (
                        <p className="mt-1 text-xs text-amber-700">
                          {customerInsights.bufferStatus.reason}
                        </p>
                      )}
                      <div className="mt-3 grid gap-2 text-xs text-amber-800 sm:grid-cols-2">
                        {customerInsights.bufferStatus.startDate && (
                          <span>
                            Start: {new Date(customerInsights.bufferStatus.startDate).toLocaleDateString()}
                          </span>
                        )}
                        {customerInsights.bufferStatus.endDate && (
                          <span>
                            End: {new Date(customerInsights.bufferStatus.endDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {customerInsights.favoriteServices?.length ? (
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Favorite Services</p>
                      <div className="flex flex-wrap gap-2">
                        {customerInsights.favoriteServices.map((service: string) => (
                          <Badge key={service} variant="secondary">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {customerInsights.interests?.length ? (
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Interests</p>
                      <div className="flex flex-wrap gap-2">
                        {customerInsights.interests.map((interest: string) => (
                          <Badge key={interest} variant="outline">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )}

            {userData.socialLinks && Object.values(userData.socialLinks).some(link => link) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    Social Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2 text-sm">
                  {userData.socialLinks.facebook && (
                    <a
                      href={userData.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-blue-50 px-3 py-2 text-blue-600 transition hover:bg-blue-100"
                    >
                      Facebook
                    </a>
                  )}
                  {userData.socialLinks.instagram && (
                    <a
                      href={userData.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-pink-50 px-3 py-2 text-pink-600 transition hover:bg-pink-100"
                    >
                      Instagram
                    </a>
                  )}
                  {userData.socialLinks.twitter && (
                    <a
                      href={userData.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-blue-50 px-3 py-2 text-blue-500 transition hover:bg-blue-100"
                    >
                      Twitter
                    </a>
                  )}
                  {userData.socialLinks.linkedin && (
                    <a
                      href={userData.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-indigo-50 px-3 py-2 text-indigo-600 transition hover:bg-indigo-100"
                    >
                      LinkedIn
                    </a>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6 lg:col-span-2">
            {userData.role === 'CUSTOMER' && customerInsights && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userData.customerBookings?.length ? (
                    <div className="space-y-3">
                      {userData.customerBookings.map((booking: any) => (
                        <div key={booking.id} className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                              <span className="text-primary">{booking.service?.name || 'Service'}</span>
                              <Badge variant="outline">{booking.status}</Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Scheduled {new Date(booking.scheduledAt).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span>Booking ID: {booking.referenceCode || booking.id.slice(0, 8)}</span>
                            {booking.maid?.name && <span>Assigned Maid: {booking.maid.name}</span>}
                            {booking.assignmentStatus && <span>Assignment: {booking.assignmentStatus}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent bookings yet. Once you start booking services, they will appear here.</p>
                  )}
                </CardContent>
              </Card>
            )}

            {userData.role === 'MAID' && userData.maidProfile && (
              <>
                {userData.maidProfile.specializations?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Specializations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {userData.maidProfile.specializations.map((spec: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {userData.maidProfile.skills?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {userData.maidProfile.skills.map((skill: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {userData.maidProfile.achievements?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Award className="h-5 w-5 mr-2" />
                        Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {userData.maidProfile.achievements.map((achievement: string, index: number) => (
                          <li key={index} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-gray-600">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {userData.maidProfile.certifications?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Certifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {userData.maidProfile.certifications.map((cert: string, index: number) => (
                          <div key={index} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                            <span className="text-sm font-medium">{cert}</span>
                            <Badge variant="outline">Verified</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Recent Activity */}
            {activities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        {getActivityIcon(activity.icon)}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.details}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatDate(activity.time)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ProfileEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        userData={userData}
        onProfileUpdated={fetchProfileData}
      />

      <ImageUploadDialog
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
        imageType={imageType}
        currentImage={imageType === 'profile' ? userData.profileImage : userData.coverImage}
        onImageUpdated={fetchProfileData}
      />
    </div>
  );
};

export default EnhancedProfilePage;
