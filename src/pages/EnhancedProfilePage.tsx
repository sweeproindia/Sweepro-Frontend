import React, { useState, useEffect } from 'react';
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
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        {/* Cover Image & Profile Picture */}
        <Card className="mb-8 overflow-hidden">
          <div className="relative">
            {/* Cover Image */}
            <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
              {userData.coverImage && (
                <img
                  src={userData.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              )}
              <button
                onClick={() => handleImageUpload('cover')}
                className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            {/* Profile Picture */}
            <div className="absolute -bottom-16 left-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden">
                  {userData.profileImage ? (
                    <img
                      src={userData.profileImage}
                      alt={userData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <User className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleImageUpload('profile')}
                  className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Profile Header Info */}
          <CardContent className="pt-20 pb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{userData.name}</h2>
                <div className="flex items-center space-x-2 mt-2">
                  {getRoleIcon(userData.role)}
                  <span className="text-sm text-gray-600 capitalize">
                    {userData.role?.toLowerCase()}
                  </span>
                  <Badge className={getStatusColor(userData.status)}>
                    {userData.status}
                  </Badge>
                  {userData.role === 'MAID' && userData.maidProfile?.isVerified && (
                    <Badge className="bg-blue-100 text-blue-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                {userData.role === 'MAID' && userData.maidProfile && (
                  <div className="flex items-center space-x-1 mt-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="text-lg font-semibold">{userData.maidProfile.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">
                      ({userData.maidProfile.totalRatings} reviews)
                    </span>
                  </div>
                )}
              </div>

              {/* Profile Completeness */}
              {stats && (
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">Profile Completeness</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${stats.profileCompleteness}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold">{stats.profileCompleteness}%</span>
                  </div>
                </div>
              )}
            </div>

            {userData.bio && (
              <p className="text-gray-600 mt-4">{userData.bio}</p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Contact & Stats */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{userData.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{userData.phone}</span>
                </div>
                {userData.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                    <span className="text-sm text-gray-600">{userData.address}</span>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Joined {new Date(userData.createdAt).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userData.role === 'CUSTOMER' && (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-gray-600">Total Bookings</span>
                        </div>
                        <span className="font-semibold">{stats.totalBookings || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-600">Total Spent</span>
                        </div>
                        <span className="font-semibold">₹{stats.totalSpent?.toLocaleString() || 0}</span>
                      </div>
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
                        <span className="font-semibold">₹{stats.totalEarnings?.toLocaleString() || 0}</span>
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

            {/* Social Links */}
            {userData.socialLinks && Object.values(userData.socialLinks).some(link => link) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    Social Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {userData.socialLinks.facebook && (
                    <a
                      href={userData.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-blue-600 hover:underline"
                    >
                      Facebook
                    </a>
                  )}
                  {userData.socialLinks.instagram && (
                    <a
                      href={userData.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-pink-600 hover:underline"
                    >
                      Instagram
                    </a>
                  )}
                  {userData.socialLinks.twitter && (
                    <a
                      href={userData.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-blue-400 hover:underline"
                    >
                      Twitter
                    </a>
                  )}
                  {userData.socialLinks.linkedin && (
                    <a
                      href={userData.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-blue-700 hover:underline"
                    >
                      LinkedIn
                    </a>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skills/Specializations for Maid */}
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {userData.maidProfile.certifications.map((cert: string, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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

            {/* Interests for Customer */}
            {userData.role === 'CUSTOMER' && userData.customerProfile?.interests?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {userData.customerProfile.interests.map((interest: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
