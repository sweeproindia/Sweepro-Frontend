import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Mail, Phone, MapPin, Calendar, User, Lock, Building2 } from 'lucide-react';
import { ProfileEditDialog } from '@/components/profile/ProfileEditDialog';
import { apiRequest, API_ENDPOINTS, HttpMethod } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';

interface CustomerProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  locality?: string;
  city?: string;
  state?: string;
  pincode?: string;
  role?: string;
  joinDate?: string;
  createdAt?: string;
  totalBookings?: number;
  remainingDays?: number;
}

export const CustomerProfilePage: React.FC = () => {
  const { user } = useUser();
  const [profileData, setProfileData] = useState<CustomerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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
      if (response.success && response.data) {
        setProfileData(response.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayName = profileData?.name || user?.name || 'Customer';
  const displayEmail = profileData?.email || user?.email || '';
  const displayPhone = profileData?.phone || user?.phone || '';
  const displayAddress = profileData?.address || user?.address || 'No service address set';
  const getInitials = (name: string) => {
    if (!name) return 'CU';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 rounded-lg" />
              <Skeleton className="h-4 w-64 rounded-lg" />
            </div>
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 lg:col-span-2 w-full rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">My Profile</h1>
            <p className="text-slate-500 text-sm mt-1">Manage your account details and default service address</p>
          </div>
          <Button
            onClick={() => setEditDialogOpen(true)}
            className="gap-2 rounded-xl h-11 px-5 shadow-sm"
          >
            <Edit className="h-4 w-4" />
            Edit Profile & Address
          </Button>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column – Personal Summary Card */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white">
              {/* Header Gradient */}
              <div className="h-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-semibold uppercase tracking-wider text-white border border-white/20">
                  Customer
                </div>
              </div>

              <CardContent className="p-6 pt-0 relative">
                {/* Initials Avatar */}
                <div className="-mt-12 mb-4 flex justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-4 ring-white">
                    {getInitials(displayName)}
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900">{displayName}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{displayEmail}</p>
                </div>

                {/* Account Details Quick Summary */}
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                      <Mail className="h-3.5 w-3.5 text-slate-400" /> Email
                    </span>
                    <span className="font-semibold text-slate-700 truncate max-w-[170px]">{displayEmail}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                      <Phone className="h-3.5 w-3.5 text-slate-400" /> Phone
                    </span>
                    <span className="font-semibold text-slate-700">{displayPhone || 'Not added'}</span>
                  </div>

                  {(profileData?.joinDate || profileData?.createdAt) && (
                    <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" /> Joined
                      </span>
                      <span className="font-semibold text-slate-700">
                        {new Date(profileData.joinDate || profileData.createdAt!).toLocaleDateString('en-IN', {
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column – Account & Address Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Info Details */}
            <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="h-4 w-4 text-indigo-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Full Name</p>
                    <p className="font-semibold text-slate-900 text-sm">{displayName}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      Email Address <Lock className="h-3 w-3 text-slate-400" />
                    </p>
                    <p className="font-semibold text-slate-700 text-sm flex items-center gap-1.5">
                      {displayEmail}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">Fixed</span>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Phone Number</p>
                    <p className="font-semibold text-slate-900 text-sm">{displayPhone || 'Not provided'}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Account Role</p>
                    <p className="font-semibold text-slate-900 text-sm">Customer / Resident</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Structured Service Address Card (Matches Payments & Signup) */}
            <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-indigo-600" />
                  Service & Billing Address
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditDialogOpen(true)}
                  className="rounded-lg h-8 text-xs gap-1.5"
                >
                  <Edit className="h-3.5 w-3.5" /> Edit Address
                </Button>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{displayAddress}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      This address is automatically pre-selected when booking concierge cleaning services.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Profile Edit Dialog */}
        <ProfileEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          userData={{
            ...profileData,
            name: displayName,
            email: displayEmail,
            phone: displayPhone,
            address: displayAddress
          }}
          onProfileUpdated={fetchProfileData}
        />
      </div>
    </DashboardLayout>
  );
};

export default CustomerProfilePage;
