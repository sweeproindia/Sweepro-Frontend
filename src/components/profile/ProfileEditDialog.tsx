import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Phone, 
  Mail,
  Lock,
  Building2,
  Home,
  Layers,
  MapPin,
  Loader2
} from 'lucide-react';
import { apiRequest, API_ENDPOINTS, HttpMethod, getAuthTokenType } from '@/services/api';
import { AuthService, Apartment } from '@/services/authService';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData: any;
  onProfileUpdated: () => void;
}

export const ProfileEditDialog: React.FC<ProfileEditDialogProps> = ({
  open,
  onOpenChange,
  userData,
  onProfileUpdated
}) => {
  const { user, updateUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const userRole = (userData?.role || (user as any)?.role || 'CUSTOMER').toUpperCase();
  const isMaid = userRole === 'MAID';
  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERVISOR';
  
  // Basic Info State (Email is read-only)
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });

  // Customer Apartment & Address State (Structured matching Signup & Payments)
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [isLoadingApartments, setIsLoadingApartments] = useState(false);
  const [selectedApartmentId, setSelectedApartmentId] = useState<string>('');
  const [apartmentNumber, setApartmentNumber] = useState<string>('');
  const [floorNumber, setFloorNumber] = useState<string>('');

  // Maid Residential Address State (Simple address + pincode like Signup)
  const [maidAddress, setMaidAddress] = useState<string>('');
  const [maidPincode, setMaidPincode] = useState<string>('');

  // Fetch available apartments list from backend (only for Customers)
  useEffect(() => {
    const fetchApartments = async () => {
      if (isMaid || isAdmin) return;
      setIsLoadingApartments(true);
      try {
        const response = await AuthService.getApartments();
        if (response.success && response.data?.apartments) {
          setApartments(response.data.apartments);
        }
      } catch (error) {
        console.error('Failed to fetch apartments list:', error);
      } finally {
        setIsLoadingApartments(false);
      }
    };

    if (open && !isMaid && !isAdmin) {
      fetchApartments();
    }
  }, [open, isMaid, isAdmin]);

  // Populate form fields on userData change
  useEffect(() => {
    if (userData) {
      setBasicInfo({
        name: userData.name || userData.fullName || '',
        phone: userData.phone || '',
        email: userData.email || ''
      });

      if (isMaid) {
        setMaidAddress(userData.address || '');
        setMaidPincode(userData.pincode || '');
      } else if (!isAdmin) {
        // Parse customer existing address into structured apartment components
        const rawAddress = userData.address || '';
        const unitMatch = rawAddress.match(/\bApt:\s*([^,]+)/i);
        const floorMatch = rawAddress.match(/\bFloor:\s*([^,]+)/i);
        const aptMatch = rawAddress.match(/^(.*?)\s*-\s*([^,]+)/);

        setApartmentNumber(unitMatch?.[1]?.trim() || userData.apartmentNumber || '');
        setFloorNumber(floorMatch?.[1]?.trim() || userData.floorNumber || '');

        if (userData.apartment_id) {
          setSelectedApartmentId(userData.apartment_id);
        } else if (apartments.length > 0) {
          const aptName = aptMatch?.[1]?.trim() || '';
          const aptArea = aptMatch?.[2]?.trim() || '';
          const matched = apartments.find(
            a => (aptName && a.name.toLowerCase().includes(aptName.toLowerCase())) ||
                 (aptArea && a.area.toLowerCase().includes(aptArea.toLowerCase())) ||
                 (rawAddress && rawAddress.toLowerCase().includes(a.name.toLowerCase()))
          );
          if (matched) setSelectedApartmentId(matched.id);
        }
      }
    }
  }, [userData, apartments, isMaid, isAdmin]);

  const handleSaveBasicInfo = async () => {
    if (!basicInfo.name.trim()) {
      toast.error('Full name is required');
      return;
    }
    if (!basicInfo.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    setLoading(true);
    try {
      const tokenType = getAuthTokenType();
      const endpoint = tokenType === 'firebase' ? '/auth/firebase/update-profile' : API_ENDPOINTS.PROFILE.UPDATE_USER;

      const response = await apiRequest(endpoint, {
        method: HttpMethod.PUT,
        body: {
          name: basicInfo.name,
          phone: basicInfo.phone
        },
        requiresAuth: true
      });

      if (response.success) {
        updateUser({ name: basicInfo.name, phone: basicInfo.phone } as any);
        toast.success('Profile information updated successfully');
        onProfileUpdated();
        onOpenChange(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update basic information');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    if (isMaid) {
      if (!maidAddress.trim()) {
        toast.error('Residential address is required');
        return;
      }
      if (!maidPincode.trim() || maidPincode.trim().length !== 6) {
        toast.error('Valid 6-digit pincode is required');
        return;
      }

      setLoading(true);
      try {
        const tokenType = getAuthTokenType();
        const endpoint = tokenType === 'firebase' ? '/auth/firebase/update-profile' : API_ENDPOINTS.PROFILE.UPDATE_USER;

        const response = await apiRequest(endpoint, {
          method: HttpMethod.PUT,
          body: {
            address: maidAddress.trim(),
            pincode: maidPincode.trim()
          },
          requiresAuth: true
        });

        if (response.success) {
          updateUser({
            address: maidAddress.trim(),
            pincode: maidPincode.trim()
          } as any);
          toast.success('Address updated successfully');
          onProfileUpdated();
          onOpenChange(false);
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to update address');
      } finally {
        setLoading(false);
      }
    } else {
      // Customer Address Validation & Saving
      if (!selectedApartmentId) {
        toast.error('Please select an apartment complex from the list');
        return;
      }
      if (!apartmentNumber.trim()) {
        toast.error('Flat/Apartment number is required');
        return;
      }
      if (!floorNumber.trim()) {
        toast.error('Floor number is required');
        return;
      }

      const apt = apartments.find((a) => a.id === selectedApartmentId);
      if (!apt) {
        toast.error('Selected apartment is invalid');
        return;
      }

      const formattedAddress = `${apt.name} - ${apt.area}, Apt: ${apartmentNumber.trim()}, Floor: ${floorNumber.trim()}`;

      setLoading(true);
      try {
        const tokenType = getAuthTokenType();
        const endpoint = tokenType === 'firebase' ? '/auth/firebase/update-profile' : API_ENDPOINTS.PROFILE.UPDATE_USER;

        const response = await apiRequest(endpoint, {
          method: HttpMethod.PUT,
          body: {
            address: formattedAddress,
            apartment_id: selectedApartmentId,
            locality: apt.area,
            city: apt.city,
            state: apt.state,
            pincode: apt.pincode
          },
          requiresAuth: true
        });

        if (response.success) {
          updateUser({
            address: formattedAddress,
            apartment_id: selectedApartmentId,
            locality: apt.area,
            city: apt.city,
            state: apt.state,
            pincode: apt.pincode
          } as any);
          toast.success('Address updated successfully');
          onProfileUpdated();
          onOpenChange(false);
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to update address');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Profile</DialogTitle>
          <DialogDescription className="text-slate-500 text-sm">
            Update your account details. Email address is fixed for security.
          </DialogDescription>
        </DialogHeader>

        {isAdmin ? (
          /* Simplified Admin Single Form */
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="admin-name" className="text-xs font-semibold uppercase tracking-wider text-slate-600">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="admin-name"
                  value={basicInfo.name}
                  onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                  className="pl-10 h-11 rounded-xl"
                  placeholder="Administrator Name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-email" className="text-xs font-semibold uppercase tracking-wider text-slate-600">Email Address (Read-only)</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="admin-email"
                  value={basicInfo.email}
                  disabled
                  readOnly
                  className="pl-10 pr-10 h-11 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200"
                />
                <Lock className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-400">Admin email cannot be modified.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-phone" className="text-xs font-semibold uppercase tracking-wider text-slate-600">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="admin-phone"
                  value={basicInfo.phone}
                  onChange={(e) => setBasicInfo({ ...basicInfo, phone: e.target.value })}
                  className="pl-10 h-11 rounded-xl"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button onClick={handleSaveBasicInfo} disabled={loading} className="w-full sm:w-auto rounded-xl">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </div>
        ) : (
          /* User / Maid Tabbed Form */
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-xl p-1 bg-slate-100">
              <TabsTrigger value="basic" className="rounded-lg text-xs font-semibold uppercase tracking-wider">
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="address" className="rounded-lg text-xs font-semibold uppercase tracking-wider">
                Address
              </TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 pt-3">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-slate-600">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="name"
                    value={basicInfo.name}
                    onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                    className="pl-10 h-11 rounded-xl"
                    placeholder="Your full name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-600">Email Address (Read-only)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    value={basicInfo.email}
                    disabled
                    readOnly
                    className="pl-10 pr-10 h-11 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200"
                  />
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-400">Email address is locked for security reasons.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-slate-600">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="phone"
                    value={basicInfo.phone}
                    onChange={(e) => setBasicInfo({ ...basicInfo, phone: e.target.value })}
                    className="pl-10 h-11 rounded-xl"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button onClick={handleSaveBasicInfo} disabled={loading} className="w-full sm:w-auto rounded-xl">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Basic Info
                </Button>
              </DialogFooter>
            </TabsContent>

            {/* Address Tab – Maid (Simple Residential Address + Pincode) vs Customer (Structured Apartment Picker) */}
            <TabsContent value="address" className="space-y-4 pt-3">
              {isMaid ? (
                /* Maid Simple Address Form */
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="maid-address" className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <Home className="h-4 w-4 text-slate-400" />
                      Residential Address *
                    </Label>
                    <div className="relative">
                      <Input
                        id="maid-address"
                        value={maidAddress}
                        onChange={(e) => setMaidAddress(e.target.value)}
                        placeholder="Full address with street, locality & city"
                        className="h-11 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maid-pincode" className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      Pincode *
                    </Label>
                    <Input
                      id="maid-pincode"
                      value={maidPincode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setMaidPincode(val);
                      }}
                      placeholder="6-digit pincode (e.g. 500032)"
                      maxLength={6}
                      inputMode="numeric"
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
              ) : (
                /* Customer Structured Apartment Picker */
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="apartment-select" className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      Apartment Complex / Gated Community *
                    </Label>
                    <Select
                      value={selectedApartmentId}
                      onValueChange={setSelectedApartmentId}
                      disabled={isLoadingApartments}
                    >
                      <SelectTrigger className="h-11 rounded-xl bg-white border-slate-200">
                        <SelectValue placeholder={isLoadingApartments ? "Loading apartments list..." : "Choose your apartment complex"} />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {apartments.map((apt) => (
                          <SelectItem key={apt.id} value={apt.id}>
                            {apt.name} - {apt.area} ({apt.pincode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-slate-400">Choose from available Sweepro serviced communities.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="flat-number" className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                        <Home className="h-4 w-4 text-slate-400" />
                        Flat / House No. *
                      </Label>
                      <Input
                        id="flat-number"
                        value={apartmentNumber}
                        onChange={(e) => setApartmentNumber(e.target.value)}
                        placeholder="e.g. A-402 or 104"
                        className="h-11 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="floor-number" className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                        <Layers className="h-4 w-4 text-slate-400" />
                        Floor Number *
                      </Label>
                      <Input
                        id="floor-number"
                        value={floorNumber}
                        onChange={(e) => setFloorNumber(e.target.value)}
                        placeholder="e.g. 4th Floor"
                        className="h-11 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="pt-4">
                <Button onClick={handleSaveAddress} disabled={loading || (isLoadingApartments && !isMaid)} className="w-full sm:w-auto rounded-xl">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Address
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
