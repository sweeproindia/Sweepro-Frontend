import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Phone, Home, User, Loader2, AlertCircle } from 'lucide-react';
import { AuthService, CompleteProfileData, Apartment } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';

export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, refreshUser } = useUser();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingApartments, setIsLoadingApartments] = useState(true);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [formData, setFormData] = useState<CompleteProfileData>({
    phone: '',
    apartment_id: '',
    role: 'CUSTOMER'
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Load apartments on mount
  useEffect(() => {
    const loadApartments = async () => {
      try {
        const response = await AuthService.getApartments();
        if (response.success && response.data?.apartments) {
          setApartments(response.data.apartments);
        }
      } catch (error) {
        console.error('Failed to load apartments:', error);
        toast({
          title: 'Error',
          description: 'Failed to load apartments. Please refresh the page.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingApartments(false);
      }
    };

    loadApartments();
  }, [toast]);

  // Redirect if already completed
  useEffect(() => {
    if (user?.profile_completed) {
      // Redirect based on role
      switch (user.role) {
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
  }, [user, navigate]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      errors.phone = 'Invalid phone number. Must be 10 digits starting with 6-9';
    }

    if (!formData.apartment_id) {
      errors.apartment_id = 'Service address is required';
    }

    if (!formData.role) {
      errors.role = 'Account type is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) {
      setFormError('Please fix the highlighted fields.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await AuthService.completeProfile(formData);

      if (response.success && response.data?.user) {
        toast({
          title: 'Profile completed!',
          description: `Welcome to Sweep-Pro, ${response.data.user.name}!`,
        });

        // Refresh user context
        await refreshUser();

        // Navigate based on role
        switch (response.data.user.role) {
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
    } catch (error: any) {
      console.error('Complete profile error:', error);
      
      // Handle validation errors
      if (error.response?.errors) {
        const errors: Record<string, string> = {};
        error.response.errors.forEach((err: any) => {
          if (err.field) {
            errors[err.field] = err.message;
          }
        });
        setFieldErrors(errors);
        setFormError('Please fix the highlighted fields.');
      } else {
        setFormError(error.message || 'Failed to complete profile. Please try again.');
        toast({
          title: 'Error',
          description: error.message || 'Failed to complete profile',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    setFormError(null);
  };

  // Group apartments by area
  const apartmentsByArea = apartments.reduce((acc, apt) => {
    if (!acc[apt.area]) {
      acc[apt.area] = [];
    }
    acc[apt.area].push(apt);
    return acc;
  }, {} as Record<string, Apartment[]>);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              Complete Your Profile
            </CardTitle>
            <CardDescription className="text-gray-600 text-base">
              Please provide the following information to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {formError && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      handleInputChange('phone', value);
                    }}
                    className={`pl-10 py-6 ${fieldErrors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    required
                    maxLength={10}
                  />
                </div>
                {fieldErrors.phone && (
                  <p className="text-sm text-red-600">{fieldErrors.phone}</p>
                )}
                <p className="text-xs text-gray-500">10-digit mobile number</p>
              </div>

              {/* Service Address (Apartment) */}
              <div className="space-y-2">
                <Label htmlFor="apartment_id" className="text-sm font-medium text-gray-700">
                  Service Address <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                  {isLoadingApartments ? (
                    <div className="flex items-center justify-center py-6 border rounded-md">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                      <span className="ml-2 text-sm text-gray-500">Loading apartments...</span>
                    </div>
                  ) : (
                    <Select
                      value={formData.apartment_id}
                      onValueChange={(value) => handleInputChange('apartment_id', value)}
                      required
                    >
                      <SelectTrigger className={`pl-10 py-6 ${fieldErrors.apartment_id ? 'border-red-500 focus:ring-red-500' : ''}`}>
                        <SelectValue placeholder="Select your apartment complex" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {Object.entries(apartmentsByArea).map(([area, areaApartments]) => (
                          <div key={area}>
                            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                              {area}
                            </div>
                            {areaApartments.map((apt) => (
                              <SelectItem
                                key={apt.id}
                                value={apt.id}
                                className="py-3"
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{apt.name}</span>
                                  <span className="text-xs text-gray-500">
                                    {apt.area} • {apt.pincode}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                {fieldErrors.apartment_id && (
                  <p className="text-sm text-red-600">{fieldErrors.apartment_id}</p>
                )}
                <p className="text-xs text-gray-500">
                  Services are currently available only in these apartments
                </p>
              </div>

              {/* Account Type */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Account Type <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={(value) => handleInputChange('role', value as 'CUSTOMER' | 'MAID')}
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
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-blue-50 hover:border-blue-200 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 cursor-pointer"
                    >
                      <div className="mb-2 p-2 bg-blue-100 rounded-full">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="font-medium">Customer</span>
                      <span className="text-sm text-gray-500 text-center">
                        I need cleaning services
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
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-green-50 hover:border-green-200 peer-data-[state=checked]:border-green-600 peer-data-[state=checked]:bg-green-50 cursor-pointer"
                    >
                      <div className="mb-2 p-2 bg-green-100 rounded-full">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="font-medium">Maid</span>
                      <span className="text-sm text-gray-500 text-center">
                        I provide cleaning services
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
                {fieldErrors.role && (
                  <p className="text-sm text-red-600">{fieldErrors.role}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || isLoadingApartments}
                className="w-full py-6 text-base font-medium bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Completing Profile...
                  </span>
                ) : (
                  'Complete Profile'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


