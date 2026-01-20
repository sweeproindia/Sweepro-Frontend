import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '@/contexts/UserContext';
import { MaidDashboardLayout } from '@/components/dashboard/MaidDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Edit,
  Camera,
  Mail,
  Phone,
  Calendar,
  Star,
  Quote,
  MapPin,
  Clock,
  TrendingUp,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { ProfileEditDialog } from '@/components/profile/ProfileEditDialog';
import { ImageUploadDialog } from '@/components/profile/ImageUploadDialog';
import { apiRequest, API_ENDPOINTS, HttpMethod } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';

interface MaidProfileData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profileImage?: string;
  coverImage?: string;
  bio?: string;
  skills?: string[];
  experience?: number;
  isVerified?: boolean;
  verificationDate?: string;
  totalEarnings?: number;
  jobsCompleted?: number;
  rating?: number;
  totalReviews?: number;
  languages?: string[];
  address?: string;
  role?: string;
  joinedDate?: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  serviceDate: string;
  reviewer: {
    name: string;
    email?: string;
    phone?: string;
    profileImage?: string;
  };
  serviceDetails?: string;
}

export const MaidProfilePage: React.FC = () => {
  const { user } = useUser();
  const [profileData, setProfileData] = useState<MaidProfileData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageType, setImageType] = useState<'profile' | 'cover'>('profile');

  useEffect(() => {
    fetchProfileData();
    fetchMaidReviews();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(API_ENDPOINTS.PROFILE.ME, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
      if (response.success) {
        const data: any = response.data;
        const maidProfile: any = data?.maidProfile;

        const mappedProfile: MaidProfileData = {
          id: data?.id,
          fullName: data?.name,
          email: data?.email,
          phone: data?.phone,
          profileImage: data?.profileImage,
          coverImage: data?.coverImage,
          bio: data?.bio,
          skills: maidProfile?.skills,
          experience: maidProfile?.experienceYears,
          isVerified: maidProfile?.isVerified ?? false,
          verificationDate: maidProfile?.verificationDate,
          totalEarnings: maidProfile?.totalEarnings,
          jobsCompleted: maidProfile?.completedBookings,
          rating: maidProfile?.rating,
          totalReviews: maidProfile?.totalRatings,
          languages: maidProfile?.languages,
          address: [
            data?.addressLine || data?.address,
            data?.locality,
            data?.city,
            data?.state,
            data?.pincode
          ]
            .filter(Boolean)
            .join(', '),
          role: data?.role,
          joinedDate: data?.createdAt
        };

        setProfileData(mappedProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaidReviews = async () => {
    try {
      const response = await apiRequest('/feedback/maid-reviews', {
        method: HttpMethod.GET,
        requiresAuth: true
      });
      if (response.success) {
        const list = (response as any).data || (response as any).reviews || [];
        const feedbacks = Array.isArray(list) ? list : [];

        const mapped: Review[] = feedbacks.map((f: any) => {
          const serviceDate = f?.booking?.completedAt || f?.createdAt;
          return {
            id: f?.id,
            rating: f?.overallRating,
            comment: f?.comment || '',
            serviceDate: serviceDate || new Date().toISOString(),
            reviewer: {
              name: f?.customer?.name || 'Customer',
              email: f?.customer?.email,
              phone: f?.customer?.phone,
              profileImage: f?.customer?.profileImage
            },
            serviceDetails: f?.booking?.service?.name
          };
        }).filter((r: any) => r?.id);

        setReviews(mapped);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  // Keep displayed rating consistent with feedback if profile doesn't have it yet
  useEffect(() => {
    if (!profileData) return;
    if (profileData.rating !== undefined && profileData.rating !== null && (profileData.totalReviews || 0) > 0) return;
    if (reviews.length === 0) return;

    const avg = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
    setProfileData(prev => prev ? ({
      ...prev,
      rating: Number.isFinite(avg) ? avg : 0,
      totalReviews: reviews.length
    }) : prev);
  }, [reviews, profileData]);

  const handleImageUpload = (type: 'profile' | 'cover') => {
    setImageType(type);
    setImageDialogOpen(true);
  };

  const displayName = useMemo(() => {
    if (!profileData) return '';
    return (
      profileData.fullName ||
      user?.name ||
      (profileData.email ? profileData.email.split('@')[0] : '') ||
      'Sweep Pro Maid'
    );
  }, [profileData, user]);

  const membershipDays = useMemo(() => {
    if (!profileData?.joinedDate) return 0;
    const joined = new Date(profileData.joinedDate).getTime();
    if (Number.isNaN(joined)) return 0;
    return Math.max(0, Math.floor((Date.now() - joined) / (1000 * 60 * 60 * 24)));
  }, [profileData?.joinedDate]);

  const formattedEarnings = useMemo(() => {
    if (!profileData?.totalEarnings) return '₹0';
    return `₹${profileData.totalEarnings.toLocaleString('en-IN', {
      maximumFractionDigits: 0
    })}`;
  }, [profileData?.totalEarnings]);

  const primaryLanguages = useMemo(() => profileData?.languages ?? [], [profileData?.languages]);
  const skills = useMemo(() => profileData?.skills ?? [], [profileData?.skills]);

  const averageRating = useMemo(() => {
    if (!profileData?.rating) return 0;
    return Number(profileData.rating.toFixed(1));
  }, [profileData?.rating]);

  const loadingSkeleton = (
    <MaidDashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-28 w-full rounded-xl" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
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
            <Skeleton className="h-56 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </MaidDashboardLayout>
  );

  if (loading) {
    return loadingSkeleton;
  }

  if (!profileData) {
    return (
      <MaidDashboardLayout>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Failed to load profile data</p>
            <Button onClick={fetchProfileData} className="w-full mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </MaidDashboardLayout>
    );
  }

  return (
    <MaidDashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-1">Showcase your professional presence and track your service journey.</p>
          </div>
          <Button 
            onClick={() => setEditDialogOpen(true)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        {/* Main Section: Profile Snapshot & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="overflow-hidden">
              <div className="relative h-32 bg-gradient-to-r from-primary/20 via-purple-200 to-pink-200">
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

                <div className="mb-4 space-y-2">
                  <h2 className="text-2xl font-bold">{displayName}</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">Sweep Pro Maid</Badge>
                    {profileData.isVerified ? (
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                        Pending Verification
                      </Badge>
                    )}
                  </div>
                  {profileData.bio ? (
                    <p className="text-sm text-muted-foreground">{profileData.bio}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Add a short introduction to highlight your experience and specialties.
                    </p>
                  )}
                </div>

                <div className="space-y-3 text-sm border-t pt-4">
                  {profileData.email && (
                    <div
                      className="flex items-center gap-2 p-2 bg-muted rounded hover:bg-muted/80 cursor-pointer transition-colors"
                      onClick={() => navigator.clipboard.writeText(profileData.email)}
                    >
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{profileData.email}</span>
                    </div>
                  )}
                  {profileData.phone && (
                    <div
                      className="flex items-center gap-2 p-2 bg-muted rounded hover:bg-muted/80 cursor-pointer transition-colors"
                      onClick={() => navigator.clipboard.writeText(profileData.phone)}
                    >
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{profileData.phone}</span>
                    </div>
                  )}
                  {profileData.address && (
                    <div className="flex items-start gap-2 p-2 bg-muted rounded">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-xs leading-relaxed">{profileData.address}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {primaryLanguages.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Languages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {primaryLanguages.map((language) => (
                      <Badge key={language} variant="secondary" className="bg-blue-100 text-blue-800">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {skills.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Core Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Card className="border-primary/10 bg-primary/5">
                <CardContent className="flex flex-col gap-3 pt-6">
                  <div className="flex items-center justify-between text-primary">
                    <span className="text-sm font-medium">Jobs Completed</span>
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="text-3xl font-bold text-primary">{profileData.jobsCompleted ?? 0}</div>
                  <p className="text-xs text-muted-foreground">Successful services you have completed.</p>
                </CardContent>
              </Card>

              <Card className="border-emerald-200/60 bg-emerald-50">
                <CardContent className="flex flex-col gap-3 pt-6">
                  <div className="flex items-center justify-between text-emerald-600">
                    <span className="text-sm font-medium">Total Earnings</span>
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="text-3xl font-bold text-emerald-600">{formattedEarnings}</div>
                  <p className="text-xs text-muted-foreground">Across all completed and approved bookings.</p>
                </CardContent>
              </Card>

              <Card className="border-blue-200/60 bg-blue-50">
                <CardContent className="flex flex-col gap-3 pt-6">
                  <div className="flex items-center justify-between text-blue-600">
                    <span className="text-sm font-medium">Experience</span>
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600">{profileData.experience ?? 0} yrs</div>
                  <p className="text-xs text-muted-foreground">Professional cleaning experience logged in your profile.</p>
                </CardContent>
              </Card>

              <Card className="border-yellow-200/60 bg-yellow-50">
                <CardContent className="flex flex-col gap-3 pt-6">
                  <div className="flex items-center justify-between text-yellow-600">
                    <span className="text-sm font-medium">Avg. Rating</span>
                    <Star className="h-4 w-4" />
                  </div>
                  <div className="text-3xl font-bold text-yellow-600">{averageRating.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">From {profileData.totalReviews ?? 0} customer reviews.</p>
                </CardContent>
              </Card>
            </div>

            {/* Account & Verification Details */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
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
                  {membershipDays > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="font-semibold flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {profileData.joinedDate ? new Date(profileData.joinedDate).toLocaleDateString() : ''}
                        <span className="text-xs text-muted-foreground">({membershipDays} days)</span>
                      </p>
                    </div>
                  )}
                  {profileData.verificationDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Verification Date</p>
                      <p className="font-semibold flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        {new Date(profileData.verificationDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className={`rounded-xl border border-dashed p-4 text-sm space-y-3 ${profileData.isVerified ? 'border-emerald-200 bg-emerald-50/70' : 'border-amber-200 bg-amber-50/70'}`}>
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Verification Status</p>
                      <p>{profileData.isVerified ? 'Your documents have been approved by the admin team.' : 'Awaiting admin approval. Upload all required documents to speed up verification.'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Service Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-muted bg-background p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Jobs Completed</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{profileData.jobsCompleted ?? 0}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Bookings successfully completed for customers.</p>
                  </div>
                  <div className="rounded-2xl border border-muted bg-background p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Average Rating</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{averageRating.toFixed(1)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Based on recent customer feedback.</p>
                  </div>
                  <div className="rounded-2xl border border-muted bg-background p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Experience</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{profileData.experience ?? 0} yrs</p>
                    <p className="mt-1 text-xs text-muted-foreground">Professional cleaning experience on record.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Feedback */}
            {reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Customer Feedback ({reviews.length} Reviews)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {review.reviewer.profileImage ? (
                              <img
                                src={review.reviewer.profileImage}
                                alt={review.reviewer.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground">
                                {review.reviewer.name?.charAt(0).toUpperCase() ?? 'C'}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-sm">{review.reviewer.name}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(review.serviceDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.round(review.rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-foreground mb-2 flex items-start gap-2">
                            <Quote className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span>{review.comment}</span>
                          </p>
                        )}
                        {review.serviceDetails && (
                          <p className="text-xs text-muted-foreground">Service: {review.serviceDetails}</p>
                        )}
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
    </MaidDashboardLayout>
  );
};

export default MaidProfilePage;
