import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '@/contexts/UserContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Edit,
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  TrendingUp,
  Sparkles,
  NotebookPen
} from 'lucide-react';
import { ProfileEditDialog } from '@/components/profile/ProfileEditDialog';
import { ImageUploadDialog } from '@/components/profile/ImageUploadDialog';
import { apiRequest, API_ENDPOINTS, HttpMethod } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';

export const CustomerProfilePage: React.FC = () => {
  const { user } = useUser();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageType, setImageType] = useState<'profile' | 'cover'>('profile');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(API_ENDPOINTS.PROFILE.ME, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
      if (response.success) {
        setProfileData(response.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayName = useMemo(() => {
    if (!profileData) return '';
    return (
      profileData.name ||
      profileData.fullName ||
      profileData.customerProfile?.fullName ||
      profileData.customerProfile?.user?.name ||
      (profileData.email ? profileData.email.split('@')[0] : '') ||
      'Valued Customer'
    );
  }, [profileData]);

  const derivedAddress = useMemo(() => {
    if (!profileData) return '';
    const segments = [
      profileData.addressLine || profileData.address,
      profileData.locality,
      profileData.city,
      profileData.state,
      profileData.pincode
    ].filter(Boolean);
    return segments.join(', ');
  }, [profileData]);

  const stats = profileData?.stats || {};

  const totalBookings = useMemo(() => {
    if (!profileData) return 0;
    return (
      stats.totalBookings ??
      profileData.customerProfile?.totalBookingsCount ??
      profileData.customerBookings?.length ??
      0
    );
  }, [stats, profileData]);

  const totalSpent = useMemo(() => {
    if (!profileData) return 0;
    return (
      stats.totalSpent ??
      profileData.customerProfile?.totalSpent ??
      0
    );
  }, [stats, profileData]);

  const memberSince = useMemo(() => {
    if (!profileData) return null;
    return profileData.customerProfile?.memberSince || profileData.createdAt || null;
  }, [profileData]);

  const membershipDays = useMemo(() => {
    if (!memberSince) return 0;
    const joined = new Date(memberSince).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((now - joined) / (1000 * 60 * 60 * 24)));
  }, [memberSince]);

  const serviceTime = useMemo(() => {
    if (!profileData?.customerBookings?.length) {
      return { minutes: 0, label: '0 mins' };
    }

    const totalMinutes = profileData.customerBookings.reduce((acc: number, booking: any) => {
      const duration = booking.service?.baseDuration || 0;
      return acc + duration;
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const label = hours > 0 ? `${hours}h ${minutes}m` : `${minutes} mins`;

    return { minutes: totalMinutes, label };
  }, [profileData]);

  const serviceDays = useMemo(() => {
    if (!profileData?.customerBookings?.length) return 0;
    const uniqueDays = new Set(
      profileData.customerBookings
        .filter((booking: any) => booking.scheduledAt)
        .map((booking: any) => new Date(booking.scheduledAt).toDateString())
    );
    return uniqueDays.size;
  }, [profileData]);

  const upcomingBooking = useMemo(() => {
    if (!profileData?.customerBookings?.length) return null;
    const now = Date.now();
    const future = profileData.customerBookings
      .filter((booking: any) => booking.scheduledAt && new Date(booking.scheduledAt).getTime() >= now)
      .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    return future[0] || null;
  }, [profileData]);

  const favoriteServices = profileData?.customerProfile?.favoriteServices || [];
  const interests = profileData?.customerProfile?.interests || [];

  const emergencyContact = profileData?.customerProfile?.emergencyContact;
  const specialInstructions = profileData?.customerProfile?.specialInstructions;

  const loadingSkeleton = (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-28 w-full rounded-xl" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );

  const handleImageUpload = (type: 'profile' | 'cover') => {
    setImageType(type);
    setImageDialogOpen(true);
  };

  if (loading) {
    return loadingSkeleton;
  }

  if (!profileData) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Failed to load profile data</p>
            <Button onClick={fetchProfileData} className="w-full mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-1">Manage your account information and service activity</p>
          </div>
          <Button
            onClick={() => setEditDialogOpen(true)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        {/* Main Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden">
              {/* Cover Image */}
              <div className="relative h-32 bg-gradient-to-r from-cyan-200 via-blue-200 to-purple-200">
                {profileData.coverImage ? (
                  <img
                    src={profileData.coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                ) : null}
                <button
                  onClick={() => handleImageUpload('cover')}
                  className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              <CardContent className="p-6">
                {/* Profile Image */}
                <div className="relative -mt-12 mb-4">
                  <div className="relative inline-block">
                    <img
                      src={profileData.profileImage || '/default-avatar.png'}
                      alt={displayName}
                      className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg"
                    />
                    <button
                      onClick={() => handleImageUpload('profile')}
                      className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-white hover:bg-primary/90 transition-colors"
                    >
                      <Camera className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div className="mb-4">
                  <h2 className="text-2xl font-bold">{displayName}</h2>
                  {profileData.bio && (
                    <p className="text-sm text-muted-foreground mt-2">{profileData.bio}</p>
                  )}
                  {!profileData.bio && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Keep your preferences up-to-date to help us tailor every service just for you.
                    </p>
                  )}
                </div>

                {/* Contact Info */}
                <div className="space-y-3 text-sm border-t pt-4">
                  {profileData.email && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded hover:bg-muted/80 cursor-pointer transition-colors"
                      onClick={() => navigator.clipboard.writeText(profileData.email)}>
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{profileData.email}</span>
                    </div>
                  )}
                  {profileData.phone && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded hover:bg-muted/80 cursor-pointer transition-colors"
                      onClick={() => navigator.clipboard.writeText(profileData.phone)}>
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{profileData.phone}</span>
                    </div>
                  )}
                  {derivedAddress && (
                    <div className="flex items-start gap-2 p-2 bg-muted rounded">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-xs">{derivedAddress}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Card className="border-primary/10 bg-primary/5">
                <CardContent className="flex flex-col gap-3 pt-6">
                  <div className="flex items-center justify-between text-primary">
                    <span className="text-sm font-medium">Total Bookings</span>
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="text-3xl font-bold text-primary">{totalBookings}</div>
                  <p className="text-xs text-muted-foreground">Bookings completed or in progress across all plans.</p>
                </CardContent>
              </Card>

              <Card className="border-emerald-200/60 bg-emerald-50">
                <CardContent className="flex flex-col gap-3 pt-6">
                  <div className="flex items-center justify-between text-emerald-600">
                    <span className="text-sm font-medium">Total Spent</span>
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="text-3xl font-bold text-emerald-600">₹{totalSpent.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Cumulative payments for all completed services.</p>
                </CardContent>
              </Card>

              <Card className="border-blue-200/60 bg-blue-50">
                <CardContent className="flex flex-col gap-3 pt-6">
                  <div className="flex items-center justify-between text-blue-600">
                    <span className="text-sm font-medium">Membership Days</span>
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600">{membershipDays}</div>
                  <p className="text-xs text-muted-foreground">Days since you joined Sweep Pro.</p>
                </CardContent>
              </Card>

              <Card className="border-violet-200/60 bg-violet-50">
                <CardContent className="flex flex-col gap-3 pt-6">
                  <div className="flex items-center justify-between text-violet-600">
                    <span className="text-sm font-medium">Service Hours</span>
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="text-3xl font-bold text-violet-600">{serviceTime.label}</div>
                  <p className="text-xs text-muted-foreground">Total active service time across completed bookings.</p>
                </CardContent>
              </Card>
            </div>

            {/* Account Details */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-semibold">{displayName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold">{profileData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-semibold">{profileData.phone}</p>
                  </div>
                  {memberSince && (
                    <div>
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="font-semibold flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(memberSince).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {emergencyContact && (
                    <div>
                      <p className="text-sm text-muted-foreground">Emergency Contact</p>
                      <p className="font-semibold flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {emergencyContact}
                      </p>
                    </div>
                  )}
                </div>

                {(specialInstructions || upcomingBooking) && (
                  <div className="rounded-xl border border-dashed border-muted p-4 text-sm space-y-3">
                    {specialInstructions && (
                      <div className="flex items-start gap-3 text-muted-foreground">
                        <NotebookPen className="h-4 w-4 mt-1" />
                        <div>
                          <p className="font-medium text-foreground">Special Instructions</p>
                          <p>{specialInstructions}</p>
                        </div>
                      </div>
                    )}
                    {upcomingBooking && (
                      <div className="flex items-start gap-3 text-muted-foreground">
                        <Calendar className="h-4 w-4 mt-1" />
                        <div>
                          <p className="font-medium text-foreground">Next Scheduled Booking</p>
                          <p>
                            {new Date(upcomingBooking.scheduledAt).toLocaleString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          {upcomingBooking.service?.name && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Service: {upcomingBooking.service.name}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Favorite Services */}
            {(favoriteServices.length > 0 || interests.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>Service Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {favoriteServices.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Favourite Services</p>
                        <div className="flex flex-wrap gap-2">
                          {favoriteServices.map((service: string) => (
                            <div key={service} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                              {service}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {interests.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Home Care Interests</p>
                        <div className="flex flex-wrap gap-2">
                          {interests.map((interest: string) => (
                            <div key={interest} className="rounded-full border border-muted px-3 py-1 text-xs font-medium text-foreground">
                              {interest}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Service History */}
            <Card>
              <CardHeader>
                <CardTitle>Service Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-muted bg-background p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Service Days</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{serviceDays}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Days with at least one scheduled booking.</p>
                  </div>
                  <div className="rounded-2xl border border-muted bg-background p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Average Minutes / Booking</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">
                      {totalBookings > 0 ? Math.round(serviceTime.minutes / totalBookings) : 0} mins
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Based on service durations across bookings.</p>
                  </div>
                  <div className="rounded-2xl border border-muted bg-background p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Preferred Team</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">
                      {profileData?.customerProfile?.preferredMaidIds?.length || 0}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Maids earmarked for your household.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent booking timeline */}
           
          </div>
        </div>

        {/* Dialogs */}
        <ProfileEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          userData={profileData}
          onProfileUpdated={fetchProfileData}
        />

        <ImageUploadDialog
          open={imageDialogOpen}
          onOpenChange={setImageDialogOpen}
          imageType={imageType}
          currentImage={imageType === 'profile' ? profileData.profileImage : profileData.coverImage}
          onImageUpdated={fetchProfileData}
        />
      </div>
    </DashboardLayout>
  );
};

export default CustomerProfilePage;
