import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Mail, Phone, Shield, Calendar, User, Lock, ArrowLeft } from 'lucide-react';
import { ProfileEditDialog } from '@/components/profile/ProfileEditDialog';
import { apiRequest, API_ENDPOINTS, HttpMethod } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

interface AdminProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
  createdAt?: string;
  joinDate?: string;
}

export const AdminProfilePage: React.FC = () => {
  const { user } = useUser();
  const [profileData, setProfileData] = useState<AdminProfileData | null>(null);
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
      console.error('Error fetching admin profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayName = profileData?.name || user?.name || 'System Admin';
  const displayEmail = profileData?.email || user?.email || 'admin@sweepro.in';
  const displayPhone = profileData?.phone || user?.phone || '';
  const roleName = (profileData?.role || user?.role || 'ADMIN').toUpperCase();

  const getInitials = (name: string) => {
    if (!name) return 'AD';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-48 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
          <Card className="rounded-2xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <Skeleton className="h-20 w-20 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/admin#overview">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-slate-200">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Settings & Profile</h1>
              <p className="text-slate-500 text-sm mt-0.5">Manage administrator credentials and account details</p>
            </div>
          </div>

          <Button
            onClick={() => setEditDialogOpen(true)}
            className="gap-2 rounded-xl h-10 px-4"
          >
            <Edit className="h-4 w-4" />
            Edit Admin Details
          </Button>
        </div>

        {/* Streamlined Production-Grade Admin Card */}
        <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 px-6 flex items-center justify-between">
            <Badge className="bg-white/20 backdrop-blur-md text-white border-white/20 text-xs py-1 px-3">
              <Shield className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
              {roleName} ACCESS
            </Badge>
            <span className="text-xs text-slate-300 font-mono">ID: {profileData?.id ? profileData.id.slice(0, 8) : 'ADMIN'}</span>
          </div>

          <CardContent className="p-6 sm:p-8 pt-0 relative">
            <div className="-mt-10 mb-6 flex items-end justify-between">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-4 ring-white">
                {getInitials(displayName)}
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">{displayName}</h2>
              <p className="text-sm text-slate-500 mt-0.5">Sweepro Platform Administrator</p>
            </div>

            {/* Admin Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  Full Name
                </p>
                <p className="font-semibold text-slate-900 text-base">{displayName}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  Admin Email Address <Lock className="h-3 w-3 text-slate-400" />
                </p>
                <p className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                  {displayEmail}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">Read-only</span>
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Contact Phone Number</p>
                <p className="font-semibold text-slate-900 text-sm">{displayPhone || 'Not configured'}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Security Privilege</p>
                <p className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-emerald-600" /> Full System Control
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Edit Dialog */}
        <ProfileEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          userData={{
            ...profileData,
            name: displayName,
            email: displayEmail,
            phone: displayPhone,
            role: roleName
          }}
          onProfileUpdated={fetchProfileData}
        />
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminProfilePage;
