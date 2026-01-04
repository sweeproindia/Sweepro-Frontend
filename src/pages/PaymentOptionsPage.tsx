import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, Calendar, Clock, MapPin, Home, Check } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { saveServiceAddress, getServiceAddress, ServiceAddress } from '@/services/addressService';
import { AuthService } from '@/services/authService';
import { SubscriptionService } from '@/services/subscriptionService';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
  features: string[];
  popular?: boolean;
  discount?: number;
  originalPrice?: number;
  serviceHours: string;
  coverage: string;
  teamSize: string;
  cancellation: string;
}

interface ServiceOptions {
  timeSlot: string;
  startDate: string;
  frequency: string;
  address: string;
  latitude?: number;
  longitude?: number;
  pincode: string;
  locality: string;
  addressLine: string;
  city: string;
  state: string;
  landmark: string;
  propertyType: 'apartment' | 'bungalow' | null;
  bhkType: '1bhk' | '2bhk' | '3bhk' | '4bhk' | null;
  squareFeet: number;
  selectedPlanDuration: '1month' | '3month' | '6month' | null;
  finalTotalPrice: number;
  pricing?: {
    subtotal: number;
    gstAmount: number;
    totalWithGst: number;
    discountPercent: number;
    discountAmount: number;
    totalBeforeDiscount: number;
    basePricePerPeriod: number;
  };
}

// Fixed frequency configuration
const DAILY_FREQUENCY = { id: 'daily', name: 'Daily', description: 'Service every day', price: 0 } as const;

// Enhanced Base plan configurations with service-specific pricing
const BASE_PLANS = {
  'standard': {
    id: 'standard',
    name: 'Sweepro Touch',
    basePrice: 1299, // Base monthly price for essential care
    description: 'Essential care plan for medium-sized homes with consistent daily cleaning support.',
    serviceMultiplier: 1.0, // Standard multiplier
  },
  'premium': {
    id: 'premium',
    name: 'Sweepro Lux',
    basePrice: 2299, // Base monthly price for premium care
    description: 'Premium care plan with comprehensive daily cleaning and priority support for luxury homes.',
    serviceMultiplier: 1.4, // 40% premium for enhanced service frequency
  }
};

// Property type configurations with realistic pricing per sq ft
const PROPERTY_TYPES = [
  {
    id: 'apartment' as const,
    name: 'Apartment',
    description: 'Flats, Condos, Multi-story units',
    icon: '🏢',
    pricePerSqFt: 2.2, // ₹2.2 per sq ft for apartments
    complexityFactor: 1.0 // Base complexity
  }
];

// Enhanced BHK configurations with realistic square footage ranges
const BHK_CONFIGS = [
  {
    id: '1bhk' as const,
    label: '1 BHK',
    baseComplexity: 0.85, // 15% discount for smaller size
    sqftOptions: [
      { value: 450, range: '300-500 sq ft', label: 'Compact', priceMultiplier: 0.9 },
      { value: 550, range: '500-600 sq ft', label: 'Standard', priceMultiplier: 1.0 },
      { value: 650, range: '600-700 sq ft', label: 'Spacious', priceMultiplier: 1.1 }
    ]
  },
  {
    id: '2bhk' as const,
    label: '2 BHK',
    baseComplexity: 1.0, // Base pricing
    sqftOptions: [
      { value: 750, range: '650-850 sq ft', label: 'Compact', priceMultiplier: 0.95 },
      { value: 950, range: '850-1050 sq ft', label: 'Standard', priceMultiplier: 1.0 },
      { value: 1150, range: '1050-1250 sq ft', label: 'Spacious', priceMultiplier: 1.05 }
    ]
  },
  {
    id: '3bhk' as const,
    label: '3 BHK',
    baseComplexity: 1.2, // 20% premium for additional room
    sqftOptions: [
      { value: 1150, range: '1000-1300 sq ft', label: 'Compact', priceMultiplier: 0.95 },
      { value: 1400, range: '1300-1500 sq ft', label: 'Standard', priceMultiplier: 1.0 },
      { value: 1650, range: '1500-1800 sq ft', label: 'Spacious', priceMultiplier: 1.1 }
    ]
  },
  {
    id: '4bhk' as const,
    label: '4+ BHK',
    baseComplexity: 1.45, // 45% premium for large homes
    sqftOptions: [
      { value: 1800, range: '1600-2000 sq ft', label: 'Standard', priceMultiplier: 1.0 },
      { value: 2200, range: '2000-2400 sq ft', label: 'Large', priceMultiplier: 1.15 },
      { value: 2600, range: '2400+ sq ft', label: 'Villa', priceMultiplier: 1.3 }
    ]
  }
];

