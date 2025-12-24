import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { MaidDashboardLayout } from '@/components/dashboard/MaidDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Camera, Mail, Phone, Calendar, Star, Quote, ThumbsUp, MapPin, Clock } from 'lucide-react';
import { ProfileEditDialog } from '@/components/profile/ProfileEditDialog';
import { ImageUploadDialog } from '@/components/profile/ImageUploadDialog';
import { apiRequest, API_ENDPOINTS, HttpMethod } from '@/services/api';

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
          address: data?.addressLine || data?.address,
          role: data?.role
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
        setReviews(Array.isArray(list) ? list : []);
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

  if (loading) {
    return (
      <MaidDashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </MaidDashboardLayout>
    );
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
            <p className="text-muted-foreground mt-1">Maid Service Provider</p>
          </div>
          <Button 
            onClick={() => setEditDialogOpen(true)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        {/* Main Section: Profile + Languages (Left) & Contact Info (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: Profile Card + Languages */}
          <div className="space-y-4">
            {/* Profile Card */}
            <Card className="overflow-hidden">
              {/* Cover Image */}
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
                {/* Profile Image */}
                <div className="relative -mt-12 mb-4">
                  <div className="relative inline-block">
                    <img
                      src={profileData.profileImage || '/default-avatar.png'}
                      alt={profileData.fullName}
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
                <h2 className="text-2xl font-bold mb-1">{profileData.fullName}</h2>

                {/* Category & Verification Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="bg-blue-50">
                    Maid
                  </Badge>
                  {profileData.isVerified && (
                    <Badge className="bg-green-500 hover:bg-green-600">
                      ✓ Verified
                    </Badge>
                  )}
                </div>

                {/* Bio */}
                {profileData.bio && (
                  <p className="text-sm text-muted-foreground mb-4">{profileData.bio}</p>
                )}
              </CardContent>
            </Card>

            {/* Languages Card */}
            {profileData.languages && profileData.languages.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Languages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profileData.languages.map((lang) => (
                      <Badge key={lang} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skills Card */}
            {profileData.skills && profileData.skills.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT COLUMN: Contact Info Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Email */}
                {profileData.email && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">EMAIL</p>
                      <p className="text-sm font-medium cursor-pointer hover:text-primary transition-colors"
                        onClick={() => navigator.clipboard.writeText(profileData.email)}>
                        {profileData.email}
                      </p>
                    </div>
                  </div>
                )}

                {/* Phone */}
                {profileData.phone && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">PHONE</p>
                      <p className="text-sm font-medium cursor-pointer hover:text-primary transition-colors"
                        onClick={() => navigator.clipboard.writeText(profileData.phone)}>
                        {profileData.phone}
                      </p>
                    </div>
                  </div>
                )}

                {/* Address */}
                {profileData.address && (
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">ADDRESS</p>
                      <p className="text-sm font-medium">{profileData.address}</p>
                    </div>
                  </div>
                )}

                {/* Verification Status */}
                <div className={`flex items-center gap-3 p-3 rounded-lg border ${profileData.isVerified 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'}`}>
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${profileData.isVerified 
                    ? 'bg-green-500' 
                    : 'bg-red-500'}`}>
                    <span className="text-white text-xs">{profileData.isVerified ? '✓' : '✕'}</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">VERIFICATION STATUS</p>
                    <p className={`text-sm font-medium ${profileData.isVerified ? 'text-green-700' : 'text-red-700'}`}>
                      {profileData.isVerified ? 'Verified' : 'Not Verified'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FULL WIDTH: Rating & Reviews Section */}
        <div className="space-y-6">
          {/* Rating Stats - Full Width Prominent Card */}
          <Card className="border-2 border-yellow-400 shadow-lg">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                {/* Stars - Larger and Prominent */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-10 w-10 ${
                        i < Math.floor(profileData.rating || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                {/* Rating Number - Very Prominent */}
                <div className="text-6xl font-bold text-primary mb-2">
                  {profileData.rating?.toFixed(1) || '0'}
                </div>
                <p className="text-lg text-muted-foreground mb-4">
                  Based on {profileData.totalReviews || 0} reviews
                </p>
                
                {/* Additional Stats below rating */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t">
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {profileData.jobsCompleted || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Jobs Completed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Reviews */}
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
                          {review.reviewer.profileImage && (
                            <img
                              src={review.reviewer.profileImage}
                              alt={review.reviewer.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
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
                                i < review.rating
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
                        <p className="text-xs text-muted-foreground">{review.serviceDetails}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills Section */}
          {/* Skills moved to left column with languages - removed from here to avoid duplication */}
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
