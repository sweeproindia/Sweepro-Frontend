import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Camera, Mail, Phone, MapPin, Calendar, User } from 'lucide-react';
import { ProfileEditDialog } from '@/components/profile/ProfileEditDialog';
import { ImageUploadDialog } from '@/components/profile/ImageUploadDialog';
import { useCustomerProfile, useInvalidateProfile } from '@/hooks/queries/useProfileQueries';
import { Skeleton } from '@/components/ui/skeleton';

interface CustomerProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  coverImage?: string;
  bio?: string;
  address?: string;
  addressLine?: string;
  locality?: string;
  city?: string;
  state?: string;
  pincode?: string;
  role?: string;
  joinDate?: string;
  createdAt?: string;
  totalBookings?: number;
  remainingDays?: number;
  favoriteServices?: string[];
}

export const CustomerProfilePage: React.FC = () => {
  const { user } = useUser();

  // ── React Query hooks ─────────────────────────────────────────────────────
  const { data: profileData = null, isLoading } = useCustomerProfile();
  const invalidateProfile = useInvalidateProfile();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageType, setImageType] = useState<'profile' | 'cover'>('profile');

  const handleImageUpload = (type: 'profile' | 'cover') => {
    setImageType(type);
    setImageDialogOpen(true);
  };

  // Show skeleton only on initial load
  const loading = isLoading && !profileData;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-9 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card className="overflow-hidden">
                <Skeleton className="h-32 w-full" />
                <CardContent className="p-6">
                  <div className="relative -mt-12 mb-4">
                    <Skeleton className="h-24 w-24 rounded-full" />
                  </div>
                  <div className="mb-4 space-y-2">
                    <Skeleton className="h-7 w-40" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="space-y-3 border-t pt-4">
                    <Skeleton className="h-10 w-full rounded" />
                    <Skeleton className="h-10 w-full rounded" />
                    <Skeleton className="h-10 w-full rounded" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center space-y-2">
                    <Skeleton className="h-9 w-20 mx-auto" />
                    <Skeleton className="h-4 w-28 mx-auto" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center space-y-2">
                    <Skeleton className="h-9 w-24 mx-auto" />
                    <Skeleton className="h-4 w-24 mx-auto" />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-40" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-56" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-5 w-36" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profileData) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Failed to load profile data</p>
            <Button onClick={invalidateProfile} className="w-full mt-4">
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
            <p className="text-muted-foreground mt-1">Manage your account information</p>
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
              <div className="relative h-36 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
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
                <div className="relative -mt-16 mb-4">
                  <div className="relative inline-block">
                    <img
                      src={profileData.profileImage || '/default-avatar.png'}
                      alt={profileData.name || 'User'}
                      className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-xl ring-2 ring-primary/20"
                    />
                    <button
                      onClick={() => handleImageUpload('profile')}
                      className="absolute bottom-1 right-1 p-2 bg-primary rounded-full text-white hover:bg-primary/90 transition-colors shadow-lg"
                    >
                      <Camera className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-foreground">{profileData.name || 'User'}</h2>
                  {profileData.bio && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{profileData.bio}</p>
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
                  {profileData.address && (
                    <div className="flex items-start gap-2 p-2 bg-muted rounded">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-xs">{profileData.address}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {profileData.totalBookings || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {profileData.remainingDays || 0} days
                  </div>
                  <p className="text-sm text-muted-foreground">Remaining Days</p>
                </CardContent>
              </Card>
            </div>

            {/* Account Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-semibold text-foreground">{profileData.name || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold text-foreground">{profileData.email || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-semibold text-foreground">{profileData.phone || 'Not provided'}</p>
                  </div>
                  {(profileData.joinDate || profileData.createdAt) && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="font-semibold flex items-center gap-2 text-foreground">
                        <Calendar className="h-4 w-4 text-primary" />
                        {new Date(profileData.joinDate || profileData.createdAt!).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                  {(profileData.addressLine || profileData.address || profileData.city) && (
                    <div className="col-span-full space-y-1">
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-semibold text-foreground">
                        {/* BUG FIX: For Google OAuth CUSTOMER accounts the address is stored
                            as apartment name + area in `address`, with locality and pincode
                            as separate fields.  Prefer the full `address` string as the
                            primary display value, then append city/state/pincode when present,
                            so the UI shows e.g. "My Home Krishe - Gachibowli, 500032"
                            instead of the raw UUID or just "Gachibowli, 500032". */}
                        {[
                          profileData.addressLine || profileData.address,
                          profileData.city,
                          profileData.state,
                          profileData.pincode
                        ]
                          .filter(Boolean)
                          .join(', ') || 'Not provided'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Favorite Services */}
            {profileData.favoriteServices && profileData.favoriteServices.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Favorite Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {profileData.favoriteServices.map((service) => (
                      <div key={service} className="p-3 bg-muted rounded-lg text-center text-sm font-medium">
                        {service}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Dialogs */}
        <ProfileEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          userData={profileData}
          onProfileUpdated={invalidateProfile}
        />

        <ImageUploadDialog
          open={imageDialogOpen}
          onOpenChange={setImageDialogOpen}
          imageType={imageType}
          currentImage={imageType === 'profile' ? profileData.profileImage : profileData.coverImage}
          onImageUpdated={invalidateProfile}
        />
      </div>
    </DashboardLayout>
  );
};

export default CustomerProfilePage;
