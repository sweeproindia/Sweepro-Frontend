import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AuthService, RegisterData } from '@/services/authService';
import { useUser } from '@/contexts/UserContext';

import { Eye, EyeOff, Home, Lock, Mail, MapPin, Phone, Shield, Sparkles, User, Loader2, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '@/services/api';
import { parseApiError } from '@/utils/errorUtils';

// Predefined addresses from your client (Only for Customers)
const SERVICE_ADDRESSES = [
  { id: 1, name: 'Aparna CyberLife', area: 'Nallagandla', pincode: '500019' },
  { id: 2, name: 'Aparna HillPark Avenue', area: 'Chandanagar', pincode: '500050' },
  { id: 3, name: 'Aparna Kanopy Tulip', area: 'Kompally', pincode: '500100' },
  { id: 4, name: 'Aparna Sarovar Grande', area: 'Nallagandla', pincode: '500019' },
  { id: 5, name: 'Aparna Serene Park', area: 'Kondapur', pincode: '500084' },
  { id: 6, name: 'Bollineni Bion', area: 'Kothaguda', pincode: '500084' },
  { id: 7, name: 'Brigade Citadel', area: 'Moti Nagar', pincode: '500018' },
  { id: 8, name: 'Cybercity Oriana', area: 'Moosapet', pincode: '500018' },
  { id: 9, name: 'Fortune Green Homes Sapphire', area: 'Bachupally', pincode: '500090' },
  { id: 10, name: 'Fortune Sky Villas', area: 'Kokapet', pincode: '500075' },
  { id: 11, name: 'Godrej Madison Avenue', area: 'Kokapet', pincode: '500075' },
  { id: 12, name: 'L&T Serene County', area: 'Gachibowli', pincode: '500032' },
  { id: 13, name: 'Lanco Hills Apartments', area: 'Manikonda', pincode: '500089' },
  { id: 14, name: 'Lodha Bellezza', area: 'Kukatpally', pincode: '500072' },
  { id: 15, name: 'Malaysian Township', area: 'Kukatpally', pincode: '500072' },
  { id: 16, name: 'My Home Abhra', area: 'Madhapur', pincode: '500081' },
  { id: 17, name: 'My Home Apas', area: 'Kokapet', pincode: '500075' },
  { id: 18, name: 'My Home Avali', area: 'Gopanpally', pincode: '500075' },
  { id: 19, name: 'My Home Bhooja', area: 'Hitech City', pincode: '500081' },
  { id: 20, name: 'My Home Grava', area: 'Kokapet', pincode: '500075' },
  { id: 21, name: 'My Home Krishe', area: 'Gachibowli', pincode: '500032' },
  { id: 22, name: 'My Home Mangala', area: 'Kondapur', pincode: '500084' },
  { id: 23, name: 'My Home Nishada', area: 'Kokapet', pincode: '500075' },
  { id: 24, name: 'My Home Raka', area: 'Madinaguda', pincode: '500049' },
  { id: 25, name: 'My Home Sayuk', area: 'Tellapur', pincode: '500019' },
  { id: 26, name: 'My Home Tridasa', area: 'Tellapur', pincode: '500019' },
  { id: 27, name: 'My Home Vipina', area: 'Tellapur', pincode: '500019' },
  { id: 28, name: 'Prestige Beverly Hills', area: 'Kokapet', pincode: '500075' },
  { id: 29, name: 'Prestige High Fields', area: 'Gachibowli', pincode: '500032' },
  { id: 30, name: 'Prestige Ivy League', area: 'Hitech City', pincode: '500081' },
  { id: 31, name: 'Prestige Rainbow Waters', area: 'Gachibowli', pincode: '500032' },
  { id: 32, name: 'Rainbow Vistas Rock Garden', area: 'Moosapet', pincode: '500018' },
  { id: 33, name: 'Rajapushpa Atria', area: 'Kokapet', pincode: '500075' },
  { id: 34, name: 'Rajapushpa Provincia', area: 'Narsingi', pincode: '500075' },
  { id: 35, name: 'Ramky One Astra', area: 'Kokapet', pincode: '500075' },
  { id: 36, name: 'Ramky One Harmony', area: 'Pragathi Nagar', pincode: '500090' },
  { id: 37, name: 'SMR Vinay Iconia', area: 'Kondapur', pincode: '500084' },
  { id: 38, name: 'Vasavi Atlantis', area: 'Narsingi', pincode: '500075' },
  { id: 39, name: 'Vasavi Skyla', area: 'Hitech City', pincode: '500081' },
];

// Group addresses by area for better organization
const AREA_GROUPS = SERVICE_ADDRESSES.reduce((groups, address) => {
  if (!groups[address.area]) {
    groups[address.area] = [];
  }
  groups[address.area].push(address);
  return groups;
}, {} as Record<string, typeof SERVICE_ADDRESSES>);

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  type RoleOption = 'CUSTOMER' | 'MAID';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '' as '' | RoleOption,
    password: '',
    confirmPassword: '',
    address: '',
    apartmentNumber: '',
    floorNumber: '',
    maidAddress: '', // Separate field for maid's address
    maidPincode: '',
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { setAuthenticatedUser } = useUser();

  const selectedPlan = location.state?.selectedPlan || 'Standard';

  const handleGoogleSignUp = async () => {
    setFormError(null);
    setFieldErrors({});

    if (!formData.role) {
      setFieldErrors({ role: 'Please select an account type.' });
      setFormError('Please select an account type to continue.');
      return;
    }

    sessionStorage.setItem('selectedRole', formData.role);

    setIsGoogleLoading(true);

    try {
      const response = await AuthService.signInWithGoogle();

      if (response.success && response.data?.user) {
        const loggedInUser = response.data.user;
        setAuthenticatedUser(loggedInUser);

        toast({
          title: 'Signed in with Google',
          description: 'Please complete your profile to continue.',
        });

        if (!loggedInUser.profile_completed) {
          navigate('/complete-profile', { state: { role: formData.role } });
        } else {
          switch (loggedInUser.role) {
            case 'ADMIN':
              navigate('/admin-dashboard');
              break;
            case 'MAID':
              navigate('/maid-dashboard');
              break;
            case 'CUSTOMER':
            default:
              navigate('/dashboard');
          }
        }
      }
    } catch (error: any) {
      console.error('Google sign-up error:', error);
      toast({
        title: 'Google sign-up failed',
        description: error?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const validatePassword = (value: string): string | null => {
    if (!value) return 'Password is required.';
    if (value.length < 8) return 'Password must be at least 8 characters.';
    if (!/[a-z]/.test(value)) return 'Password must include a lowercase letter.';
    if (!/[A-Z]/.test(value)) return 'Password must include an uppercase letter.';
    if (!/\d/.test(value)) return 'Password must include a number.';
    if (!/[@$!%*?&]/.test(value)) return 'Password must include a special character (@$!%*?&).';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setFormError(null);

    const nextErrors: Record<string, string> = {};
    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const maidAddress = formData.maidAddress.trim();
    const maidPincode = formData.maidPincode.trim();

    if (!formData.role) nextErrors.role = 'Please select an account type.';

    if (!name) nextErrors.name = 'Full name is required.';
    else if (name.length < 2) nextErrors.name = 'Name must be at least 2 characters.';
    else if (!/^[a-zA-Z\s]+$/.test(name)) nextErrors.name = 'Name can only contain letters and spaces.';

    if (!email) nextErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Enter a valid email address.';

    if (!phone) nextErrors.phone = 'Phone number is required.';
    else if (!/^[6-9]\d{9}$/.test(phone)) nextErrors.phone = 'Enter a valid 10-digit Indian phone number starting with 6-9.';

    if (formData.role === 'CUSTOMER' && !formData.address) {
      nextErrors.address = 'Please select your apartment complex.';
    }

    if (formData.role === 'MAID' && !maidAddress) {
      nextErrors.maidAddress = 'Residential address is required.';
    }

    if (formData.role === 'MAID' && !maidPincode) {
      nextErrors.maidPincode = 'Pincode is required.';
    } else if (maidPincode && !/^\d{6}$/.test(maidPincode)) {
      nextErrors.maidPincode = 'Enter a valid 6-digit pincode.';
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) nextErrors.password = passwordError;

    if (!formData.confirmPassword) nextErrors.confirmPassword = 'Please confirm your password.';
    else if (formData.password !== formData.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setFormError('Please fix the highlighted fields.');
      return;
    }

    setIsLoading(true);
    try {
      let finalAddress = '';
      let serviceArea = '';
      let pincode = '';

      if (formData.role === 'CUSTOMER') {
        // Find selected address details for customers
        const selectedAddressObj = SERVICE_ADDRESSES.find(addr =>
          `${addr.name} - ${addr.area} - ${addr.pincode}` === formData.address
        );

        finalAddress = `${formData.address}${formData.apartmentNumber ? `, Apt: ${formData.apartmentNumber}` : ''}${formData.floorNumber ? `, Floor: ${formData.floorNumber}` : ''}`;
        serviceArea = selectedAddressObj?.area || '';
        pincode = selectedAddressObj?.pincode || '';
      } else {
        // Use normal address for maids
        finalAddress = formData.maidAddress;
        pincode = formData.maidPincode.trim();
      }

      const registerData: RegisterData = {
        name,
        email,
        phone,
        role: formData.role as RoleOption,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        address: finalAddress,
        serviceArea: serviceArea,
        pincode: pincode
      };

      const response = await AuthService.register(registerData);
      if (response.success && response.data?.user) {
        const loggedInUser = response.data.user;
        setAuthenticatedUser(loggedInUser);

        const roleSpecificMessage = formData.role === 'MAID'
          ? 'Welcome aboard! You can now start accepting cleaning jobs.'
          : 'Services available in your area.';

        toast({
          title: 'Account created successfully!',
          description: `Welcome to Sweepro, ${loggedInUser.name}! ${roleSpecificMessage}`,
        });

        // Navigate based on role
        switch (loggedInUser.role) {
          case 'ADMIN':
            navigate('/admin-dashboard');
            break;
          case 'MAID':
            navigate('/maid-dashboard');
            break;
          default:
            navigate('/dashboard');
        }
      }
    } catch (error: any) {
      if (error instanceof ApiError) {
        console.error('Registration error response:', error.response);
      }

      const { formError: nextFormError, fieldErrors: parsedFieldErrors } = parseApiError(error, {
        fieldMap: {
          credentials: ['email', 'password'],
          email: ['email'],
          phone: ['phone'],
          password: ['password', 'confirmPassword']
        },
        defaultMessage: 'Registration failed. Please try again.'
      });

      setFieldErrors((prev) => ({ ...prev, ...parsedFieldErrors }));
      setFormError(nextFormError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormError(null);
  };

  const handleRoleChange = (value: string) => {
    const newRole = value as RoleOption;

    const nextParams = new URLSearchParams(location.search);
    if (newRole) nextParams.set('role', newRole);
    else nextParams.delete('role');
    navigate(
      {
        pathname: location.pathname,
        search: nextParams.toString() ? `?${nextParams.toString()}` : ''
      },
      {
        replace: true,
        state: location.state
      }
    );

    setFormData(prev => ({
      ...prev,
      role: newRole,
      // Clear address fields when switching roles
      address: newRole === 'MAID' ? '' : prev.address,
      maidAddress: newRole === 'CUSTOMER' ? '' : prev.maidAddress,
      maidPincode: newRole === 'CUSTOMER' ? '' : prev.maidPincode,
      apartmentNumber: '',
      floorNumber: ''
    }));
  };

  useEffect(() => {
    const roleFromQuery = (new URLSearchParams(location.search).get('role') || '').toUpperCase();
    if ((roleFromQuery === 'CUSTOMER' || roleFromQuery === 'MAID') && formData.role !== roleFromQuery) {
      handleRoleChange(roleFromQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const isCustomer = formData.role === 'CUSTOMER';
  const isMaid = formData.role === 'MAID';
  const hasSelectedRole = isCustomer || isMaid;
  const liveArea = 'Gachibowli';
  const liveComplexes = SERVICE_ADDRESSES.filter((a) => a.area === liveArea);
  const liveComplexesToShow = liveComplexes.slice(0, 4);

  const liveComplexesExtraCount = Math.max(0, liveComplexes.length - liveComplexesToShow.length);
  const comingSoonAreas = ['Kondapur', 'Hitech City', 'Kokapet', 'Madhapur', 'Manikonda', 'Narsingi'];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Left Column - Form */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-y-auto">
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <img
              src="/assets/logo.png"
              alt="Sweepro Logo"
              className="w-40 h-40 object-contain mb-2"
              style={{ maxWidth: '180px', maxHeight: '180px' }}
            />
          </div>

          <Card className="border-none shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-gray-900">
                {isMaid ? 'Join as Cleaning Professional' : 'Create Your Account'}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {hasSelectedRole
                  ? (isMaid
                    ? 'Register to start accepting cleaning jobs'
                    : 'Services currently available in select Hyderabad apartments')
                  : 'Select account type to continue'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <Label className="text-sm font-medium text-gray-700">Account Type</Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={handleRoleChange}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3"
                >
                  <div className="relative">
                    <RadioGroupItem
                      value="CUSTOMER"
                      id="customer"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="customer"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-gray-300 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 [&:has([data-state=checked])]:border-blue-500 [&:has([data-state=checked])]:bg-blue-50 cursor-pointer"
                    >
                      <img
                        src="/assets/user.png"
                        alt="Customer"
                        className="mb-3 h-7 w-7 object-contain"
                      />
                      <span className="text-sm font-medium">Customer</span>
                      <span className="text-xs text-gray-500 mt-1">
                        Book cleaning services
                      </span>
                    </Label>
                  </div>
                  <div className="relative">
                    <RadioGroupItem
                      value="MAID"
                      id="maid"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="maid"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-gray-300 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 [&:has([data-state=checked])]:border-blue-500 [&:has([data-state=checked])]:bg-blue-50 cursor-pointer"
                    >
                      <img
                        src="/assets/cleaning-lady.png"
                        alt="Maid"
                        className="mb-3 h-7 w-7 object-contain"
                      />
                      <span className="text-sm font-medium">Maid</span>
                      <span className="text-xs text-gray-500 mt-1">
                        Accept cleaning jobs
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
                {fieldErrors.role && (
                  <p className="text-sm text-red-600">{fieldErrors.role}</p>
                )}
              </div>

              <Button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={isGoogleLoading || isLoading || !hasSelectedRole}
                className="w-full py-6 text-base font-medium bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700"
              >
                {isGoogleLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Connecting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </span>
                )}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or sign up with email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {formError && (
                  <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {formError}
                  </div>
                )}
                {/* Personal Information Section */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`pl-10 py-6 ${fieldErrors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                          placeholder={isMaid ? "Your full name" : "John Doe"}
                        />
                      </div>
                      {fieldErrors.name && (
                        <p className="text-sm text-red-600">{fieldErrors.name}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`pl-10 py-6 ${fieldErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                          placeholder={isMaid ? "professional@example.com" : "john@example.com"}
                        />
                      </div>
                      {fieldErrors.email && (
                        <p className="text-sm text-red-600">{fieldErrors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`pl-10 py-6 ${fieldErrors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        placeholder="9876543210"
                        maxLength={10}
                      />
                    </div>
                    {fieldErrors.phone && (
                      <p className="text-sm text-red-600">{fieldErrors.phone}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      10-digit mobile number
                    </p>
                  </div>

                  {/* Address Section - Different for Customers and Maids */}
                  {hasSelectedRole && (
                    <div className="space-y-4 p-4 rounded-lg border bg-blue-50 border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Home className="h-5 w-5 text-blue-600" />
                        <Label className="text-sm font-medium text-gray-700">
                          {isCustomer ? 'Select Your Apartment Complex' : 'Your Residential Address'}
                        </Label>
                      </div>

                      {isCustomer ? (
                        // Customer Address Selection
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                              Service Address *
                            </Label>
                            <Select
                              value={formData.address}
                              onValueChange={(value) => {
                                setFormData(prev => ({ ...prev, address: value }));
                                setFieldErrors((prev) => ({ ...prev, address: undefined }));
                                setFormError(null);
                              }}
                              required={isCustomer}
                            >
                              <SelectTrigger className={`w-full py-6 ${fieldErrors.address ? 'border-red-500 focus:ring-red-500' : ''}`}>
                                <SelectValue placeholder="Select your apartment complex" />
                              </SelectTrigger>

                              <SelectContent className="max-h-60">
                                {Object.entries(AREA_GROUPS).map(([area, addresses]) => (
                                  <div key={area}>
                                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                                      {area}
                                    </div>
                                    {addresses.map((address) => (
                                      <SelectItem
                                        key={address.id}
                                        value={`${address.name} - ${address.area} - ${address.pincode}`}
                                        className="py-3"
                                      >
                                        <div className="flex flex-col">
                                          <span className="font-medium">{address.name}</span>
                                          <span className="text-xs text-gray-500">
                                            {address.area} • {address.pincode}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </div>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500">
                              Services are currently available only in these apartments
                            </p>
                            {fieldErrors.address && (
                              <p className="text-sm text-red-600">{fieldErrors.address}</p>
                            )}
                          </div>

                          {/* Apartment Details */}
                          {formData.address && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-blue-100">
                              <div className="space-y-2">
                                <Label htmlFor="apartmentNumber" className="text-sm font-medium text-gray-700">
                                  Apartment/House Number
                                </Label>
                                <Input
                                  id="apartmentNumber"
                                  name="apartmentNumber"
                                  type="text"
                                  value={formData.apartmentNumber}
                                  onChange={handleInputChange}
                                  className="py-6"
                                  placeholder="e.g., 203, Tower B"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="floorNumber" className="text-sm font-medium text-gray-700">
                                  Floor Number
                                </Label>
                                <Input
                                  id="floorNumber"
                                  name="floorNumber"
                                  type="text"
                                  value={formData.floorNumber}
                                  onChange={handleInputChange}
                                  className="py-6"
                                  placeholder="e.g., 2nd Floor"
                                />
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        // Maid Normal Address Input
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="maidAddress" className="text-sm font-medium text-gray-700">
                              Residential Address *
                            </Label>
                            <div className="relative">
                              <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="maidAddress"
                                name="maidAddress"
                                type="text"
                                required={isMaid}
                                value={formData.maidAddress}
                                onChange={handleInputChange}
                                className={`pl-10 py-6 ${fieldErrors.maidAddress ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                placeholder="Full address with city"
                              />
                            </div>
                            {fieldErrors.maidAddress && (
                              <p className="text-sm text-red-600">{fieldErrors.maidAddress}</p>
                            )}
                            <p className="text-xs text-gray-500">
                              This helps us match you with nearby cleaning jobs
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="maidPincode" className="text-sm font-medium text-gray-700">
                              Pincode *
                            </Label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="maidPincode"
                                name="maidPincode"
                                type="text"
                                required={isMaid}
                                inputMode="numeric"
                                maxLength={6}
                                value={formData.maidPincode}
                                onChange={handleInputChange}
                                className={`pl-10 py-6 ${fieldErrors.maidPincode ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                placeholder="500032"
                              />
                            </div>
                            {fieldErrors.maidPincode && (
                              <p className="text-sm text-red-600">{fieldErrors.maidPincode}</p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Password Section */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`pl-10 py-6 pr-10 ${fieldErrors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                          placeholder="••••••••"
                          minLength={8}
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {fieldErrors.password && (
                        <p className="text-sm text-red-600">{fieldErrors.password}</p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`pl-10 py-6 pr-10 ${fieldErrors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                          placeholder="••••••••"
                          minLength={8}
                        />

                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {fieldErrors.confirmPassword && (
                        <p className="text-sm text-red-600">{fieldErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Password must be at least 8 characters with uppercase, lowercase, and numbers
                  </p>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the{' '}
                    <Link to="/terms" className="text-blue-600 hover:text-blue-800 hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-blue-600 hover:text-blue-800 hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-6 text-base font-medium bg-[#1800ad] text-white hover:bg-[#ca0013]"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    isMaid ? 'Join as Professional' : 'Create Account'
                  )}
                </Button>

                {/* Login Link */}
                <div className="text-center text-sm text-gray-600">
                  {!isMaid && (
                    <div className="mb-2 inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                      <MapPin className="h-3.5 w-3.5 text-[#1800ad]" />
                      <span>Now serving {liveArea} • More areas coming soon</span>
                    </div>
                  )}
                  <div>
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-blue-600 hover:text-blue-800 hover:underline">
                      Sign in
                    </Link>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Column - Illustration/Info */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#1800ad] via-[#12006b] to-[#ca0013] text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#eeebe3] rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#eeebe3] rounded-full opacity-15 blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex w-full items-center justify-center px-12 py-14">
          <div className="w-full max-w-xl">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-xl mb-6">
                {isMaid ? <Shield className="h-8 w-8" /> : <MapPin className="h-8 w-8" />}
              </div>
              <h2 className="text-4xl font-bold mb-4">
                {isMaid ? 'Join Our Professional Network!' : `Now serving ${liveArea}`}
              </h2>
              <p className="text-lg text-[#eeebe3]/85 mb-8">
                {isMaid
                  ? 'Register as a cleaning professional and start accepting jobs from verified customers in premium apartments.'
                  : 'We are currently live only in Gachibowli. More Hyderabad areas are coming soon.'}
              </p>
            </div>

            <div className="space-y-6">
              {isMaid ? (
                <>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-2 bg-white/20 rounded-lg">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Verified Customers</h3>
                      <p className="text-[#eeebe3]/85">Work with pre-verified customers from premium apartment communities.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-2 bg-white/20 rounded-lg">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Flexible Schedule</h3>
                      <p className="text-[#eeebe3]/85">Choose your working hours and accept jobs that fit your routine.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-2 bg-white/20 rounded-lg">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Competitive Earnings</h3>
                      <p className="text-[#eeebe3]/85">Earn with a transparent, on-time payment system.</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-white/15 flex items-center justify-center">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-[#eeebe3]/80">Currently live in</p>
                          <p className="font-semibold text-lg">{liveArea}, Hyderabad</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide">
                        Limited rollout
                      </span>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-semibold mb-3">Available communities</p>
                      <div className="space-y-2">
                        {liveComplexesToShow.map((c) => (
                          <div key={c.id} className="flex items-center gap-2 text-sm text-[#eeebe3]/90">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#eeebe3]" />
                            <span>{c.name}</span>
                          </div>
                        ))}
                        {liveComplexesExtraCount > 0 && (
                          <div className="text-sm text-[#eeebe3]/80">+ {liveComplexesExtraCount} more</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-2 bg-white/20 rounded-lg">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Verified & Trusted</h3>
                      <p className="text-[#eeebe3]/85">Background-verified professionals and quality-checked service.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-2 bg-white/20 rounded-lg">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="w-full">
                      <h3 className="font-semibold text-lg">Coming soon</h3>
                      <p className="text-[#eeebe3]/85">Expanding to these Hyderabad areas next.</p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {comingSoonAreas.map((area) => (
                          <span
                            key={area}
                            className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-semibold text-[#eeebe3]/90"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <p className="text-sm font-medium">
                {isMaid 
                  ? "\"Joining Sweepro as a cleaning professional changed my life. I now have steady income and flexible hours!\""
                  : `"We are rolling out step-by-step. If you’re outside ${liveArea}, your area will be live soon."`}
              </p>
              <div className="flex items-center mt-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="font-semibold">
                    {isMaid ? 'Anjali Verma' : 'Priya Sharma'}
                  </p>
                  <p className="text-sm text-[#eeebe3]/80">
                    {isMaid ? 'Professional Cleaner, 2 years' : `Resident, ${liveArea}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}