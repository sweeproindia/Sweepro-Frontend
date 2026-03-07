import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Camera, Mail, Phone, Calendar, Shield, Clock, Activity, Key, ArrowLeft, Copy, Check } from 'lucide-react';
import { ProfileEditDialog } from '@/components/profile/ProfileEditDialog';
import { ImageUploadDialog } from '@/components/profile/ImageUploadDialog';
import { ChangePasswordDialog } from '@/components/profile/ChangePasswordDialog';
import { apiRequest, API_ENDPOINTS, HttpMethod } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface AdminProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  coverImage?: string;
  bio?: string;
  role?: string;
  joinDate?: string;
  createdAt?: string;
  permissions?: string[];
  hasPassword?: boolean;
  passwordChangedAt?: string;
}

export const AdminProfilePage: React.FC = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<AdminProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageType, setImageType] = useState<'profile' | 'cover'>('profile');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

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

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({ title: 'Copied', description: `${field} copied to clipboard` });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const displayName = profileData?.name || user?.name || 'Admin';
  const displayEmail = profileData?.email || user?.email || '';
  const displayPhone = profileData?.phone || user?.phone || '';
  const memberSince = profileData?.joinDate || profileData?.createdAt || user?.createdAt;

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="space-y-6 max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <Card className="overflow-hidden">
                <Skeleton className="h-36 w-full" />
                <CardContent className="p-6">
                  <div className="relative -mt-14 mb-4">
                    <Skeleton className="h-24 w-24 rounded-full" />
                  </div>
                  <div className="mb-4 space-y-2">
                    <Skeleton className="h-7 w-44" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <div className="space-y-2 border-t pt-4">
                    <Skeleton className="h-10 w-full rounded" />
                    <Skeleton className="h-10 w-full rounded" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-5 w-44" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  if (!profileData && !user) {
    return (
      <AdminDashboardLayout>
        <div className="max-w-5xl mx-auto">
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Failed to Load Profile</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-sm">
                We couldn't load your profile data. Please check your connection and try again.
              </p>
              <Button onClick={fetchProfileData} size="lg">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/admin#overview">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">My Profile</h1>
              <p className="text-muted-foreground text-sm mt-0.5">Manage your admin account settings</p>
            </div>
          </div>
          <Button 
            onClick={() => setEditDialogOpen(true)}
            className="gap-2"
            size="default"
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        {/* Main Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="overflow-hidden border-0 shadow-sm">
              {/* Cover Image */}
              <div className="relative h-36 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
                {profileData?.coverImage ? (
                  <img
                    src={profileData.coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-4 left-4 w-24 h-24 rounded-full bg-blue-400/20 blur-xl" />
                    <div className="absolute bottom-4 right-4 w-32 h-32 rounded-full bg-indigo-400/20 blur-xl" />
                  </div>
                )}
                <button
                  onClick={() => handleImageUpload('cover')}
                  className="absolute top-3 right-3 p-2 bg-white/90 rounded-lg hover:bg-white transition-colors shadow-md"
                >
                  <Camera className="h-4 w-4 text-slate-600" />
                </button>
                {/* Role Badge on cover */}
                <div className="absolute bottom-3 left-4">
                  <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/20 hover:bg-white/30">
                    <Shield className="h-3 w-3 mr-1" />
                    Administrator
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Profile Image */}
                <div className="relative -mt-14 mb-4">
                  <div className="relative inline-block">
                    {profileData?.profileImage ? (
                      <img
                        src={profileData.profileImage}
                        alt={displayName}
                        className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                        <span className="text-3xl font-bold text-white">{displayName.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <button
                      onClick={() => handleImageUpload('profile')}
                      className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors shadow-md"
                    >
                      <Camera className="h-3 w-3" />
                    </button>
                    {/* Online indicator */}
                    <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                </div>

                {/* Name & Bio */}
                <div className="mb-4">
                  <h2 className="text-xl font-bold tracking-tight">{displayName}</h2>
                  {profileData?.department && (
                    <p className="text-sm text-muted-foreground mt-0.5">{profileData.department}</p>
                  )}
                  {profileData?.bio && (
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{profileData.bio}</p>
                  )}
                </div>

                {/* Status Badge */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse" />
                    Active
                  </Badge>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-sm border-t pt-4">
                  {displayEmail && (
                    <button
                      onClick={() => handleCopy(displayEmail, 'Email')}
                      className="flex items-center gap-2 w-full p-2.5 bg-muted/50 rounded-lg hover:bg-muted transition-colors group"
                    >
                      <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate flex-1 text-left">{displayEmail}</span>
                      {copiedField === 'Email' 
                        ? <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                        : <Copy className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      }
                    </button>
                  )}
                  {displayPhone && (
                    <button
                      onClick={() => handleCopy(displayPhone, 'Phone')}
                      className="flex items-center gap-2 w-full p-2.5 bg-muted/50 rounded-lg hover:bg-muted transition-colors group"
                    >
                      <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate flex-1 text-left">{displayPhone}</span>
                      {copiedField === 'Phone'
                        ? <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                        : <Copy className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      }
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Account Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-800 font-medium">Role</span>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Administrator</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-green-800 font-medium">Status</span>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
                </div>
                {memberSince && (
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700 font-medium">Member Since</span>
                    <span className="text-sm font-medium text-slate-600">
                      {new Date(memberSince).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Details */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Account Details</CardTitle>
                <CardDescription>Your admin account information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Full Name</p>
                    <p className="font-semibold">{displayName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Address</p>
                    <p className="font-semibold">{displayEmail}</p>
                  </div>
                  {displayPhone && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone Number</p>
                      <p className="font-semibold">{displayPhone}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</p>
                    <p className="font-semibold flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      Administrator
                    </p>
                  </div>
                  {memberSince && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Member Since</p>
                      <p className="font-semibold flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(memberSince).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Permissions */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Permissions & Access</CardTitle>
                <CardDescription>Your access level across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {profileData?.permissions && profileData.permissions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {profileData.permissions.map((perm) => (
                      <div key={perm} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                        <span className="text-sm font-medium">{perm}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {['User Management', 'Booking Management', 'Payment Management', 'Partner Verification', 'Subscription Management', 'System Configuration'].map((perm) => (
                      <div key={perm} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                        <span className="text-sm font-medium">{perm}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Security</CardTitle>
                <CardDescription>Account security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Key className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Password</p>
                      <p className="text-xs text-muted-foreground">
                        {!profileData?.hasPassword
                          ? 'Using social login — no password set'
                          : profileData?.passwordChangedAt
                            ? `Last changed ${new Date(profileData.passwordChangedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                            : 'Never changed'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!profileData?.hasPassword}
                    onClick={() => setChangePasswordOpen(true)}
                  >
                    Change
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Session</p>
                      <p className="text-xs text-muted-foreground">Currently active</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Login Method</p>
                      <p className="text-xs text-muted-foreground">
                        {profileData?.hasPassword ? 'Email & Password' : 'Google / Social Login'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {profileData?.hasPassword ? 'Password' : 'OAuth'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialogs */}
        {profileData && (
          <>
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
          </>
        )}

        <ChangePasswordDialog
          open={changePasswordOpen}
          onOpenChange={setChangePasswordOpen}
          onPasswordChanged={fetchProfileData}
        />
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminProfilePage;
