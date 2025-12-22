import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Camera, Mail, Phone, Calendar } from 'lucide-react';
import { ProfileEditDialog } from '@/components/profile/ProfileEditDialog';
import { ImageUploadDialog } from '@/components/profile/ImageUploadDialog';
import { apiRequest, API_ENDPOINTS, HttpMethod } from '@/services/api';

interface AdminProfileData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profileImage?: string;
  coverImage?: string;
  bio?: string;
  role?: string;
  joinDate?: string;
  department?: string;
  permissions?: string[];
}

export const AdminProfilePage: React.FC = () => {
  const { user } = useUser();
  const [profileData, setProfileData] = useState<AdminProfileData | null>(null);
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

  const handleImageUpload = (type: 'profile' | 'cover') => {
    setImageType(type);
    setImageDialogOpen(true);
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </AdminDashboardLayout>
    );
  }

  if (!profileData) {
    return (
      <AdminDashboardLayout>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Failed to load profile data</p>
            <Button onClick={fetchProfileData} className="w-full mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Profile</h1>
            <p className="text-muted-foreground mt-1">Manage your administrative account</p>
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
              <div className="relative h-32 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20">
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
                <div className="mb-4">
                  <h2 className="text-2xl font-bold">{profileData.fullName}</h2>
                  {profileData.department && (
                    <p className="text-sm text-muted-foreground">{profileData.department}</p>
                  )}
                  {profileData.bio && (
                    <p className="text-sm text-muted-foreground mt-2">{profileData.bio}</p>
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
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Admin Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Details */}
            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-semibold">{profileData.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold">{profileData.email}</p>
                  </div>
                  {profileData.department && (
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="font-semibold">{profileData.department}</p>
                    </div>
                  )}
                  {profileData.joinDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Join Date</p>
                      <p className="font-semibold flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(profileData.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Permissions */}
            {profileData.permissions && profileData.permissions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Permissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {profileData.permissions.map((perm) => (
                      <div key={perm} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-sm">{perm}</span>
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
    </AdminDashboardLayout>
  );
};

export default AdminProfilePage;
