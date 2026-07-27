import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { apiRequest, API_ENDPOINTS, HttpMethod, getAuthTokenType } from '@/services/api';
import { SubscriptionService, TimeSlotCount } from '@/services/subscriptionService';

import { AuthService, Apartment } from '@/services/authService';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Home,
  MapPin,
  Sparkles,
  Users
} from 'lucide-react';

const BRAND = {
  indigo: '#1800ad',
  // keep all indigo shades derived from the single brand hex
  indigoTint: '#1800ad',
};

const INDIGO_STYLES = {
  gradient: BRAND.indigo,
  softGradient: `linear-gradient(135deg, ${BRAND.indigo}1f 0%, ${BRAND.indigo}0d 100%)`,
  subtleSurface: `linear-gradient(135deg, ${BRAND.indigo}14 0%, ${BRAND.indigo}05 100%)`,
  surface: 'rgba(255,255,255,0.92)',
  border: `${BRAND.indigo}26`
} as const;

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  duration: string;
  features: string[];
  serviceBreakdown: {
    utensilCleaning: string;
    floorCleaning: string;
    bathroomCleaning: string;
    homeDusting: string;
    kitProvided: string;
    timings: string;
    backupGuarantee: string;
    customerCare: string;
    bufferDays: string;
  };
  popular?: boolean;
  price?: number;
  finalPrice?: number;
  sessionsPerWeek?: number;
  sessionsPerMonth?: number;
  propertyPricing?: Array<{
    id: string;
    planId: string;
    propertyType: string;
    bhkType: string;
    squareFeet: number;
    sqftLabel: string;
    pricing: Record<PlanDurationId, number>;
    isActive: boolean;
  }>;
}

type PropertyTypeId = 'apartment' | 'bungalow';
type BhkId = '2bhk' | '3bhk' | '4bhk';
type PlanDurationId = '1month' | '3month' | '6month';

interface PlanDuration {
  id: PlanDurationId;
  label: string;
  description: string;
  multiplier: number;
  discount: number;
  popular?: boolean;
}

interface PropertyType {
  id: PropertyTypeId;
  name: string;
  description: string;
  pricePerSqFt: number;
  icon: string;
  disabled?: boolean;
  comingSoonLabel?: string;
}

interface SquareFootOption {
  value: number;
  range: string;
  pricing: Record<PlanDurationId, number>;
}

interface BhkConfig {
  id: BhkId;
  label: string;
  sqftOptions: SquareFootOption[];
}

interface ServiceOptions {
  timeSlot: string;
  startDate: string;
  address: string;
  apartmentId: string;
  apartmentNumber: string;
  floorNumber: string;
  propertyType: PropertyTypeId;
  bhkType: BhkId | null;
  squareFeet: number;
  squareFeetLabel?: string;
  selectedPlanDuration: PlanDurationId | null;
  finalTotalPrice: number;
}

interface PlanPriceBreakdown {
  monthlyBaseCost: number;
  propertyBaseCost: number;
  totalBeforeDiscount: number;
  discountPercent: number;
  discountAmount: number;
  monthlyAfterDiscount: number;
  finalTotal: number;
}

const STORAGE_KEYS = {
  SELECTED_PLAN: 'sweep_pro_selected_plan',
  SERVICE_OPTIONS: 'sweep_pro_service_options'
};

const PLAN_DURATIONS: PlanDuration[] = [
  {
    id: '1month',
    label: '1 Month',
    description: 'Monthly billing with maximum flexibility',
    multiplier: 1,
    discount: 0
  },
  {
    id: '3month',
    label: '3 Months',
    description: 'Quarterly plan with 5% savings',
    multiplier: 3,
    discount: 5,
    popular: true
  },
  {
    id: '6month',
    label: '6 Months',
    description: 'Semi-annual plan with 10% savings',
    multiplier: 6,
    discount: 10
  }
];

const PROPERTY_TYPES: PropertyType[] = [
  {
    id: 'apartment',
    name: 'Apartment',
    description: 'Flats, condos & multi-storey units',
    pricePerSqFt: 3.5,
    icon: '🏢'
  },
  {
    id: 'bungalow',
    name: 'Bungalow',
    description: 'Independent houses & villas',
    pricePerSqFt: 4.2,
    icon: '🏡',
    disabled: true,
    comingSoonLabel: 'Coming soon'
  }
// Backend authoritative PropertyPricing is used dynamically for BHK configurations 
];

const TIME_SLOTS = [
  '06:00 - 08:00',
  '08:00 - 10:00',
  '10:00 - 12:00',
  '12:00 - 14:00'
];

const PaymentOptionsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, updateUser } = useUser();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [options, setOptions] = useState<ServiceOptions>({
    timeSlot: '',
    startDate: '',
    address: '',
    apartmentId: '',
    apartmentNumber: '',
    floorNumber: '',
    propertyType: 'apartment',
    bhkType: null,
    squareFeet: 0,
    squareFeetLabel: undefined,
    selectedPlanDuration: null,
    finalTotalPrice: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [addressMode, setAddressMode] = useState<'confirm' | 'edit'>('edit');
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [isLoadingApartments, setIsLoadingApartments] = useState(false);
  const [selectedApartmentId, setSelectedApartmentId] = useState<string>('');
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [floorNumber, setFloorNumber] = useState('');
  const [timeSlotCounts, setTimeSlotCounts] = useState<TimeSlotCount[]>([]);
  const [isLoadingSlotCounts, setIsLoadingSlotCounts] = useState(false);

  // Section refs for scroll-to-validation
  const propertyTypeRef = useRef<HTMLDivElement>(null);
  const propertyConfigRef = useRef<HTMLDivElement>(null);
  const planDurationRef = useRef<HTMLDivElement>(null);
  const scheduleRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<HTMLDivElement>(null);

  const isLuxPlan = selectedPlan?.id === 'premium' || selectedPlan?.name?.toLowerCase().includes('lux') || selectedPlan?.name?.toLowerCase().includes('premium') || false;

  // Fetch global time slot counts (not date-specific)
  const fetchTimeSlotCounts = useCallback(async () => {
    setIsLoadingSlotCounts(true);
    try {
      const response = await SubscriptionService.getTimeSlotCounts();
      if (response.success && response.data?.slots) {
        setTimeSlotCounts(response.data.slots);
      }
    } catch (error) {
      console.error('Failed to fetch time slot counts:', error);
      // On error, show all slots as available
      setTimeSlotCounts([]);
    } finally {
      setIsLoadingSlotCounts(false);
    }
  }, []);

  // Fetch slot counts on component mount
  useEffect(() => {
    fetchTimeSlotCounts();
  }, [fetchTimeSlotCounts]);

  // Helper to get slot info
  const getSlotInfo = (slot: string): TimeSlotCount | undefined => {
    return timeSlotCounts.find(s => s.timeSlot === slot);
  };

  const saveToStorage = (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  };

  const getFromStorage = (key: string) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const parseUnitDetails = (raw: string) => {
    const aptMatch = raw.match(/\bApt:\s*([^,]+)/i);
    const floorMatch = raw.match(/\bFloor:\s*([^,]+)/i);
    return {
      apartmentNumber: aptMatch?.[1]?.trim() || '',
      floorNumber: floorMatch?.[1]?.trim() || ''
    };
  };

  const buildAddressFromApartment = (apt: Apartment | null, unit: string, floor: string) => {
    const base = apt ? `${apt.name} - ${apt.area}` : '';
    return `${base}${unit ? `, Apt: ${unit}` : ''}${floor ? `, Floor: ${floor}` : ''}`;
  };

  useEffect(() => {
    let isMounted = true;
    const loadBackendPlans = async () => {
      try {
        setIsLoading(true);
        const searchParams = new URLSearchParams(location.search);
        const planIdFromQuery = searchParams.get('planId') ?? 'standard';
        const savedPlan = (location.state as any)?.selectedPlan as SubscriptionPlan | undefined;
        const storedPlan = getFromStorage(STORAGE_KEYS.SELECTED_PLAN) as SubscriptionPlan | null;

        const targetPlanId = savedPlan?.id || storedPlan?.id || planIdFromQuery;

        // Fetch real plans with PropertyPricing from backend
        const response = await SubscriptionService.getSubscriptionPlans();
        const rawPlans: any = response?.data;
        const backendPlans: any[] = Array.isArray(rawPlans)
          ? rawPlans
          : rawPlans?.plans || (response as any)?.plans || [];

        if (isMounted) {
          const normalizeName = (val: string) => (val || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
          
          let matchedPlan = backendPlans.find((p: any) => p.id === targetPlanId || normalizeName(p.name) === normalizeName(targetPlanId));
          if (!matchedPlan) {
            matchedPlan = backendPlans.find((p: any) => {
              const n = normalizeName(p.name);
              if (targetPlanId === 'standard' || targetPlanId?.toLowerCase().includes('touch')) return n.includes('touch');
              if (targetPlanId === 'premium' || targetPlanId?.toLowerCase().includes('lux')) return n.includes('lux');
              return false;
            });
          }
          if (!matchedPlan && backendPlans.length > 0) {
            matchedPlan = backendPlans[0];
          }

          const baseUI = savedPlan || storedPlan || {
            id: 'dummy-plan',
            name: 'Sweepro Touch',
            description: 'Premium cleaning service for your home.',
            price: 2000,
            finalPrice: 1800,
            sessionsPerWeek: 6,
            sessionsPerMonth: 24,
            duration: 'month',
            features: [
              'Utensil cleaning & floor mopping',
              'Professional cleaning kit provided',
              'Fixed time slots for consistency',
              'Backup homecare partner guarantee',
              'Customer support included'
            ],
            serviceBreakdown: {
              utensilCleaning: 'Included',
              floorCleaning: 'Included (Sweeping & Mopping)',
              bathroomCleaning: 'Included',
              homeDusting: 'Included',
              kitProvided: 'Professional kit provided',
              timings: 'Fixed slots',
              backupGuarantee: 'Backup homecare partner guarantee',
              customerCare: 'Support included',
              bufferDays: 'Included'
            }
          };

          // Generate dummy property pricing if not provided by backend
          // Pricing is stored as MONTHLY rates. Frontend calculates totals with duration multipliers and discounts.
          const fallbackPropertyPricing = [
            { id: '1', planId: 'dummy', propertyType: 'apartment', bhkType: '2bhk', squareFeet: 1000, sqftLabel: 'Up to 1000 sq ft', pricing: { '1month': 2000, '3month': 2000, '6month': 2000 }, isActive: true },
            { id: '2', planId: 'dummy', propertyType: 'apartment', bhkType: '3bhk', squareFeet: 1500, sqftLabel: 'Up to 1500 sq ft', pricing: { '1month': 3000, '3month': 3000, '6month': 3000 }, isActive: true },
            { id: '3', planId: 'dummy', propertyType: 'apartment', bhkType: '4bhk', squareFeet: 2000, sqftLabel: 'Up to 2000 sq ft', pricing: { '1month': 4000, '3month': 4000, '6month': 4000 }, isActive: true }
          ];

          const mergedPlan: SubscriptionPlan = {
            ...baseUI,
            id: matchedPlan?.id || baseUI.id,
            name: matchedPlan?.name || baseUI.name || 'Sweepro Plan',
            description: matchedPlan?.description || baseUI.description || '',
            finalPrice: matchedPlan?.finalPrice || matchedPlan?.basePrice || baseUI.finalPrice,
            price: matchedPlan?.finalPrice || matchedPlan?.basePrice || baseUI.price,
            sessionsPerWeek: matchedPlan?.sessionsPerWeek || baseUI.sessionsPerWeek || 6,
            sessionsPerMonth: matchedPlan?.sessionsPerMonth || baseUI.sessionsPerMonth || 24,
            propertyPricing: (matchedPlan?.propertyPricing?.length > 0) ? matchedPlan.propertyPricing : fallbackPropertyPricing
          };

          setSelectedPlan(mergedPlan);
          saveToStorage(STORAGE_KEYS.SELECTED_PLAN, mergedPlan);

          const savedOptions = (location.state as any)?.selectedOptions || getFromStorage(STORAGE_KEYS.SERVICE_OPTIONS);
          if (savedOptions) {
            setOptions(savedOptions);
          }
        }
      } catch (error) {
        console.error('Failed to fetch subscription plans from backend:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadBackendPlans();
    return () => {
      isMounted = false;
    };
  }, [location.search, location.state]);

  const bhkConfigs = useMemo(() => {
    if (options.propertyType !== 'apartment' || !selectedPlan?.propertyPricing || !Array.isArray(selectedPlan.propertyPricing)) {
      return [] as BhkConfig[];
    }

    const groups: Record<string, SquareFootOption[]> = {};
    const bhkLabels: Record<string, string> = {
      '2bhk': '2 BHK',
      '3bhk': '3 BHK',
      '4bhk': '4 BHK'
    };

    selectedPlan.propertyPricing.forEach((row) => {
      if (!row.isActive || row.propertyType !== options.propertyType) return;
      const bhk = row.bhkType.toLowerCase();
      if (!groups[bhk]) {
        groups[bhk] = [];
      }
      groups[bhk].push({
        value: row.squareFeet,
        range: row.sqftLabel || `${row.squareFeet} sq ft`,
        pricing: row.pricing as Record<PlanDurationId, number>
      });
    });

    const order = ['2bhk', '3bhk', '4bhk'];
    const result: BhkConfig[] = [];
    order.forEach((bhkId) => {
      if (groups[bhkId] && groups[bhkId].length > 0) {
        groups[bhkId].sort((a, b) => a.value - b.value);
        result.push({
          id: bhkId as BhkId,
          label: bhkLabels[bhkId] || bhkId.toUpperCase(),
          sqftOptions: groups[bhkId]
        });
      }
    });

    return result;
  }, [selectedPlan, options.propertyType]);

  const selectedBhkConfig = useMemo(() => {
    if (!options.bhkType) return null;
    return bhkConfigs.find((config) => config.id === options.bhkType) ?? null;
  }, [bhkConfigs, options.bhkType]);

  const selectedSqftOption = useMemo(() => {
    if (!selectedBhkConfig || !options.squareFeet) return null;
    return selectedBhkConfig.sqftOptions.find((opt) => opt.value === options.squareFeet) ?? null;
  }, [options.squareFeet, selectedBhkConfig]);

  const calculatePlanPrice = useCallback((duration: PlanDuration): PlanPriceBreakdown => {
    // Read the authoritative backend total price for the specific billing duration
    const finalTotal = Number(selectedSqftOption?.pricing?.[duration.id]) || 0;
    const monthlyAfterDiscount = duration.multiplier > 0 ? finalTotal / duration.multiplier : finalTotal;
    
    const monthlyBaseCost = Number(selectedSqftOption?.pricing?.['1month']) || 0;
    const totalBeforeDiscount = monthlyBaseCost * duration.multiplier;
    const discountAmount = Math.max(0, totalBeforeDiscount - finalTotal);
    const discountPercent = totalBeforeDiscount > 0 ? Math.round((discountAmount / totalBeforeDiscount) * 100) : 0;
    
    return {
      monthlyBaseCost,
      propertyBaseCost: monthlyBaseCost,
      totalBeforeDiscount,
      discountPercent,
      discountAmount,
      monthlyAfterDiscount: Math.round(monthlyAfterDiscount * 100) / 100,
      finalTotal
    };
  }, [selectedSqftOption]);

  const handlePlanDurationSelect = (durationId: PlanDurationId) => {
    const duration = PLAN_DURATIONS.find((d) => d.id === durationId);
    if (!duration) return;
    const pricing = calculatePlanPrice(duration);
    setOptions((prev) => ({
      ...prev,
      selectedPlanDuration: durationId,
      finalTotalPrice: pricing.finalTotal
    }));
  };

  const handlePropertyTypeSelect = (propertyType: PropertyTypeId) => {
    const selectedType = PROPERTY_TYPES.find((type) => type.id === propertyType);
    if (selectedType?.disabled) return;
    setOptions((prev) => ({
      ...prev,
      propertyType,
      bhkType: null,
      squareFeet: 0,
      squareFeetLabel: undefined,
      selectedPlanDuration: null,
      finalTotalPrice: 0
    }));
  };

  const handleBhkSelect = (bhkId: BhkId) => {
    setOptions((prev) => ({
      ...prev,
      bhkType: bhkId,
      squareFeet: 0,
      squareFeetLabel: undefined,
      selectedPlanDuration: null,
      finalTotalPrice: 0
    }));
  };

  const handleSqftSelect = (value: string) => {
    const sqftValue = Number.parseInt(value, 10);
    if (Number.isNaN(sqftValue)) return;
    const label = selectedBhkConfig?.sqftOptions.find((opt) => opt.value === sqftValue)?.range;
    setOptions((prev) => ({
      ...prev,
      squareFeet: sqftValue,
      squareFeetLabel: label,
      selectedPlanDuration: null,
      finalTotalPrice: 0
    }));
  };

  useEffect(() => {
    if (!options.selectedPlanDuration) return;
    const duration = PLAN_DURATIONS.find((d) => d.id === options.selectedPlanDuration);
    if (!duration) return;
    const pricing = calculatePlanPrice(duration);
    setOptions((prev) => (prev.finalTotalPrice === pricing.finalTotal ? prev : { ...prev, finalTotalPrice: pricing.finalTotal }));
  }, [calculatePlanPrice, options.selectedPlanDuration]);

  useEffect(() => {
    if (!apartments.length) return;

    // Check saved options first, then user context
    const storedAddress = options.address || (user as any)?.address || '';
    const storedAptId = options.apartmentId || (user as any)?.apartment_id || (user as any)?.apartmentId || '';
    const storedAptNum = options.apartmentNumber || '';
    const storedFloorNum = options.floorNumber || '';

    // Parse apartment/flat number and floor number if not explicitly in options
    const parsed = parseUnitDetails(storedAddress);
    const finalAptNum = storedAptNum || parsed.apartmentNumber;
    const finalFloorNum = storedFloorNum || parsed.floorNumber;

    // Find apartment complex ID from storedAptId or by matching name in address string
    let finalAptId = storedAptId;
    if (!finalAptId && storedAddress) {
      const foundApt = apartments.find((a) => storedAddress.toLowerCase().includes(a.name.toLowerCase()));
      if (foundApt) {
        finalAptId = foundApt.id;
      }
    }

    // Set form input states
    if (finalAptId) setSelectedApartmentId(finalAptId);
    if (finalAptNum) setApartmentNumber(finalAptNum);
    if (finalFloorNum) setFloorNumber(finalFloorNum);

    // Address is complete if complex ID, flat number, and floor number are present
    const isComplete = Boolean(finalAptId && finalAptNum && finalFloorNum && storedAddress);

    if (isComplete) {
      const aptObj = apartments.find((a) => a.id === finalAptId) || null;
      const fullAddr = buildAddressFromApartment(aptObj, finalAptNum, finalFloorNum) || storedAddress;
      setOptions((prev) => ({
        ...prev,
        apartmentId: finalAptId,
        apartmentNumber: finalAptNum,
        floorNumber: finalFloorNum,
        address: fullAddr
      }));
      setAddressMode('confirm');
    } else {
      setAddressMode('edit');
    }
  }, [user, apartments]);

  const handleOptionChange = (field: keyof ServiceOptions, value: string) => {
    setOptions((prev) => {
      const updated = {
        ...prev,
        [field]: value
      };
      
      // If start date changes, clear the selected time slot (it might not be available for new date)
      if (field === 'startDate' && value !== prev.startDate) {
        updated.timeSlot = '';
      }
      
      return updated;
    });
  };

  const handleCancelAddressEdit = () => {
    // If we already have a confirmed complete address, revert to confirmed mode
    if (options.address && options.apartmentId && options.apartmentNumber && options.floorNumber) {
      setSelectedApartmentId(options.apartmentId);
      setApartmentNumber(options.apartmentNumber);
      setFloorNumber(options.floorNumber);
      setAddressMode('confirm');
    } else {
      // If no valid confirmed address exists, clear and remain in edit mode
      setApartmentNumber('');
      setFloorNumber('');
      setSelectedApartmentId('');
      setOptions((prev) => ({
        ...prev,
        address: '',
        apartmentNumber: '',
        floorNumber: '',
        apartmentId: ''
      }));
      setAddressMode('edit');
    }
  };

  const handleSaveAddress = async () => {
    if (!selectedApartmentId) {
      toast({
        title: 'Apartment complex required',
        description: 'Please select your apartment complex.',
        variant: 'destructive'
      });
      return;
    }

    if (!apartmentNumber.trim()) {
      toast({
        title: 'Apartment/House number required',
        description: 'Please enter your apartment or house number.',
        variant: 'destructive'
      });
      return;
    }

    if (!floorNumber.trim()) {
      toast({
        title: 'Floor number required',
        description: 'Please enter your floor number.',
        variant: 'destructive'
      });
      return;
    }

    const apt = apartments.find((a) => a.id === selectedApartmentId) || null;
    const nextAddress = buildAddressFromApartment(apt, apartmentNumber, floorNumber);

    setIsSavingAddress(true);
    try {
      const tokenType = getAuthTokenType();
      const endpoint = tokenType === 'firebase' ? '/auth/firebase/update-profile' : API_ENDPOINTS.PROFILE.UPDATE_USER;

      await apiRequest(endpoint, {
        method: HttpMethod.PUT,
        requiresAuth: true,
        body: {
          address: nextAddress,
          apartment_id: selectedApartmentId
        }
      });

      updateUser({ address: nextAddress, apartment_id: selectedApartmentId } as any);
      setOptions((prev) => ({
        ...prev,
        apartmentId: selectedApartmentId,
        apartmentNumber,
        floorNumber,
        address: nextAddress
      }));
      setAddressMode('confirm');
      toast({
        title: 'Address updated',
        description: 'Your service address has been saved.'
      });
    } catch (err: any) {
      toast({
        title: 'Failed to update address',
        description: err?.message || 'Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSavingAddress(false);
    }
  };

  const loadApartments = async () => {
    setIsLoadingApartments(true);
    try {
      const response = await AuthService.getApartments();
      if (response.success && response.data?.apartments) {
        setApartments(response.data.apartments);
      }
    } catch {
      toast({
        title: 'Failed to load apartments',
        description: 'Please refresh and try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingApartments(false);
    }
  };

  useEffect(() => {
    loadApartments();
  }, [toast]);

  const handleNext = () => {
    if (!options.bhkType) {
      toast({
        title: 'Select property configuration',
        description: 'Choose a BHK configuration to continue.',
        variant: 'destructive'
      });
      propertyConfigRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!options.squareFeet) {
      toast({
        title: 'Select size range',
        description: 'Choose the size range for your property.',
        variant: 'destructive'
      });
      propertyConfigRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!options.selectedPlanDuration) {
      toast({
        title: 'Select plan duration',
        description: 'Choose a billing duration to proceed.',
        variant: 'destructive'
      });
      planDurationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!options.startDate) {
      toast({
        title: 'Select start date',
        description: 'Pick a service start date to proceed.',
        variant: 'destructive'
      });
      scheduleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!options.timeSlot) {
      toast({
        title: 'Select time slot',
        description: 'Choose a preferred time window to continue.',
        variant: 'destructive'
      });
      scheduleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!selectedApartmentId || !apartmentNumber.trim() || !floorNumber.trim()) {
      toast({
        title: 'Complete address details required',
        description: 'Please fill in all address fields (apartment complex, apartment number, floor number) and save to continue.',
        variant: 'destructive'
      });
      addressRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Also check if address has been saved
    if (!options.address || addressMode !== 'confirm') {
      toast({
        title: 'Please save your address',
        description: 'Click "Save Address" to save your details before proceeding.',
        variant: 'destructive'
      });
      addressRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    saveToStorage(STORAGE_KEYS.SELECTED_PLAN, selectedPlan);
    saveToStorage(STORAGE_KEYS.SERVICE_OPTIONS, options);

    navigate('/review-payment', {
      state: {
        selectedPlan,
        selectedOptions: options
      }
    });
  };

  if (isLoading || !selectedPlan) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white">
        <div className="space-y-4 text-center">
          <div
            className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: BRAND.indigo }}
          />
          <p className="text-slate-500">Loading your plan details...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden text-slate-900"
      style={{
        background: `radial-gradient(circle at 10% -10%, ${BRAND.indigo}1f 0%, transparent 60%), radial-gradient(circle at 85% 8%, ${BRAND.indigo}26 0%, transparent 55%), #ffffff`
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-44 right-10 h-[26rem] w-[26rem] rounded-full blur-[140px]"
          style={{ background: `${BRAND.indigo}29` }}
        />
        <div
          className="absolute -bottom-56 left-16 h-[30rem] w-[30rem] rounded-full blur-[150px]"
          style={{ background: `${BRAND.indigo}2e` }}
        />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col px-4 pb-20 pt-10 lg:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/subscription')}
            className="group flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium shadow-sm transition"
            style={{
              border: `1px solid ${BRAND.indigo}33`,
              color: BRAND.indigo,
              background: '#ffffff'
            }}
          >
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
            Back to plans
          </Button>
          <div  className="rounded-full px-4 py-1 flex " 
          style={{
              border: `1px solid ${BRAND.indigo}33`,
            
              color: BRAND.indigo
            }}>
            <img src='/apple-touch-icon.png' alt='Sweepro Logo' className='h-6 w-6 inline-block mr-2' />
          <Badge
            className="rounded-full bg-transpernt text- px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em]"
           style={{
            color:BRAND.indigo
           }}
          >
            {selectedPlan.name}
          </Badge>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-8">
            <section
              className="space-y-4 rounded-[28px] px-6 py-8 shadow-xl"
              style={{
                border: `1px solid ${BRAND.indigo}26`,
                background:
                  selectedPlan.id === 'standard'
                    ? 'linear-gradient(135deg, rgba(188,220,255,0.92) 0%, rgba(169,207,255,0.82) 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(238,235,227,0.82) 100%)'
              }}
            >
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em]"
                style={{ background: `${BRAND.indigo}10`, color: BRAND.indigo, border: `1px solid ${BRAND.indigo}33` }}
              >
                Payment · Scheduling
              </div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl" style={{ color: BRAND.indigo }}>
                Shape the perfect Sweepro subscription
              </h1>
              <p className="max-w-2xl text-sm md:text-base" style={{ color: 'rgba(32,30,69,0.7)' }}>
                Tune every detail from property profile and service rhythm to billing cadence, while we keep a live, crystal-clear summary of your investment.
              </p>
            </section>

            <Card ref={propertyTypeRef} className="rounded-3xl border bg-white shadow-xl" style={{ borderColor: `${BRAND.indigo}26` }}>
              <CardHeader className="space-y-3">
                <CardTitle className="flex items-center gap-3 text-lg" style={{ color: BRAND.indigo }}>
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{
                      border: `1px solid ${BRAND.indigo}33`,
                      background: `${BRAND.indigo}12`
                    }}
                  >
                    <Home className="h-5 w-5" style={{ color: BRAND.indigo }} />
                  </span>
                  Property type
                </CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  Select the property format that best describes your space. This helps us tailor staffing and supplies.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {PROPERTY_TYPES.map((type) => {
                    const isActive = options.propertyType === type.id;
                    const disabledStyles = type.disabled
                      ? {
                          cursor: 'not-allowed' as const,
                          opacity: 0.55,
                          background: '#f1f5f9',
                          borderColor: '#e2e8f0'
                        }
                      : {};

                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handlePropertyTypeSelect(type.id)}
                        disabled={type.disabled}
                        className="group relative flex w-full flex-col gap-4 rounded-2xl px-5 py-6 text-left transition-all duration-200"
                        style={{
                          border: `1px solid ${isActive ? `${BRAND.indigo}55` : '#e2e8f0'}`,
                          background: isActive ? INDIGO_STYLES.softGradient : '#ffffff',
                          boxShadow: isActive
                            ? `0 25px 60px -35px ${BRAND.indigo}59`
                            : '0 1px 0 rgba(15,23,42,0.05)',
                          color: '#1f2937',
                          ...disabledStyles
                        }}
                      >
                        <span className="text-2xl">{type.icon}</span>
                        <div className="space-y-1">
                          <p className="text-base font-semibold" style={{ color: BRAND.indigo }}>
                            {type.name}
                          </p>
                          <p className="text-sm" style={{ color: 'rgba(32,30,69,0.65)' }}>
                            {type.description}
                          </p>
                        </div>
                        {type.disabled ? (
                          <span
                            className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em]"
                            style={{
                              border: '1px solid #d1d5db',
                              background: '#fff',
                              color: '#64748b'
                            }}
                          >
                            <Sparkles className="h-3 w-3" /> {type.comingSoonLabel || 'Coming soon'}
                          </span>
                        ) : isActive ? (
                          <span
                            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em]"
                            style={{ color: BRAND.indigo }}
                          >
                            <Sparkles className="h-3.5 w-3.5" /> Selected
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
                {isLuxPlan && options.propertyType === 'apartment' && (
                  <p
                    className="mt-5 flex items-start gap-2 rounded-2xl px-5 py-4 text-sm"
                    style={{
                      border: `1px solid ${BRAND.indigo}33`,
                      background: `${BRAND.indigo}0f`,
                      color: BRAND.indigo
                    }}
                  >
                    <Sparkles className="mt-0.5 h-4 w-4" style={{ color: BRAND.indigo }} /> Sweepro Lux apartment plans are calibrated for premium 2, 3 and 4 BHK layouts. Choose from curated size ranges below for tailored staffing.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card ref={propertyConfigRef} className="rounded-3xl border border-slate-200 bg-white shadow-xl">
              <CardHeader className="space-y-3">
                <CardTitle className="flex items-center gap-3 text-lg" style={{ color: BRAND.indigo }}>
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ border: `1px solid ${BRAND.indigo}33`, background: `${BRAND.indigo}12` }}
                  >
                    <Sparkles className="h-5 w-5" style={{ color: BRAND.indigo }} />
                  </span>
                  Property configuration
                </CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  Pick the BHK format and size band. We use this to plan crew sizing and inventory.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-3">
                  {bhkConfigs.map((config) => {
                    const isActive = options.bhkType === config.id;
                    return (
                      <Button
                        key={config.id}
                        variant="outline"
                        onClick={() => handleBhkSelect(config.id)}
                        className="rounded-full border px-6 py-2 text-sm font-semibold transition"
                        style={{
                          borderColor: isActive ? `${BRAND.indigo}70` : '#e2e8f0',
                          background: isActive ? `${BRAND.indigo}15` : '#ffffff',
                          color: isActive ? BRAND.indigo : '#475569',
                          boxShadow: isActive ? `0 18px 40px -25px ${BRAND.indigo}73` : undefined
                        }}
                      >
                        {config.label}
                      </Button>
                    );
                  })}
                </div>

                {selectedBhkConfig && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedBhkConfig.sqftOptions.map((option) => {
                      const isActive = options.squareFeet === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleSqftSelect(option.value.toString())}
                          className="flex w-full flex-col gap-3 rounded-2xl border px-5 py-5 text-left transition"
                          style={{
                            border: `1px solid ${isActive ? `${BRAND.indigo}70` : '#e2e8f0'}`,
                            background: isActive ? `linear-gradient(135deg, ${BRAND.indigo}14 0%, ${BRAND.indigo}05 100%)` : '#ffffff',
                            boxShadow: isActive ? `0 25px 60px -35px ${BRAND.indigo}59` : '0 1px 0 rgba(15,23,42,0.05)'
                          }}
                        >
                          <div>
                            <p className="text-base font-semibold" style={{ color: BRAND.indigo }}>
                              {option.range}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1 text-sm">
                            {isActive ? (
                                <span className="text-base font-semibold" style={{ color: BRAND.indigo }}>Starting at ₹{option.pricing['6month'].toLocaleString()}{' '}
                                  <span className="text-xs font-medium" style={{ color: `${BRAND.indigo}c2` }}>/ month</span>
                                </span>
                            ) : (
                              <span className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400">Select to view pricing</span>
                            )}
                          </div>
                          {isActive && (
                            <span
                              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em]"
                              style={{ color: BRAND.indigo }}
                            >
                              <Check className="h-4 w-4" /> Active selection
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card ref={planDurationRef} className="rounded-3xl border border-slate-200 bg-white shadow-xl">
              <CardHeader className="space-y-3">
                <CardTitle className="flex items-center gap-3 text-lg" style={{ color: BRAND.indigo }}>
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ border: `1px solid ${BRAND.indigo}33`, background: `${BRAND.indigo}12` }}
                  >
                    <Calendar className="h-5 w-5" style={{ color: BRAND.indigo }} />
                  </span>
                  Plan duration & pricing
                </CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  Lock in the billing cadence that fits you best. Savings surface instantly—no calculators required.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  {PLAN_DURATIONS.map((duration) => {
                    const pricing = calculatePlanPrice(duration);
                    const isActive = options.selectedPlanDuration === duration.id;
                    const monthly = pricing.monthlyAfterDiscount;
                    return (
                      <button
                        key={duration.id}
                        type="button"
                        onClick={() => handlePlanDurationSelect(duration.id)}
                        className="relative flex h-full flex-col gap-3 rounded-2xl border px-5 py-6 text-left transition"
                        style={{
                          borderColor: isActive ? `${BRAND.indigo}70` : '#e2e8f0',
                          background: isActive ? INDIGO_STYLES.softGradient : '#ffffff',
                          boxShadow: isActive ? `0 25px 60px -35px ${BRAND.indigo}59` : '0 1px 0 rgba(15,23,42,0.05)'
                        }}
                      >
                        {duration.popular && (
                          <Badge
                            className="absolute -top-3 left-4 rounded-full px-3 text-[11px] font-semibold uppercase tracking-[0.35em]"
                            style={{ border: `1px solid ${BRAND.indigo}33`, background: `${BRAND.indigo}12`, color: BRAND.indigo }}
                          >
                            Most loved
                          </Badge>
                        )}
                        <div>
                          <p className="text-base font-semibold" style={{ color: BRAND.indigo }}>{duration.label}</p>
                          <p className="text-xs text-slate-500">{duration.description}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-semibold" style={{ color: BRAND.indigo }}>₹{monthly.toLocaleString()}<span className="text-sm font-medium" style={{ color: `${BRAND.indigo}99` }}>/month</span></p>
                          {duration.multiplier > 1 && (
                            <p className="text-xs font-medium text-slate-500">
                              Total: ₹{pricing.finalTotal.toLocaleString()}
                            </p>
                          )}
                        </div>
                        {pricing.discountPercent > 0 && (
                          <p className="text-xs font-medium" style={{ color: BRAND.indigo }}>
                            Save {pricing.discountPercent}% (₹{pricing.discountAmount.toLocaleString()})
                          </p>
                        )}
                        {isActive && <Check className="absolute right-4 top-4 h-5 w-5" style={{ color: BRAND.indigo }} />}
                      </button>
                    );
                  })}
                </div>

                {/* {options.selectedPlanDuration && (
                  <div
                    className="rounded-2xl px-5 py-4 text-sm text-slate-700 shadow-inner"
                    style={{ border: `1px solid ${BRAND.indigo}26`, background: `${BRAND.indigo}0d` }}
                  >
                    <div className="flex items-center justify-between">
                      <span>Plan subtotal ({PLAN_DURATIONS.find((d) => d.id === options.selectedPlanDuration)?.label}):</span>
                      <span className="font-semibold text-slate-900">₹{options.finalTotalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                )} */}
              </CardContent>
            </Card>

            <Card ref={scheduleRef} className="rounded-3xl border border-slate-200 bg-white shadow-xl">
              <CardHeader className="space-y-3">
                <CardTitle className="flex items-center gap-3 text-lg" style={{ color: BRAND.indigo }}>
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ border: `1px solid ${BRAND.indigo}33`, background: `${BRAND.indigo}12` }}
                  >
                    <Clock className="h-5 w-5" style={{ color: BRAND.indigo }} />
                  </span>
                  Schedule preferences
                </CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  Set the kickoff date and timing window. You can tweak everything later from your dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Start Date Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                    <Calendar className="inline h-3.5 w-3.5 mr-1.5" />
                    Start date
                  </label>
                  <Input
                    type="date"
                    value={options.startDate}
                    min={(() => {
                      const dayAfterTomorrow = new Date();
                      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
                      return dayAfterTomorrow.toISOString().split('T')[0];
                    })()}
                    onChange={(event) => handleOptionChange('startDate', event.target.value)}
                    className="rounded-xl border border-slate-200 bg-white text-slate-800 h-12"
                    style={{
                      outline: 'none',
                      boxShadow: 'none'
                    }}
                  />
                  <p className="text-xs text-slate-500">
                    Services can be scheduled starting from the day after tomorrow
                  </p>
                </div>

                {/* Time Slot Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                      <Clock className="inline h-3.5 w-3.5 mr-1.5" />
                      Select time slot
                    </label>
                    {isLoadingSlotCounts && (
                      <span className="text-xs text-slate-400 animate-pulse">Loading availability...</span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {TIME_SLOTS.map((slot) => {
                      const slotInfo = getSlotInfo(slot);
                      const count = slotInfo?.count ?? 0;
                      const maxLimit = slotInfo?.maxLimit ?? 20;
                      const isDisabled = slotInfo?.isDisabled ?? false;
                      const isFull = count >= maxLimit;
                      const isSelected = options.timeSlot === slot;
                      const availableSpots = maxLimit - count;
                      
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => {
                            if (isDisabled) {
                              toast({
                                title: 'Slot Full',
                                description: `This time slot has reached the maximum of ${maxLimit} bookings. Please select another slot.`,
                                variant: 'destructive'
                              });
                              return;
                            }
                            handleOptionChange('timeSlot', slot);
                          }}
                          className={`
                            relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                            ${isSelected 
                              ? 'border-[#1800ad] bg-[#1800ad]/5 shadow-md' 
                              : isDisabled 
                                ? 'border-red-200 bg-red-50 cursor-not-allowed opacity-60' 
                                : 'border-slate-200 bg-white hover:border-[#1800ad]/50 hover:shadow-sm cursor-pointer'
                            }
                          `}
                        >
                          {/* Selected Indicator */}
                          {isSelected && (
                            <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-[#1800ad] flex items-center justify-center">
                              <Check className="h-3.5 w-3.5 text-white" />
                            </div>
                          )}
                          
                          {/* Time Slot */}
                          <div className={`text-base font-semibold ${isDisabled ? 'text-slate-400' : 'text-slate-800'}`}>
                            {slot}
                          </div>
                          
                          {/* Availability Badge */}
                          <div className="mt-2 flex items-center gap-2">
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              isFull 
                                ? 'bg-red-100 text-red-600' 
                                : availableSpots <= 5 
                                  ? 'bg-amber-100 text-amber-600'
                                  : 'bg-green-100 text-green-600'
                            }`}>
                              <Users className="h-3 w-3" />
                              <span>{count}/{maxLimit}</span>
                            </div>
                            {isFull ? (
                              <Badge variant="destructive" className="text-xs px-2 py-0 h-5">
                                Full
                              </Badge>
                            ) : availableSpots <= 5 ? (
                              <span className="text-xs text-amber-600">
                                Only {availableSpots} left!
                              </span>
                            ) : (
                              <span className="text-xs text-green-600">
                                Available
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    {/* <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                    <span>Green = Available</span>
                    <span className="ml-2 inline-block h-2 w-2 rounded-full bg-amber-500"></span>
                    <span>Yellow = Filling up</span>
                    <span className="ml-2 inline-block h-2 w-2 rounded-full bg-red-500"></span>
                    <span>Red = Full</span> */}
                    <span>homecare partner arrives in between given time slot</span>
                  </p>
                </div>

              </CardContent>
            </Card>

            <Card ref={addressRef} className="rounded-3xl border border-slate-200 bg-white shadow-xl">
              <CardHeader className="space-y-3">
                <CardTitle className="flex items-center gap-3 text-lg" style={{ color: BRAND.indigo }}>
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ border: `1px solid ${BRAND.indigo}33`, background: `${BRAND.indigo}12` }}
                  >
                    <MapPin className="h-5 w-5" style={{ color: BRAND.indigo }} />
                  </span>
                  Service address
                </CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  Select your apartment complex and add your apartment/house and floor number.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {addressMode === 'confirm' ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Saved address</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{options.address || 'No address found'}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setAddressMode('edit')}
                        className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition"
                        style={{ borderColor: `${BRAND.indigo}26` }}
                      >
                        Edit address
                      </Button>
                      <Badge
                        variant="outline"
                        className="rounded-full px-4 py-1 text-xs font-semibold"
                        style={{ border: `1px solid ${BRAND.indigo}33`, background: `${BRAND.indigo}0f`, color: BRAND.indigo }}
                      >
                        Confirmed
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Apartment complex</label>
                        {isLoadingApartments ? (
                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            Loading apartments…
                          </div>
                        ) : (
                          <Select value={selectedApartmentId} onValueChange={(value) => {
                            setSelectedApartmentId(value);
                            const apt = apartments.find((a) => a.id === value);
                            if (apt) {
                              setOptions((prev) => ({
                                ...prev,
                                apartmentId: value,
                                address: buildAddressFromApartment(apt, apartmentNumber, floorNumber)
                              }));
                            }
                          }}>
                            <SelectTrigger className="rounded-xl border border-slate-200 bg-white text-left text-slate-800">
                              <SelectValue placeholder="Select your apartment complex" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 border border-slate-200 bg-white text-slate-800">
                              {apartments.map((apt) => (
                                <SelectItem key={apt.id} value={apt.id} className="py-3">
                                  <div className="flex flex-col">
                                    <span className="font-medium">{apt.name}</span>
                                    <span className="text-xs text-slate-500">{apt.area}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Apartment/House number</label>
                        <Input
                          value={apartmentNumber}
                          onChange={(event) => {
                            const value = event.target.value;
                            setApartmentNumber(value);
                            const apt = apartments.find((a) => a.id === selectedApartmentId) || null;
                            if (apt) {
                              setOptions((prev) => ({ ...prev, address: buildAddressFromApartment(apt, value, floorNumber) }));
                            }
                          }}
                          placeholder="e.g., 203, Tower B"
                          className="rounded-xl border border-slate-200 bg-white text-slate-800"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Floor number</label>
                        <Input
                          value={floorNumber}
                          onChange={(event) => {
                            const value = event.target.value;
                            setFloorNumber(value);
                            const apt = apartments.find((a) => a.id === selectedApartmentId) || null;
                            if (apt) {
                              setOptions((prev) => ({ ...prev, address: buildAddressFromApartment(apt, apartmentNumber, value) }));
                            }
                          }}
                          placeholder="e.g., 2nd Floor"
                          className="rounded-xl border border-slate-200 bg-white text-slate-800"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        onClick={handleCancelAddressEdit}
                        className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition"
                        style={{ borderColor: `${BRAND.indigo}26` }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveAddress}
                        disabled={isSavingAddress}
                        className="rounded-full px-6 text-white hover:opacity-95 disabled:opacity-60"
                        style={{ background: INDIGO_STYLES.gradient }}
                      >
                        {isSavingAddress ? 'Saving…' : 'Save address'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div
              className="flex flex-col gap-4 rounded-3xl bg-white px-6 py-6 text-slate-700 md:flex-row md:items-center md:justify-between"
              style={{ border: `1px solid ${BRAND.indigo}26`, boxShadow: `0 20px 60px -35px ${BRAND.indigo}59` }}
            >
              <div className="text-sm text-slate-600">
                {options.selectedPlanDuration
                  ? `Billing summary: ₹${options.finalTotalPrice.toLocaleString()} for ${PLAN_DURATIONS.find((d) => d.id === options.selectedPlanDuration)?.label}`
                  : 'Select a plan duration to reveal your billing summary'}
              </div>
              <Button
                size="lg"
                onClick={handleNext}
                disabled={!options.address || !options.apartmentNumber || !options.floorNumber || !options.apartmentId}
                className="group flex items-center gap-3 rounded-full border-none px-8 py-6 text-base font-semibold text-white transition hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: INDIGO_STYLES.gradient, boxShadow: `0 25px 65px -30px ${BRAND.indigo}8c` }}
              >
                Proceed to review
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </Button>
            </div>
          </div>

          <aside className="space-y-6">
            <Card className="rounded-3xl border border-slate-200 bg-white shadow-xl">
              <CardHeader className="space-y-2">
                <CardTitle className="text-lg font-semibold text-slate-900">Live summary</CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  Reference snapshot of everything selected so far. Updates in real time.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 text-sm text-slate-700">
                <section className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <h3 className="text-sm font-semibold text-slate-900">Plan</h3>
                  <p className="text-base font-medium" style={{ color: BRAND.indigo }}>{selectedPlan.name}</p>
                  <p className="text-xs text-slate-500">{selectedPlan.description}</p>
                </section>
                <section className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <h3 className="text-sm font-semibold text-slate-900">Property</h3>
                  <p>{PROPERTY_TYPES.find((type) => type.id === options.propertyType)?.name}</p>
                  {options.bhkType && <p>{bhkConfigs.find((config) => config.id === options.bhkType)?.label}</p>}
                  {options.squareFeetLabel && <p className="text-xs text-slate-500">{options.squareFeetLabel}</p>}
                </section>
                <section className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <h3 className="text-sm font-semibold text-slate-900">Schedule</h3>
                  <p>{options.timeSlot || 'No slot selected'}</p>
                  <p>{options.startDate || 'Select start date'}</p>
                </section>
                <section className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <h3 className="text-sm font-semibold text-slate-900">Billing</h3>
                  {options.selectedPlanDuration ? (
                    <>
                      <p>Duration: {PLAN_DURATIONS.find((d) => d.id === options.selectedPlanDuration)?.label}</p>
                      <p className="text-lg font-bold" style={{ color: BRAND.indigo }}>₹{options.finalTotalPrice.toLocaleString()}</p>
                    </>
                  ) : (
                    <p>Select a duration to view billing.</p>
                  )}
                </section>
              </CardContent>
            </Card>
{/* 
            <Card className="rounded-3xl border border-slate-200 bg-white shadow-xl">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-lg text-slate-900">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ border: `1px solid ${BRAND.indigo}33`, background: `${BRAND.indigo}12` }}
                  >
                    <Sparkles className="h-5 w-5" style={{ color: BRAND.indigo }} />
                  </span>
                  Why Sweepro?
                </CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  Premium perks included with every subscription—no hidden extras.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <Check className="mt-1 h-4 w-4" style={{ color: BRAND.indigo }} />
                  <p>Dedicated relationship manager for rapid scheduling changes.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="mt-1 h-4 w-4" style={{ color: BRAND.indigo }} />
                  <p>Backup crew commitment within 6 hours if your primary pro needs a break.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="mt-1 h-4 w-4" style={{ color: BRAND.indigo }} />
                  <p>Hospital-grade sanitation supplies and eco-friendly essentials restocked automatically.</p>
                </div>
              </CardContent>
            </Card> */}
          </aside>
        </div>
      </div>

      {/* <div className="flex justify-center pt-10">
        <Button
          size="lg"
          onClick={() => navigate('/')}
          className="rounded-full border-none px-8 py-6 text-base font-semibold text-slate-900 transition hover:opacity-95"
          style={{ background: '#ffffff', boxShadow: `0 10px 30px -10px ${BRAND.indigo}4c` }}
        >
          Back to dashboard
        </Button>
      </div> */}
    </div>
  );
};

export default PaymentOptionsPage;