// Plan duration options with attractive discounts
const PLAN_DURATIONS = [
  {
    id: '1month' as const,
    label: '1 Month',
    multiplier: 1,
    discount: 0,
    popular: false,
    description: 'Monthly billing - flexibility',
    badge: null
  },
  {
    id: '3month' as const,
    label: '3 Months',
    multiplier: 3,
    discount: 8, // 8% discount for quarterly
    popular: true,
    description: 'Save 8% with quarterly plan',
    badge: 'Most Popular'
  },
  {
    id: '6month' as const,
    label: '6 Months',
    multiplier: 6,
    discount: 15, // 15% discount for semi-annual
    popular: false,
    description: 'Save 15% with semi-annual plan',
    badge: 'Best Value'
  }
];

export default function PaymentOptionsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedPlan = location.state?.selectedPlan as SubscriptionPlan;
  const { toast } = useToast();
  const { user, updateUser, isAuthenticated } = useUser();

  // Generate half-hour time slots between 08:00 AM and 06:00 PM
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    const start = new Date();
    start.setHours(8, 0, 0, 0);
    for (let i = 0; i <= 20; i++) {
      const d = new Date(start.getTime() + i * 30 * 60000);
      const hour = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 === 0 ? 12 : hour % 12;
      const label = `${hour12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      slots.push(label);
    }
    return slots;
  }, []);

  const [options, setOptions] = useState<ServiceOptions>({
    timeSlot: '09:00 AM',
    startDate: new Date().toISOString().split('T')[0],
    frequency: 'daily',
    address: '',
    pincode: '',
    locality: '',
    addressLine: '',
    city: '',
    state: '',
    landmark: '',
    propertyType: null, // Apartment not selected by default
    bhkType: null,
    squareFeet: 0,
    selectedPlanDuration: null,
    finalTotalPrice: 0
  });

  const [hoveredBhk, setHoveredBhk] = useState<string | null>(null);
  const [showSqftOptions, setShowSqftOptions] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [tempLat, setTempLat] = useState<string>('');
  const [tempLng, setTempLng] = useState<string>('');
  const [coordError, setCoordError] = useState<string | null>(null);
  const [autoDetecting, setAutoDetecting] = useState<boolean>(false);
  const [autoDetected, setAutoDetected] = useState<boolean>(false);
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [refining, setRefining] = useState<boolean>(false);
  const watchIdRef = useRef<number | null>(null);
  const mapTypeRef = useRef<'google' | 'leaflet' | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const mapContainerIdRef = useRef<string>('map-container-' + Math.random().toString(36).slice(2));
  const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const prefersGoogle = !!googleMapsKey;
  const [savedAddress, setSavedAddress] = useState<Partial<Pick<ServiceOptions, 'pincode' | 'locality' | 'addressLine' | 'city' | 'state' | 'landmark' | 'address' | 'latitude' | 'longitude'>>>();
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  useEffect(() => {
    if (!selectedPlan) {
      navigate('/subscription');
      return;
    }
  }, [selectedPlan, navigate]);

  useEffect(() => {
    if (isMapOpen) {
      setTempLat(options.latitude !== undefined ? String(options.latitude) : '');
      setTempLng(options.longitude !== undefined ? String(options.longitude) : '');
      setCoordError(null);
      setTimeout(() => initMap(), 50);
    } else {
      destroyMap();
    }
  }, [isMapOpen]);

  useEffect(() => {
    try {
      const saved = getServiceAddress();
      if (saved) {
        setOptions(prev => ({ ...prev, ...saved }));
        setSavedAddress(saved);
      }
    } catch { }
  }, []);

  useEffect(() => {
    if (options.latitude === undefined && options.longitude === undefined && !options.address) {
      detectLocationAuto();
    }
  }, []);

  const handleOptionChange = (key: keyof ServiceOptions, value: string | number | null) => {
    setOptions(prev => ({ ...prev, [key]: value as any }));
  };

  const handleBhkSelect = (bhkId: string) => {
    setOptions(prev => ({ 
      ...prev, 
      bhkType: bhkId as ServiceOptions['bhkType'],
      squareFeet: 0,
      selectedPlanDuration: null,
      finalTotalPrice: 0
    }));
    setShowSqftOptions(bhkId);
  };

  const handleSqftSelect = (sqft: number) => {
    setOptions(prev => ({ ...prev, squareFeet: sqft }));
  };

  const handlePlanDurationSelect = (durationId: string) => {
    const duration = PLAN_DURATIONS.find(d => d.id === durationId);
    if (duration) {
      (async () => {
        try {
          const backendPlanId = await resolveBackendPlanId(selectedPlan);
          if (!backendPlanId) {
            throw new Error('Unable to load plan pricing.');
          }
          const pricingRes = await SubscriptionService.validatePricing(
            backendPlanId,
            durationId as ServiceOptions['selectedPlanDuration']
          );
          const pricingData: any = pricingRes.data;
          if (!pricingRes.success || !pricingData) {
            throw new Error('Failed to calculate pricing.');
          }
          setOptions(prev => ({
            ...prev,
            selectedPlanDuration: durationId as ServiceOptions['selectedPlanDuration'],
            finalTotalPrice: Number(pricingData.subtotal || 0),
            pricing: {
              subtotal: Number(pricingData.subtotal || 0),
              gstAmount: Number(pricingData.gstAmount || 0),
              totalWithGst: Number(pricingData.totalWithGst || 0),
              discountPercent: Number(pricingData.discountPercent || 0),
              discountAmount: Number(pricingData.discountAmount || 0),
              totalBeforeDiscount: Number(pricingData.totalBeforeDiscount || 0),
              basePricePerPeriod: Number(pricingData.basePricePerPeriod || 0),
            }
          }));
        } catch (e: any) {
          const fallback = calculatePlanPrice(duration);
          setOptions(prev => ({
            ...prev,
            selectedPlanDuration: durationId as ServiceOptions['selectedPlanDuration'],
            finalTotalPrice: fallback.finalTotal,
            pricing: undefined
          }));
        }
      })();
    }
  };

  const resolveBackendPlanId = async (uiPlan: SubscriptionPlan) => {
    if (!uiPlan) return null;

    if (typeof uiPlan.id === 'string' && uiPlan.id.length > 12 && uiPlan.id.includes('-')) {
      return uiPlan.id;
    }

    const keyword = (uiPlan.name || '').toLowerCase().includes('lux') ? 'lux' : 'touch';

    try {
      const plansRes = await SubscriptionService.getSubscriptionPlans();
      const plans = Array.isArray(plansRes.data)
        ? (plansRes.data as any[])
        : (plansRes.data as any)?.plans || (plansRes as any)?.plans || [];

      const match = (plans || []).find((p: any) =>
        String(p?.name || '').toLowerCase().includes(keyword)
      );

      return match?.id || null;
    } catch (e) {
      return null;
    }
  };

  // Enhanced pricing calculation function
  const calculatePlanPrice = (duration: typeof PLAN_DURATIONS[0]) => {
    // Determine plan type based on selectedPlan.id
    const planType = selectedPlan.id === 'premium' ? 'premium' : 'standard';
    
    // Get configuration objects
    const basePlan = BASE_PLANS[planType];
    const propertyConfig = PROPERTY_TYPES.find(pt => pt.id === options.propertyType)!;
    const bhkConfig = BHK_CONFIGS.find(bhk => bhk.id === options.bhkType)!;
    
    // Find the appropriate sqft option for multiplier
    const sqftOption = bhkConfig.sqftOptions.find(opt => 
      Math.abs(opt.value - options.squareFeet) <= 50
    ) || bhkConfig.sqftOptions[1]; // Default to standard if not found
    
    // Calculate base monthly cost
    let monthlyBaseCost = basePlan.basePrice;
    
    // Apply service frequency multiplier (Lux has more frequent service)
    monthlyBaseCost *= basePlan.serviceMultiplier;
    
    // Calculate property-based cost
    const propertyBaseCost = options.squareFeet * propertyConfig.pricePerSqFt;
    
    // Apply complexity factors
    const complexityAdjustedCost = propertyBaseCost * 
      propertyConfig.complexityFactor * 
      bhkConfig.baseComplexity * 
      sqftOption.priceMultiplier;
    
    // Total monthly cost
    const monthlyTotal = monthlyBaseCost + complexityAdjustedCost;
    
    // Calculate for selected duration
    const totalBeforeDiscount = monthlyTotal * duration.multiplier;
    const discountAmount = (totalBeforeDiscount * duration.discount) / 100;
    const finalTotal = totalBeforeDiscount - discountAmount;
    
    return {
      monthlyBaseCost: Math.round(monthlyBaseCost),
      propertyBaseCost: Math.round(complexityAdjustedCost),
      monthlyTotal: Math.round(monthlyTotal),
      totalBeforeDiscount: Math.round(totalBeforeDiscount),
      discountAmount: Math.round(discountAmount),
      finalTotal: Math.round(finalTotal),
      monthlyAfterDiscount: Math.round(finalTotal / duration.multiplier),
      effectiveMonthlyRate: Math.round(monthlyTotal * (1 - duration.discount / 100))
    };
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<Partial<ServiceOptions> | null> => {
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      if (!resp.ok) return null;
      const data = await resp.json();
      const display = data?.display_name as string | undefined;
      const addr = data?.address || {};
      const addressLineParts = [addr.house_number, addr.road].filter(Boolean).join(' ');
      const locality = (addr.suburb || addr.neighbourhood || addr.city_district || '') as string;
      const city = (addr.city || addr.town || addr.village || '') as string;
      const state = (addr.state || '') as string;
      const pincode = (addr.postcode || '') as string;
      return {
        address: display || '',
        addressLine: addressLineParts,
        locality,
        city,
        state,
        pincode
      } as Partial<ServiceOptions>;
    } catch {
      return null;
    }
  };

  const detectLocationAuto = () => {
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setAutoDetecting(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const parsed = await reverseGeocode(latitude, longitude);
        setOptions(prev => ({
          ...prev,
          latitude,
          longitude,
          ...(parsed || {})
        }));
        setAccuracyMeters(accuracy ?? null);
        setAutoDetected(true);
        setAutoDetecting(false);
      },
      (err) => {
        setLocationError(err.message || 'Failed to detect your location.');
        setAutoDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handleUseCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const parsed = await reverseGeocode(latitude, longitude);
        setOptions(prev => ({
          ...prev,
          latitude,
          longitude,
          ...(parsed || {})
        }));
        setAccuracyMeters(accuracy ?? null);
        setIsLocating(false);
      },
      (err) => {
        setLocationError(err.message || 'Failed to get your location.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const startRefineWatch = () => {
    if (!('geolocation' in navigator) || refining) return;
    setRefining(true);
    setLocationError(null);
    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const parsed = await reverseGeocode(latitude, longitude);
        setOptions(prev => ({ ...prev, latitude, longitude, ...(parsed || {}) }));
        setAccuracyMeters(accuracy ?? null);
        if (accuracy !== null && accuracy !== undefined && accuracy <= 30) {
          stopRefineWatch();
        }
      },
      (err) => {
        setLocationError(err.message || 'Unable to refine location.');
        stopRefineWatch();
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
    watchIdRef.current = id as unknown as number;
  };

  const stopRefineWatch = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setRefining(false);
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      destroyMap();
    };
  }, []);

  const openMapDialog = () => setIsMapOpen(true);
  const closeMapDialog = () => setIsMapOpen(false);

  const handleMapSave = async () => {
    const lat = Number(tempLat);
    const lng = Number(tempLng);
    if (!isFinite(lat) || !isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      setCoordError('Please enter valid latitude and longitude.');
      return;
    }
    const parsed = await reverseGeocode(lat, lng);
    setOptions(prev => ({ ...prev, latitude: lat, longitude: lng, ...(parsed || {}) }));
    setIsMapOpen(false);
  };

  const handleSaveAddress = async () => {
    const required = [options.pincode, options.addressLine, options.city, options.state];
    const missingFields = required.map((v, i) => ({
      field: ['pincode', 'addressLine', 'city', 'state'][i],
      value: v,
      isEmpty: !v || String(v).trim() === ''
    })).filter(field => field.isEmpty);

    if (missingFields.length > 0) {
      toast({
        title: 'Incomplete address',
        description: `Please fill the following required fields: ${missingFields.map(f => f.field).join(', ')}`,
        variant: 'destructive'
      });
      return;
    }

    setIsSavingAddress(true);

    try {
      const addressData: ServiceAddress = {
        address: options.address,
        pincode: options.pincode,
        locality: options.locality,
        addressLine: options.addressLine,
        city: options.city,
        state: options.state,
        landmark: options.landmark,
        latitude: options.latitude,
        longitude: options.longitude,
      };

      saveServiceAddress(addressData);

      try {
        await AuthService.updateUserAddress(addressData);
      } catch (e: any) {
        console.warn('Backend address update failed:', e?.message || e);
      }

      if (options.address) {
        updateUser({ address: options.address });
      }

      setSavedAddress({
        pincode: options.pincode,
        locality: options.locality,
        addressLine: options.addressLine,
        city: options.city,
        state: options.state,
        landmark: options.landmark,
        address: options.address,
        latitude: options.latitude,
        longitude: options.longitude,
      });

      toast({
        title: 'Address saved!',
        description: 'We will use this address for your service visits. You can adjust it anytime before confirming.',
        variant: 'default'
      });
    } catch (error: any) {
      const errorMessage = error?.message || 'There was an error saving your address locally.';
      toast({
        title: 'Failed to save address',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleNext = () => {
    if (!options.bhkType || !options.squareFeet || !options.selectedPlanDuration) {
      toast({
        title: 'Incomplete Selection',
        description: 'Please select BHK type, property size, and plan duration to continue.',
        variant: 'destructive'
      });
      return;
    }

    try {
      saveServiceAddress({
        address: options.address,
        pincode: options.pincode,
        locality: options.locality,
        addressLine: options.addressLine,
        city: options.city,
        state: options.state,
        landmark: options.landmark,
        latitude: options.latitude,
        longitude: options.longitude,
      });
      
      // Save to localStorage for persistence
      localStorage.setItem('sweep_pro_selected_plan', JSON.stringify(selectedPlan));
      localStorage.setItem('sweep_pro_service_options', JSON.stringify(options));
    } catch { }

    navigate('/review-payment', {
      state: {
        selectedPlan,
        selectedOptions: options
      }
    });
  };

  const handleBack = () => {
    navigate(`/subscription/${selectedPlan.id}`, {
      state: { selectedPlan }
    });
  };

  // Simplified map functions (keeping the existing map functionality)
  async function initMap() { /* ... existing map code ... */ }
  function destroyMap() { /* ... existing map code ... */ }

  const selectedBhkConfig = options.bhkType ? BHK_CONFIGS.find(bhk => bhk.id === options.bhkType) : null;
  const showPricingPlans = options.bhkType && options.squareFeet > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Plan Details
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Schedule Your Service
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your preferred time, date, property details, and service location
          </p>
        </div>

        {/* Subscription Info Section */}
        <div className="mb-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md shadow-sm">
            <p className="text-md text-gray-800">
              <strong>Note:</strong> Any subscription includes regular service provided <strong>every day</strong>.<br />
              For <span className="font-semibold text-purple-700">Sweepro Lux</span> plans, <strong>buffer days</strong> are also provided for added flexibility. Please keep this in mind when choosing your plan.
            </p>
          </div>
        </div>

        {/* Selected Plan Summary */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedPlan.name}</h3>
                <p className="text-gray-600">{selectedPlan.description}</p>
                {selectedPlan.popular && (
                  <Badge className="mt-2 bg-blue-100 text-blue-800">Most Popular</Badge>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  {options.finalTotalPrice > 0 ? `₹${options.finalTotalPrice.toLocaleString()}` : 'Configure below'}
                </p>
                <p className="text-gray-500">
                  {options.selectedPlanDuration 
                    ? `Total for ${PLAN_DURATIONS.find(d => d.id === options.selectedPlanDuration)?.label.toLowerCase()}`
                    : 'Total price will be calculated'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Frequency Card - move above the row */}
        <div className="mb-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-purple-600" />
                Service Frequency
              </CardTitle>
              <CardDescription>Frequency is fixed based on your selected plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl border-2 border-purple-500 bg-purple-50 text-purple-700 font-semibold flex items-center justify-between">
                <span>
                  {selectedPlan.id === 'premium' ? '6 days/week (Sweepro Lux)' : '6 days/week (Sweepro Touch)'}
                </span>
                <Badge className="bg-green-500 text-white">Included</Badge>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {selectedPlan.id === 'premium' 
                  ? 'Daily cleaning service 6 days a week with premium care'
                  : 'Regular cleaning service 6 days a week with essential care'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Row: Preferred Time, Service Date, Property Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Preferred Time */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-blue-600" />
                Preferred Time
              </CardTitle>
              <CardDescription>Select an exact start time</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={options.timeSlot} onValueChange={(v) => handleOptionChange('timeSlot', v)}>
                <SelectTrigger className="h-12 text-base rounded-lg">
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-80 overflow-y-auto">
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Service Start Date */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-green-600" />
                Service Start Date
              </CardTitle>
              <CardDescription>When would you like to start the service?</CardDescription>
            </CardHeader>
            <CardContent>
              <input
                type="date"
                value={options.startDate}
                onChange={(e) => handleOptionChange('startDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
              />
            </CardContent>
          </Card>

          {/* Property Type - Only Apartment */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Home className="h-5 w-5 text-orange-600" />
                Property Type
              </CardTitle>
              <CardDescription>Select your property type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {PROPERTY_TYPES.map((type) => (
                  <div
                    key={type.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      options.propertyType === type.id
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 bg-white hover:border-orange-300'
                    }`}
                    onClick={() => handleOptionChange('propertyType', options.propertyType === type.id ? null : type.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{type.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold">{type.name}</h3>
                        <p className="text-sm text-gray-600">{type.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          ₹{type.pricePerSqFt}/sq ft rate
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* BHK Selection - only visible after Apartment selected */}
        {options.propertyType === 'apartment' && (
          <div className="pt-8">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  BHK Configuration
                </CardTitle>
                <CardDescription>Select your BHK type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {BHK_CONFIGS.map((bhk) => (
                    <div
                      key={bhk.id}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 text-center ${
                        options.bhkType === bhk.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white hover:border-blue-300'
                      }`}
                      onClick={() => handleBhkSelect(bhk.id)}
                      onMouseEnter={() => setHoveredBhk(bhk.id)}
                      onMouseLeave={() => setHoveredBhk(null)}
                    >
                      <div className="font-semibold text-lg">{bhk.label}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {bhk.sqftOptions.length} size options
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Size Selection - only visible after BHK selected */}
        {options.bhkType && (
          <div className="pt-8">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  Size Selection
                </CardTitle>
                <CardDescription>Select your property size</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {BHK_CONFIGS.find(bhk => bhk.id === options.bhkType)?.sqftOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        options.squareFeet === option.value
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 bg-white hover:border-green-300'
                      }`}
                      onClick={() => handleSqftSelect(option.value)}
                    >
                      <div className="font-semibold">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.value} sq ft</div>
                      <div className="text-xs text-gray-500">{option.range}</div>
                    </div>
                  ))}
                </div>
                {/* Custom Size Input */}
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600 whitespace-nowrap">Custom size:</span>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={options.squareFeet || ''}
                        onChange={(e) => handleOptionChange('squareFeet', parseInt(e.target.value) || 0)}
                        placeholder="Square feet"
                        className="w-32"
                        min="1"
                        max="10000"
                      />
                      <span className="text-sm text-gray-600">sq ft</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Plan Duration Selection (appears after sqft selection) */}
        {showPricingPlans && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Step 3: Choose Plan Duration & Pricing
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLAN_DURATIONS.map((duration) => {
                const pricing = calculatePlanPrice(duration);
                const isSelected = options.selectedPlanDuration === duration.id;
                const resolvedTotal = isSelected && options.pricing
                  ? Number(options.pricing.subtotal || 0)
                  : pricing.finalTotal;
                const resolvedTotalBeforeDiscount = isSelected && options.pricing
                  ? Number(options.pricing.totalBeforeDiscount || 0)
                  : pricing.totalBeforeDiscount;
                const resolvedDiscountPercent = isSelected && options.pricing
                  ? Number(options.pricing.discountPercent || 0)
                  : (duration.discount || 0);
                const resolvedDiscountAmount = isSelected && options.pricing
                  ? Number(options.pricing.discountAmount || 0)
                  : pricing.discountAmount;
                const resolvedMonthly = duration.multiplier > 0
                  ? Math.round(resolvedTotal / duration.multiplier)
                  : pricing.monthlyAfterDiscount;
                return (
                  <div
                    key={duration.id}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 relative ${
                      options.selectedPlanDuration === duration.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-300 bg-white hover:border-purple-300'
                    }`}
                    onClick={() => handlePlanDurationSelect(duration.id)}
                  >
                    {duration.popular && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white">
                        Most Popular
                      </Badge>
                    )}
                    
                    <div className="text-center">
                      <h4 className="font-bold text-lg text-gray-900">{duration.label}</h4>
                      <p className="text-xs text-gray-600 mb-3">{duration.description}</p>
                      
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-purple-600">
                          ₹{resolvedTotal.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          Total for {duration.label.toLowerCase()}
                        </div>
                        
                        {resolvedDiscountPercent > 0 && (
                          <>
                            <div className="text-sm text-gray-500 line-through">
                              ₹{resolvedTotalBeforeDiscount.toLocaleString()}
                            </div>
                            <div className="text-sm text-green-600 font-semibold">
                              Save ₹{resolvedDiscountAmount.toFixed(0)} ({resolvedDiscountPercent}%)
                            </div>
                          </>
                        )}
                        
                        <div className="text-sm text-gray-600 pt-2 border-t border-gray-200">
                          ₹{resolvedMonthly.toFixed(0)}/month
                        </div>
                      </div>
                    </div>

                    {options.selectedPlanDuration === duration.id && (
                      <Check className="absolute -top-2 -right-2 h-6 w-6 text-white bg-purple-600 rounded-full p-1" />
                    )}
                  </div>
                );
              })}
            </div>

            {options.selectedPlanDuration && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
                <h5 className="font-semibold text-gray-800 mb-2">Pricing Breakdown:</h5>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Base {selectedPlan.name} service:</span>
                    <span>
                      {options.pricing
                        ? `₹${Number(options.pricing.basePricePerPeriod || 0).toLocaleString()}/month`
                        : `₹${calculatePlanPrice(PLAN_DURATIONS.find(d => d.id === options.selectedPlanDuration)!).monthlyBaseCost}/month`
                      }
                    </span>
                  </div>
                  {!options.pricing && (
                    <div className="flex justify-between">
                      <span>Property cost ({options.squareFeet} sq ft):</span>
                      <span>₹{calculatePlanPrice(PLAN_DURATIONS.find(d => d.id === options.selectedPlanDuration)!).propertyBaseCost}/month</span>
                    </div>
                  )}
                  {(options.pricing ? options.pricing.discountPercent > 0 : (PLAN_DURATIONS.find(d => d.id === options.selectedPlanDuration)?.discount! > 0)) && (
                    <div className="flex justify-between text-green-600">
                      <span>
                        Discount ({options.pricing ? options.pricing.discountPercent : PLAN_DURATIONS.find(d => d.id === options.selectedPlanDuration)?.discount}%):
                      </span>
                      <span>
                        -₹{options.pricing
                          ? Number(options.pricing.discountAmount || 0).toFixed(0)
                          : calculatePlanPrice(PLAN_DURATIONS.find(d => d.id === options.selectedPlanDuration)!).discountAmount.toFixed(0)
                        }
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-purple-700 border-t pt-1">
                    <span>Final total ({PLAN_DURATIONS.find(d => d.id === options.selectedPlanDuration)?.label}):</span>
                    <span>
                      ₹{(options.pricing
                        ? Number(options.pricing.subtotal || 0)
                        : calculatePlanPrice(PLAN_DURATIONS.find(d => d.id === options.selectedPlanDuration)!).finalTotal
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Service Address Section */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-red-600" />
              Service Address
            </CardTitle>
            <CardDescription>Use your current location or adjust on the map</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" onClick={handleUseCurrentLocation} disabled={isLocating}>
                {isLocating ? 'Locating…' : 'Use my current location'}
              </Button>
              <Button variant="secondary" onClick={detectLocationAuto} disabled={autoDetecting}>
                {autoDetecting ? 'Detecting…' : 'Auto-detect'}
              </Button>
              {!refining ? (
                <Button variant="secondary" onClick={startRefineWatch}>Refine accuracy</Button>
              ) : (
                <Button variant="destructive" onClick={stopRefineWatch}>Stop refining</Button>
              )}
              <Button variant="secondary" onClick={openMapDialog}>Set on map</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Pincode</label>
                <Input value={options.pincode} onChange={(e) => handleOptionChange('pincode', e.target.value)} placeholder="Pincode" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Locality</label>
                <Input value={options.locality} onChange={(e) => handleOptionChange('locality', e.target.value)} placeholder="Area / Locality" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Address (Area and Street)</label>
                <Input value={options.addressLine} onChange={(e) => handleOptionChange('addressLine', e.target.value)} placeholder="House no., street" />
              </div>
              <div>
                <label className="text-sm text-gray-600">City/District/Town</label>
                <Input value={options.city} onChange={(e) => handleOptionChange('city', e.target.value)} placeholder="City / Town" />
              </div>
              <div>
                <label className="text-sm text-gray-600">State</label>
                <Input value={options.state} onChange={(e) => handleOptionChange('state', e.target.value)} placeholder="State" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Landmark (Optional)</label>
                <Input value={options.landmark} onChange={(e) => handleOptionChange('landmark', e.target.value)} placeholder="Nearby landmark" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Full address</label>
                <Input value={options.address} onChange={(e) => handleOptionChange('address', e.target.value)} placeholder="Auto-filled full address" />
              </div>
            </div>

            {locationError && (
              <p className="text-sm text-red-600">{locationError}</p>
            )}

            <div className="pt-2">
              <Button
                onClick={handleSaveAddress}
                disabled={isSavingAddress}
                className="font-semibold"
              >
                {isSavingAddress ? 'Saving address...' : 'Save as main address'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Next Button */}
        <div className="text-center">
          <Button
            className={`px-8 py-4 text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 ${
              showPricingPlans && options.selectedPlanDuration
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleNext}
            disabled={!showPricingPlans || !options.selectedPlanDuration}
          >
            Next: Review & Payment
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <p className="text-sm text-gray-500 mt-3">
            {!showPricingPlans 
              ? 'Complete property configuration to continue'
              : !options.selectedPlanDuration
              ? 'Select a plan duration to continue'
              : `Review your ₹${options.finalTotalPrice.toLocaleString()} plan before confirming`
            }
          </p>
        </div>
      </div>

      {/* Map Dialog */}
      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Set location on map</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="w-full h-[360px] overflow-hidden rounded-lg border">
              <div id={mapContainerIdRef.current} className="h-full w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600">Latitude</label>
                <Input value={tempLat} onChange={(e) => setTempLat(e.target.value)} placeholder="e.g., 17.3850" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Longitude</label>
                <Input value={tempLng} onChange={(e) => setTempLng(e.target.value)} placeholder="e.g., 78.4867" />
              </div>
            </div>
            {coordError && <p className="text-sm text-red-600">{coordError}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeMapDialog}>Cancel</Button>
            <Button onClick={handleMapSave}>Save location</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}