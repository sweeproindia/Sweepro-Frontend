import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    AlertCircle,
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
    User
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookingButton } from '@/components/buttons/BookingButton';
import { useBookingForm } from '@/contexts/BookingFormContext';
import { ProfileEditDialog } from '@/components/profile/ProfileEditDialog';
import { ImageUploadDialog } from '@/components/profile/ImageUploadDialog';
import { apiRequest, API_ENDPOINTS, HttpMethod } from '@/services/api';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageType, setImageType] = useState<'profile' | 'cover'>('profile');
  const { openBookingForm } = useBookingForm();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const response = await apiRequest(API_ENDPOINTS.PROFILE.ME, {
        method: HttpMethod.GET,
        requiresAuth: true
      });

      if (response.success) {
        setProfileData(response.data);
        setStats(response.data.stats);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load profile');
      // If auth fails, redirect to login
      if (error.statusCode === 401) {
        navigate('/login');
      }
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
      case 'admin':
        return <Shield className="h-5 w-5" />;
      case 'maid':
        return <MessageCircle className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-4 w-32 skeleton-shimmer" />
              <Skeleton className="h-8 w-48 skeleton-shimmer" />
            </div>
            <div className="flex items-center space-x-2">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-10 w-28 skeleton-shimmer" />
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Cover + Profile */}
          <div className="relative">
            <Skeleton className="h-64 w-full rounded-2xl skeleton-shimmer" />
            <Skeleton className="absolute -bottom-12 left-6 h-28 w-28 rounded-full border-4 border-white skeleton-shimmer" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column cards */}
            <div className="space-y-6">
              <div className="space-y-4 bg-white/70 backdrop-blur-sm rounded-xl border border-border/60 p-6 animate-fadeIn">
                <div className="flex flex-col items-center gap-3">
                  <Skeleton className="h-5 w-32 skeleton-shimmer" />
                  <Skeleton className="h-4 w-24 skeleton-shimmer" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full skeleton-shimmer" />
                    <Skeleton className="h-6 w-16 rounded-full skeleton-shimmer" />
                  </div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex items-center space-x-3">
                      <Skeleton className="h-4 w-4 rounded-full skeleton-shimmer" />
                      <Skeleton className="h-4 flex-1 skeleton-shimmer" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-border/60 p-6 animate-slideUp">
                <Skeleton className="h-5 w-32 mb-4 skeleton-shimmer" />
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-4 w-4 rounded-full skeleton-shimmer" />
                        <Skeleton className="h-4 w-24 skeleton-shimmer" />
                      </div>
                      <Skeleton className="h-5 w-12 skeleton-shimmer" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column cards */}
            <div className="lg:col-span-2 space-y-6">
              {[1, 2, 3, 4].map((card) => (
                <div
                  key={card}
                  className="bg-white/70 backdrop-blur-sm rounded-xl border border-border/60 p-6 animate-fadeIn"
                  style={{ animationDelay: `${card * 120}ms` }}
                >
                  <Skeleton className="h-5 w-40 mb-4 skeleton-shimmer" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((item) => (
                      <Skeleton key={item} className="h-4 skeleton-shimmer" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity timeline */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-border/60 p-6 animate-slideUp">
            <Skeleton className="h-5 w-44 mb-4 skeleton-shimmer" />
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-start space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full skeleton-shimmer" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 skeleton-shimmer" />
                    <Skeleton className="h-3 w-1/2 skeleton-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
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
              {/* Show booking button only for users */}
              {profileData.role === 'user' && (
                <BookingButton
                  onClick={openBookingForm}
                  text="Book Service"
                  variant="default"
                  size="sm"
                  className="btn-hero"
                />
              )}
              <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <Card className="mb-6">
              <div className="relative">
                {profileData.coverImage ? (
                  <img
                    src={profileData.coverImage}
                    alt="Cover"
                    className="w-full h-32 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg" />
                )}
                <button
                  onClick={() => handleImageUpload('cover')}
                  className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <div className="absolute -bottom-12 left-6">
                  <div className="relative">
                    {profileData.profileImage ? (
                      <img
                        src={profileData.profileImage}
                        alt={profileData.name}
                        className="w-24 h-24 rounded-full border-4 border-white object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                        <User className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <button
                      onClick={() => handleImageUpload('profile')}
                      className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full hover:bg-primary/90"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              <CardContent className="pt-16">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{profileData.name}</h2>
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    {getRoleIcon(profileData.role?.toLowerCase())}
                    <span className="text-sm text-gray-600 capitalize">{profileData.role?.toLowerCase()}</span>
                    <Badge className={getStatusColor(profileData.status?.toLowerCase())}>
                      {profileData.status}
                    </Badge>
                  </div>
                  {profileData.maidProfile?.rating && (
                    <div className="flex items-center justify-center space-x-1 mt-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{profileData.maidProfile.rating.toFixed(1)}</span>
                      <span className="text-sm text-gray-500">({profileData.maidProfile.totalRatings} reviews)</span>
                    </div>
                  )}
                </div>

                {profileData.bio && (
                  <p className="text-gray-600 text-sm text-center mb-4">{profileData.bio}</p>
                )}

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{profileData.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{profileData.phone}</span>
                  </div>
                  {(profileData.city || profileData.address) && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{profileData.city || profileData.address}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Joined {new Date(profileData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            {(stats?.totalBookings || stats?.totalEarnings || stats?.completedBookings) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats?.totalBookings > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-gray-600">Total Bookings</span>
                      </div>
                      <span className="font-semibold">{stats.totalBookings}</span>
                    </div>
                  )}
                  {stats?.completedBookings > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">Completed Jobs</span>
                      </div>
                      <span className="font-semibold">{stats.completedBookings}</span>
                    </div>
                  )}
                  {stats?.totalEarnings > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">Total Earnings</span>
                      </div>
                      <span className="font-semibold">₹{stats.totalEarnings.toLocaleString()}</span>
                    </div>
                  )}
                  {/* Quick Booking Section for Users */}
                  {profileData.role === 'CUSTOMER' && (
                    <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Quick Booking
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Need a cleaning service? Book directly from your profile.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <BookingButton
                          onClick={() => openBookingForm(new Date())}
                          text="Book for Today"
                          className="btn-hero"
                          size="sm"
                          fullWidth
                        />
                        <BookingButton
                          onClick={() => {
                            const tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            openBookingForm(tomorrow);
                          }}
                          text="Book for Tomorrow"
                          variant="outline"
                          size="sm"
                          fullWidth
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Specializations */}
            {profileData.maidProfile?.specializations && profileData.maidProfile.specializations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Specializations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profileData.maidProfile.specializations.map((spec: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Achievements */}
            {profileData.maidProfile?.achievements && profileData.maidProfile.achievements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {profileData.maidProfile.achievements.map((achievement: string, index: number) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-600">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Documents */}
            {profileData.maidProfile?.certifications && profileData.maidProfile.certifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {profileData.maidProfile.certifications.map((cert: string, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">{cert}</span>
                        <Badge variant="outline">Certified</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Interests for Customer */}
            {profileData.customerProfile?.interests && profileData.customerProfile.interests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profileData.customerProfile.interests.map((interest: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            {false && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profileData.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData.address && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Address</h4>
                    <p className="text-sm text-gray-600">{profileData.address}</p>
                    {profileData.city && profileData.state && (
                      <p className="text-sm text-gray-600">{profileData.city}, {profileData.state} - {profileData.pincode}</p>
                    )}
                  </div>
                )}
                {profileData.customerProfile?.emergencyContact && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Emergency Contact</h4>
                    <p className="text-sm text-gray-600">{profileData.customerProfile.emergencyContact}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
  );
};

export default ProfilePage;