import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { MaidDashboardLayout } from '@/components/dashboard/MaidDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Edit, Mail, Phone, Star, MapPin, ShieldCheck, Copy, Check, RefreshCw, Loader2, Lock, Building2 } from 'lucide-react';
import { ProfileEditDialog } from '@/components/profile/ProfileEditDialog';
import { apiRequest, API_ENDPOINTS, HttpMethod } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { getMaidQRCode, setMaidCustomCode } from '@/services/qrService';
import { useToast } from '@/hooks/use-toast';

interface MaidProfileData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
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
  };
  serviceDetails?: string;
}

export const MaidProfilePage: React.FC = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<MaidProfileData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Verification code state
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [customCodeInput, setCustomCodeInput] = useState<string>('');
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeSaving, setCodeSaving] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    fetchProfileData();
    fetchMaidReviews();
    fetchVerificationCode();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(API_ENDPOINTS.PROFILE.ME, {
        method: HttpMethod.GET,
        requiresAuth: true
      });

      if (response.success && response.data) {
        const raw = response.data;
        const maidData: MaidProfileData = {
          id: raw.id,
          fullName: raw.name || raw.fullName || user?.name || 'Maid',
          email: raw.email || user?.email || '',
          phone: raw.phone || user?.phone || '',
          address: raw.address || user?.address || '',
          isVerified: raw.maidProfile?.isVerified ?? raw.isVerified ?? false,
          rating: raw.maidProfile?.rating ?? 5.0,
          jobsCompleted: raw.maidProfile?.completedBookings ?? raw.maidProfile?.jobsCompleted ?? 0,
          languages: raw.maidProfile?.languages || ['English', 'Hindi', 'Telugu'],
          skills: raw.maidProfile?.skills || ['Sweeping', 'Mopping', 'Utensil Cleaning']
        };
        setProfileData(maidData);
      }
    } catch (error) {
      console.error('Error fetching maid profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaidReviews = async () => {
    try {
      const response = await apiRequest(API_ENDPOINTS.FEEDBACK.MAID_FEEDBACK, {
        method: HttpMethod.GET,
        requiresAuth: true
      });
      if (response.success && response.data) {
        setReviews(response.data);
      }
    } catch {
      setReviews([]);
    }
  };

  const fetchVerificationCode = async () => {
    try {
      setCodeLoading(true);
      const response = await getMaidQRCode();
      if (response.success && response.data) {
        setVerificationCode(response.data.verificationCode);
      }
    } catch {
      setVerificationCode('');
    } finally {
      setCodeLoading(false);
    }
  };

  const handleSaveCustomCode = async () => {
    const trimmed = customCodeInput.trim().toUpperCase();
    if (trimmed.length !== 10) {
      toast({ title: 'Invalid code', description: 'Code must be exactly 10 alphanumeric characters', variant: 'destructive' });
      return;
    }
    if (!/^[A-Z0-9]{10}$/.test(trimmed)) {
      toast({ title: 'Invalid code', description: 'Code can only contain letters and numbers', variant: 'destructive' });
      return;
    }
    try {
      setCodeSaving(true);
      const res = await setMaidCustomCode(trimmed);
      if (res.success && res.data) {
        setVerificationCode(res.data.verificationCode);
        setIsEditingCode(false);
        setCustomCodeInput('');
        toast({ title: 'Code updated', description: 'Your verification code has been updated successfully' });
      } else {
        toast({ title: 'Error', description: (res as any).message || 'Failed to update code', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to update code', variant: 'destructive' });
    } finally {
      setCodeSaving(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(verificationCode);
      setCodeCopied(true);
      toast({ title: 'Copied!', description: 'Verification code copied to clipboard' });
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      toast({ title: 'Copy failed', description: 'Please copy the code manually', variant: 'destructive' });
    }
  };

  const displayName = profileData?.fullName || user?.name || 'Homecare Partner';
  const displayEmail = profileData?.email || user?.email || '';
  const displayPhone = profileData?.phone || user?.phone || '';
  const displayAddress = profileData?.address || user?.address || 'No service address set';

  const getInitials = (name: string) => {
    if (!name) return 'MP';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <MaidDashboardLayout>
        <div className="space-y-6 max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-48 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 lg:col-span-2 w-full rounded-2xl" />
          </div>
        </div>
      </MaidDashboardLayout>
    );
  }

  return (
    <MaidDashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Partner Profile</h1>
            <p className="text-slate-500 text-sm mt-1">Manage your homecare partner profile and contact information</p>
          </div>
          <Button 
            onClick={() => setEditDialogOpen(true)}
            className="gap-2 rounded-xl h-11 px-5 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Summary Card */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white">
              <div className="h-24 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 relative">
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-semibold uppercase tracking-wider text-white border border-white/20">
                  {profileData?.isVerified ? '✓ Verified Partner' : 'Homecare Partner'}
                </div>
              </div>

              <CardContent className="p-6 pt-0 relative">
                <div className="-mt-12 mb-4 flex justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-2xl shadow-xl ring-4 ring-white">
                    {getInitials(displayName)}
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900">{displayName}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{displayEmail}</p>
                </div>

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

                  <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                      <Star className="h-3.5 w-3.5 text-amber-500" /> Rating
                    </span>
                    <span className="font-semibold text-slate-900">{profileData?.rating || 5.0} / 5.0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Account Details & Address */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Partner Account Details
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
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">Read-only</span>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Phone Number</p>
                    <p className="font-semibold text-slate-900 text-sm">{displayPhone || 'Not provided'}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Verification Status</p>
                    <p className="font-semibold text-emerald-700 text-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {profileData?.isVerified ? 'Verified Active Partner' : 'Verification Complete'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Address */}
            <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-emerald-600" />
                  Primary Service Base & Address
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
              <CardContent className="pt-5">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{displayAddress}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Assigned service base area for local concierge dispatch.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verification Code Section */}
            <Card className="rounded-2xl border border-emerald-200 bg-emerald-50/50 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base font-bold text-emerald-900">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    My Assignment Check-in Code
                  </CardTitle>
                  {!isEditingCode && verificationCode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCustomCodeInput(verificationCode);
                        setIsEditingCode(true);
                      }}
                      className="h-8 text-xs rounded-lg border-emerald-200 bg-white"
                    >
                      Customize Code
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {codeLoading ? (
                  <Skeleton className="h-10 w-48 rounded-xl" />
                ) : isEditingCode ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={customCodeInput}
                        onChange={(e) => setCustomCodeInput(e.target.value.toUpperCase())}
                        maxLength={10}
                        placeholder="10-digit code"
                        className="font-mono text-center tracking-widest text-base uppercase bg-white rounded-xl"
                      />
                      <Button onClick={handleSaveCustomCode} disabled={codeSaving} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                        {codeSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingCode(false)} className="rounded-xl">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <code className="px-4 py-2 bg-white rounded-xl border border-emerald-200 font-mono font-bold text-lg text-emerald-900 tracking-wider shadow-xs">
                      {verificationCode || 'Not Generated'}
                    </code>
                    {verificationCode && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopyCode}
                        className="h-9 w-9 text-emerald-700 hover:bg-emerald-100 rounded-xl"
                      >
                        {codeCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                )}
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
    </MaidDashboardLayout>
  );
};

export default MaidProfilePage;
