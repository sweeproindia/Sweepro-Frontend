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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Globe,
  Lock,
  Camera,
  X,
  Plus,
  Loader2
} from 'lucide-react';
import { apiRequest, API_ENDPOINTS, HttpMethod } from '@/services/api';
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
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Basic Info State
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    phone: '',
    bio: '',
    dateOfBirth: '',
    gender: '',
    isProfilePublic: true
  });

  // Address State
  const [address, setAddress] = useState({
    addressLine: '',
    locality: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });

  // Social Links State
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: ''
  });

  // Role-specific state
  const [customerInfo, setCustomerInfo] = useState({
    emergencyContact: '',
    specialInstructions: '',
    interests: [] as string[],
    favoriteServices: [] as string[]
  });

  const [maidInfo, setMaidInfo] = useState({
    skills: [] as string[],
    languages: [] as string[],
    experienceYears: 0,
    hourlyRate: 0,
    certifications: [] as string[],
    specializations: [] as string[]
  });

  // Temporary input states for arrays
  const [newInterest, setNewInterest] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [newSpecialization, setNewSpecialization] = useState('');

  useEffect(() => {
    if (userData) {
      // Populate basic info
      setBasicInfo({
        name: userData.name || '',
        phone: userData.phone || '',
        bio: userData.bio || '',
        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
        gender: userData.gender || '',
        isProfilePublic: userData.isProfilePublic ?? true
      });

      // Populate address
      setAddress({
        addressLine: userData.addressLine || '',
        locality: userData.locality || '',
        city: userData.city || '',
        state: userData.state || '',
        pincode: userData.pincode || '',
        landmark: userData.landmark || ''
      });

      // Populate social links
      if (userData.socialLinks) {
        setSocialLinks(userData.socialLinks);
      }

      // Populate role-specific data
      if (userData.role === 'CUSTOMER' && userData.customerProfile) {
        setCustomerInfo({
          emergencyContact: userData.customerProfile.emergencyContact || '',
          specialInstructions: userData.customerProfile.specialInstructions || '',
          interests: userData.customerProfile.interests || [],
          favoriteServices: userData.customerProfile.favoriteServices || []
        });
      }

      if (userData.role === 'MAID' && userData.maidProfile) {
        setMaidInfo({
          skills: userData.maidProfile.skills || [],
          languages: userData.maidProfile.languages || [],
          experienceYears: userData.maidProfile.experienceYears || 0,
          hourlyRate: userData.maidProfile.hourlyRate || 0,
          certifications: userData.maidProfile.certifications || [],
          specializations: userData.maidProfile.specializations || []
        });
      }
    }
  }, [userData]);

  const handleSaveBasicInfo = async () => {
    setLoading(true);
    try {
      const response = await apiRequest(API_ENDPOINTS.PROFILE.UPDATE_USER, {
        method: HttpMethod.PUT,
        body: {
          ...basicInfo,
          dateOfBirth: basicInfo.dateOfBirth || null,
          socialLinks
        },
        requiresAuth: true
      });

      if (response.success) {
        toast.success('Basic information updated successfully');
        onProfileUpdated();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update basic information');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    setLoading(true);
    try {
      const response = await apiRequest(API_ENDPOINTS.PROFILE.UPDATE_USER, {
        method: HttpMethod.PUT,
        body: address,
        requiresAuth: true
      });

      if (response.success) {
        toast.success('Address updated successfully');
        onProfileUpdated();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update address');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCustomerInfo = async () => {
    setLoading(true);
    try {
      const response = await apiRequest(API_ENDPOINTS.PROFILE.UPDATE_CUSTOMER, {
        method: HttpMethod.PUT,
        body: customerInfo,
        requiresAuth: true
      });

      if (response.success) {
        toast.success('Customer profile updated successfully');
        onProfileUpdated();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update customer profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMaidInfo = async () => {
    setLoading(true);
    try {
      const response = await apiRequest(API_ENDPOINTS.PROFILE.UPDATE_MAID, {
        method: HttpMethod.PUT,
        body: maidInfo,
        requiresAuth: true
      });

      if (response.success) {
        toast.success('Homecare partner profile updated successfully');
        onProfileUpdated();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update homecare partner profile');
    } finally {
      setLoading(false);
    }
  };

  const addToArray = (
    array: string[],
    value: string,
    setter: React.Dispatch<React.SetStateAction<any>>,
    key: string,
    clearInput: () => void
  ) => {
    if (value.trim() && !array.includes(value.trim())) {
      setter((prev: any) => ({
        ...prev,
        [key]: [...prev[key], value.trim()]
      }));
      clearInput();
    }
  };

  const removeFromArray = (
    array: string[],
    value: string,
    setter: React.Dispatch<React.SetStateAction<any>>,
    key: string
  ) => {
    setter((prev: any) => ({
      ...prev,
      [key]: prev[key].filter((item: string) => item !== value)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information. Changes are saved individually per section.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="address">Address</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            {userData?.role === 'CUSTOMER' && (
              <TabsTrigger value="customer">Preferences</TabsTrigger>
            )}
            {userData?.role === 'MAID' && (
              <TabsTrigger value="maid">Professional</TabsTrigger>
            )}
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    value={basicInfo.name}
                    onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                    className="pl-10"
                    placeholder="Your full name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={basicInfo.phone}
                    onChange={(e) => setBasicInfo({ ...basicInfo, phone: e.target.value })}
                    className="pl-10"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={basicInfo.dateOfBirth}
                    onChange={(e) => setBasicInfo({ ...basicInfo, dateOfBirth: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  value={basicInfo.gender}
                  onChange={(e) => setBasicInfo({ ...basicInfo, gender: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={basicInfo.bio}
                onChange={(e) => setBasicInfo({ ...basicInfo, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="space-y-0.5">
                <Label>Public Profile</Label>
                <p className="text-sm text-gray-500">
                  Allow others to view your profile
                </p>
              </div>
              <Switch
                checked={basicInfo.isProfilePublic}
                onCheckedChange={(checked) => 
                  setBasicInfo({ ...basicInfo, isProfilePublic: checked })
                }
              />
            </div>

            <DialogFooter>
              <Button onClick={handleSaveBasicInfo} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Basic Info
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* Address Tab */}
          <TabsContent value="address" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="addressLine">Address Line</Label>
                <Input
                  id="addressLine"
                  value={address.addressLine}
                  onChange={(e) => setAddress({ ...address, addressLine: e.target.value })}
                  placeholder="House/Flat No., Building Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="locality">Locality</Label>
                <Input
                  id="locality"
                  value={address.locality}
                  onChange={(e) => setAddress({ ...address, locality: e.target.value })}
                  placeholder="Area, Colony"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="landmark">Landmark</Label>
                <Input
                  id="landmark"
                  value={address.landmark}
                  onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                  placeholder="Nearby landmark"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="City"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  placeholder="State"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                  placeholder="6-digit pincode"
                  maxLength={6}
                />
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleSaveAddress} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Address
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* Social Links Tab */}
          <TabsContent value="social" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={socialLinks.facebook}
                  onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                  placeholder="https://facebook.com/username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={socialLinks.instagram}
                  onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                  placeholder="https://instagram.com/username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  value={socialLinks.twitter}
                  onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                  placeholder="https://twitter.com/username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={socialLinks.linkedin}
                  onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleSaveBasicInfo} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Social Links
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* Customer Preferences Tab */}
          {userData?.role === 'CUSTOMER' && (
            <TabsContent value="customer" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={customerInfo.emergencyContact}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, emergencyContact: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialInstructions">Special Instructions</Label>
                  <Textarea
                    id="specialInstructions"
                    value={customerInfo.specialInstructions}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, specialInstructions: e.target.value })}
                    placeholder="Any special requirements or instructions..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Interests</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      placeholder="Add an interest"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addToArray(customerInfo.interests, newInterest, setCustomerInfo, 'interests', () => setNewInterest(''));
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => addToArray(customerInfo.interests, newInterest, setCustomerInfo, 'interests', () => setNewInterest(''))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {customerInfo.interests.map((interest) => (
                      <Badge key={interest} variant="secondary">
                        {interest}
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer"
                          onClick={() => removeFromArray(customerInfo.interests, interest, setCustomerInfo, 'interests')}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={handleSaveCustomerInfo} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Preferences
                </Button>
              </DialogFooter>
            </TabsContent>
          )}

          {/* Maid Professional Tab */}
          {userData?.role === 'MAID' && (
            <TabsContent value="maid" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experienceYears">Experience (Years)</Label>
                    <Input
                      id="experienceYears"
                      type="number"
                      value={maidInfo.experienceYears}
                      onChange={(e) => setMaidInfo({ ...maidInfo, experienceYears: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={maidInfo.hourlyRate}
                      onChange={(e) => setMaidInfo({ ...maidInfo, hourlyRate: parseFloat(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Skills</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addToArray(maidInfo.skills, newSkill, setMaidInfo, 'skills', () => setNewSkill(''));
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => addToArray(maidInfo.skills, newSkill, setMaidInfo, 'skills', () => setNewSkill(''))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {maidInfo.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer"
                          onClick={() => removeFromArray(maidInfo.skills, skill, setMaidInfo, 'skills')}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Languages</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      placeholder="Add a language"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addToArray(maidInfo.languages, newLanguage, setMaidInfo, 'languages', () => setNewLanguage(''));
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => addToArray(maidInfo.languages, newLanguage, setMaidInfo, 'languages', () => setNewLanguage(''))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {maidInfo.languages.map((language) => (
                      <Badge key={language} variant="secondary">
                        {language}
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer"
                          onClick={() => removeFromArray(maidInfo.languages, language, setMaidInfo, 'languages')}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Certifications</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      placeholder="Add a certification"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addToArray(maidInfo.certifications, newCertification, setMaidInfo, 'certifications', () => setNewCertification(''));
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => addToArray(maidInfo.certifications, newCertification, setMaidInfo, 'certifications', () => setNewCertification(''))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {maidInfo.certifications.map((cert) => (
                      <Badge key={cert} variant="secondary">
                        {cert}
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer"
                          onClick={() => removeFromArray(maidInfo.certifications, cert, setMaidInfo, 'certifications')}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Specializations</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newSpecialization}
                      onChange={(e) => setNewSpecialization(e.target.value)}
                      placeholder="Add a specialization"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addToArray(maidInfo.specializations, newSpecialization, setMaidInfo, 'specializations', () => setNewSpecialization(''));
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => addToArray(maidInfo.specializations, newSpecialization, setMaidInfo, 'specializations', () => setNewSpecialization(''))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {maidInfo.specializations.map((spec) => (
                      <Badge key={spec} variant="secondary">
                        {spec}
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer"
                          onClick={() => removeFromArray(maidInfo.specializations, spec, setMaidInfo, 'specializations')}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={handleSaveMaidInfo} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Professional Info
                </Button>
              </DialogFooter>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
