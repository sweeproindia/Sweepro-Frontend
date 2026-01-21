import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Home,
  MapPin,
  Sparkles
} from 'lucide-react';

const BRAND = {
  indigo: '#1800ad',
  // keep all indigo shades derived from the single brand hex
  indigoTint: '#1800ad',
} as const;

const INDIGO_STYLES = {
  gradient: BRAND.indigo,
  softGradient: `linear-gradient(135deg, ${BRAND.indigo}1f 0%, ${BRAND.indigo}0d 100%)`,
  subtleSurface: `linear-gradient(135deg, ${BRAND.indigo}14 0%, ${BRAND.indigo}05 100%)`,
  surface: 'rgba(255,255,255,0.92)',
  border: `${BRAND.indigo}26`
} as const;

const FALLBACK_PLANS: Record<string, SubscriptionPlan> = {
  standard: {
    id: 'standard',
    name: 'Sweepro Touch',
    description: 'Essential care plan for medium-sized homes with consistent daily cleaning support.',
    duration: 'month',
    features: [
      'Utensil cleaning 3 days/week',
      'Floor sweeping & mopping 3 days/week',
      'Bathroom cleaning 2 times/month',
      'Professional cleaning kit provided once',
      'Fixed time slots for consistency',
      'Basic backup maid guarantee',
      'Standard customer support',
      '2 days free trial'
    ],
    serviceBreakdown: {
      utensilCleaning: '3 days/week',
      floorCleaning: '3 days/week (Sweeping & Mopping)',
      bathroomCleaning: '2 times/month',
      homeDusting: 'Not included',
      kitProvided: 'Professional kit provided once only',
      timings: 'Fixed slots',
      backupGuarantee: 'Basic backup maid guarantee',
      customerCare: 'Standard support included',
      bufferDays: 'No buffer days'
    },
    popular: true,
    finalPrice: 1499,
    sessionsPerWeek: 3,
    sessionsPerMonth: 12
  },
  premium: {
    id: 'premium',
    name: 'Sweepro Lux',
    description: 'Premium care plan with comprehensive daily cleaning and priority support for luxury homes.',
    duration: 'month',
    features: [
      'Utensil cleaning 6 days/week',
      'Floor sweeping & mopping 6 days/week',
      'Bathroom cleaning 4 times/month',
      'Home dusting 1 time/month',
      'Professional kit provided monthly',
      'Fixed time slots with flexibility',
      'Priority backup maid guarantee',
      'Priority customer care 24/7',
      'Buffer days included for flexibility',
      '2 days free trial'
    ],
    serviceBreakdown: {
      utensilCleaning: '6 days/week',
      floorCleaning: '6 days/week (Sweeping & Mopping)',
      bathroomCleaning: '4 times/month',
      homeDusting: '1 time/month',
      kitProvided: 'Professional kit provided every month',
      timings: 'Fixed slots with priority flexibility',
      backupGuarantee: 'Priority backup maid guarantee',
      customerCare: 'Priority customer care 24/7',
      bufferDays: 'Buffer days included'
    },
    popular: true,
    finalPrice: 2499,
    sessionsPerWeek: 6,
    sessionsPerMonth: 24
  }
};

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
}

type PropertyTypeId = 'apartment' | 'bungalow';
type BhkId = '2bhk' | '3bhk';
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
  latitude?: number;
  longitude?: number;
  pincode: string;
  locality: string;
  addressLine: string;
  city: string;
  state: string;
  landmark: string;
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
];

const DEFAULT_BHK_CONFIGS: BhkConfig[] = [
  {
    id: '2bhk',
    label: '2 BHK',
    sqftOptions: [
      {
        value: 1300,
        range: '1200 - 1400 sq ft',
        pricing: {
          '1month': 5898,
          '3month': 5681,
          '6month': 5463
        }
      },
      {
        value: 1501,
        range: '1401 - 1601 sq ft',
        pricing: {
          '1month': 6072,
          '3month': 5838,
          '6month': 5603
        }
      },
      {
        value: 1702,
        range: '1602 - 1802 sq ft',
        pricing: {
          '1month': 6247,
          '3month': 5995,
          '6month': 5742
        }
      },
      {
        value: 1903,
        range: '1803 - 2003 sq ft',
        pricing: {
          '1month': 6421,
          '3month': 6152,
          '6month': 5882
        }
      },
      {
        value: 2104,
        range: '2004 - 2204 sq ft',
        pricing: {
          '1month': 6596,
          '3month': 6309,
          '6month': 6021
        }
      },
      {
        value: 2305,
        range: '2205 - 2405 sq ft',
        pricing: {
          '1month': 6770,
          '3month': 6465,
          '6month': 6161
        }
      }
    ]
  },
  {
    id: '3bhk',
    label: '3 BHK',
    sqftOptions: [
      {
        value: 2506,
        range: '2406 - 2606 sq ft',
        pricing: {
          '1month': 6944,
          '3month': 6622,
          '6month': 6300
        }
      },
      {
        value: 2707,
        range: '2607 - 2807 sq ft',
        pricing: {
          '1month': 7119,
          '3month': 6779,
          '6month': 6440
        }
      },
      {
        value: 2908,
        range: '2808 - 3008 sq ft',
        pricing: {
          '1month': 7293,
          '3month': 6936,
          '6month': 6580
        }
      },
      {
        value: 3109,
        range: '3009 - 3209 sq ft',
        pricing: {
          '1month': 7468,
          '3month': 7093,
          '6month': 6719
        }
      },{
        value: 3109,
        range: '3010 - 3410 sq ft',
        pricing: {
          '1month': 7642,
          '3month': 7250,
          '6month': 6859
        }
      }
    ]
  }
];

const LUX_BHK_CONFIGS: BhkConfig[] = [
  {
    id: '2bhk',
    label: '2 BHK',
    sqftOptions: [
      {
        value: 1300,
        range: '1200 - 1400 sq ft',
        pricing: {
          '1month': 7350,
          '3month': 6950,
          '6month': 6550
        }
      },
      {
        value: 1501,
        range: '1401 - 1601 sq ft',
        pricing: {
          '1month': 7550,
          '3month': 7150,
          '6month': 6750
        }
      },
      {
        value: 1702,
        range: '1602 - 1802 sq ft',
        pricing: {
          '1month': 7750,
          '3month': 7350,
          '6month': 6950
        }
      },
      {
        value: 1903,
        range: '1803 - 2003 sq ft',
        pricing: {
          '1month': 7950,
          '3month': 7550,
          '6month': 7150
        }
      },
      {
        value: 2104,
        range: '2004 - 2204 sq ft',
        pricing: {
          '1month': 8150,
          '3month': 7750,
          '6month': 7350
        }
      },
      {
        value: 2305,
        range: '2205 - 2405 sq ft',
        pricing: {
          '1month': 8350,
          '3month': 7950,
          '6month': 7550
        }
      }
    ]
  },
  {
    id: '3bhk',
    label: '3 BHK',
    sqftOptions: [
      {
        value: 2506,
        range: '2406 - 2606 sq ft',
        pricing: {
          '1month': 8550,
          '3month': 8150,
          '6month': 7750
        }
      },
      {
        value: 2707,
        range: '2607 - 2807 sq ft',
        pricing: {
          '1month': 8750,
          '3month': 8350,
          '6month': 7950
        }
      },
      {
        value: 2908,
        range: '2808 - 3008 sq ft',
        pricing: {
          '1month': 8950,
          '3month': 8550,
          '6month': 8150
        }
      },
      {
        value: 3109,
        range: '3009 - 3209 sq ft',
        pricing: {
          '1month': 9150,
          '3month': 8750,
          '6month': 8350
        }
      },
      {
        value: 3310,
        range: '3210 - 3410 sq ft',
        pricing: {
          '1month': 9350,
          '3month': 8950,
          '6month': 8550
        }
      },
      {
        value: 3458,
        range: '3411 - 3505 sq ft',
        pricing: {
          '1month': 9550,
          '3month': 9150,
          '6month': 8750
        }
      }
    ]
  }
];

const TIME_SLOTS = [
  '06:00 - 08:00',
  '08:00 - 10:00',
  '10:00 - 12:00',
  '12:00 - 14:00',
  '14:00 - 16:00',
  '16:00 - 18:00'
];

const PaymentOptionsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useUser();

  const mapContainerIdRef = useRef(`payment-map-${Date.now()}`);

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [options, setOptions] = useState<ServiceOptions>({
    timeSlot: '',
    startDate: '',
    address: '',
    latitude: undefined,
    longitude: undefined,
    pincode: '',
    locality: '',
    addressLine: '',
    city: '',
    state: '',
    landmark: '',
    propertyType: 'apartment',
    bhkType: null,
    squareFeet: 0,
    squareFeetLabel: undefined,
    selectedPlanDuration: null,
    finalTotalPrice: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [tempLat, setTempLat] = useState('');
  const [tempLng, setTempLng] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const isLuxPlan = selectedPlan?.id === 'premium';

  useEffect(() => {
    const savedPlan = location.state?.selectedPlan as SubscriptionPlan | undefined;
    const savedOptions = location.state?.selectedOptions as ServiceOptions | undefined;

    if (savedPlan) {
      setSelectedPlan(savedPlan);
      if (savedOptions) {
        setOptions(savedOptions);
      }
      saveToStorage(STORAGE_KEYS.SELECTED_PLAN, savedPlan);
      if (savedOptions) {
        saveToStorage(STORAGE_KEYS.SERVICE_OPTIONS, savedOptions);
      }
      setIsLoading(false);
      return;
    }

    const storedPlan = getFromStorage(STORAGE_KEYS.SELECTED_PLAN) as SubscriptionPlan | null;
    const storedOptions = getFromStorage(STORAGE_KEYS.SERVICE_OPTIONS) as ServiceOptions | null;

    if (storedPlan) {
      setSelectedPlan(storedPlan);
      if (storedOptions) {
        setOptions(storedOptions);
      }
      setIsLoading(false);
      return;
    }

    const searchParams = new URLSearchParams(location.search);
    const planIdFromQuery = searchParams.get('planId') ?? 'standard';
    const fallbackPlan = FALLBACK_PLANS[planIdFromQuery] ?? FALLBACK_PLANS.standard;

    setSelectedPlan(fallbackPlan);
    saveToStorage(STORAGE_KEYS.SELECTED_PLAN, fallbackPlan);
    setIsLoading(false);
  }, [location.search, location.state]);

  useEffect(() => {
    if (!selectedPlan) return;

    setOptions((prev) => {
      const nextOptions = { ...prev };

      // Default property configuration for Lux plan
      if (selectedPlan.id === 'premium') {
        nextOptions.propertyType = 'apartment';
        if (!nextOptions.bhkType || !['2bhk', '3bhk'].includes(nextOptions.bhkType)) {
          nextOptions.bhkType = '2bhk';
        }
      } else if (!nextOptions.bhkType) {
        nextOptions.bhkType = '2bhk';
      }

      // Default start date to tomorrow if empty
      if (!nextOptions.startDate) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        nextOptions.startDate = tomorrow.toISOString().split('T')[0];
      }

      if (!nextOptions.timeSlot) {
        nextOptions.timeSlot = TIME_SLOTS[2];
      }

      return nextOptions;
    });
  }, [selectedPlan]);

  const bhkConfigs = useMemo<BhkConfig[]>(() => {
    if (!selectedPlan) return [];
    if (selectedPlan.id === 'premium' && options.propertyType === 'apartment') {
      return LUX_BHK_CONFIGS;
    }
    return DEFAULT_BHK_CONFIGS;
  }, [options.propertyType, selectedPlan]);

  const selectedBhkConfig = useMemo(() => {
    return bhkConfigs.find((config) => config.id === options.bhkType) ?? bhkConfigs[0] ?? null;
  }, [bhkConfigs, options.bhkType]);

  const selectedSqftOption = useMemo(() => {
    if (!selectedBhkConfig) return null;
    return (
      selectedBhkConfig.sqftOptions.find((opt) => opt.value === options.squareFeet) ??
      selectedBhkConfig.sqftOptions[0] ??
      null
    );
  }, [options.squareFeet, selectedBhkConfig]);

  useEffect(() => {
    if (!selectedBhkConfig) return;

    setOptions((prev) => {
      const next = { ...prev };
      if (!prev.bhkType || prev.bhkType !== selectedBhkConfig.id) {
        next.bhkType = selectedBhkConfig.id;
      }

      if (!selectedSqftOption) {
        const defaultSqft = selectedBhkConfig.sqftOptions[0];
        next.squareFeet = defaultSqft.value;
        next.squareFeetLabel = defaultSqft.range;
      } else {
        next.squareFeet = selectedSqftOption.value;
        next.squareFeetLabel = selectedSqftOption.range;
      }

      return next;
    });
  }, [selectedBhkConfig, selectedSqftOption]);

  const saveToStorage = (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn('Failed to write to storage', err);
    }
  };

  const getFromStorage = (key: string) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : null;
    } catch (err) {
      console.warn('Failed to read from storage', err);
      return null;
    }
  };

  const calculatePlanPrice = (duration: PlanDuration): PlanPriceBreakdown => {
    if (selectedSqftOption) {
      const baseMonthly = selectedSqftOption.pricing['1month'];
      const monthlyBaseCost = selectedSqftOption.pricing[duration.id];
      const totalBeforeDiscount = Math.round(baseMonthly * duration.multiplier);
      const discountAmount = Math.max(baseMonthly - monthlyBaseCost, 0);
      const discountPercent = baseMonthly > 0 ? Math.max(Math.round((discountAmount / baseMonthly) * 100), 0) : 0;
      const finalTotal = Math.round(monthlyBaseCost * duration.multiplier);

      return {
        monthlyBaseCost,
        propertyBaseCost: 0,
        totalBeforeDiscount,
        discountPercent,
        discountAmount,
        monthlyAfterDiscount: monthlyBaseCost,
        finalTotal
      };
    }

    const selectedProperty = PROPERTY_TYPES.find((type) => type.id === options.propertyType);
    const basePlanPrice = selectedPlan?.finalPrice ?? selectedPlan?.price ?? 0;
    const propertyRate = selectedProperty?.pricePerSqFt ?? 0;
    const propertyBaseCost = Math.round(propertyRate * (selectedSqftOption?.value ?? 0) * 0.1);
    const monthlyBaseCost = Math.round(basePlanPrice + propertyBaseCost);
    const discountPercent = duration.discount ?? 0;
    const discountAmount = Math.round((monthlyBaseCost * discountPercent) / 100);
    const monthlyAfterDiscount = monthlyBaseCost - discountAmount;
    const finalTotal = Math.round(monthlyAfterDiscount * duration.multiplier);

    return {
      monthlyBaseCost,
      propertyBaseCost,
      totalBeforeDiscount: monthlyBaseCost,
      discountPercent,
      discountAmount,
      monthlyAfterDiscount,
      finalTotal
    };
  };

  useEffect(() => {
    if (!options.selectedPlanDuration) return;
    const duration = PLAN_DURATIONS.find((d) => d.id === options.selectedPlanDuration);
    if (!duration) return;

    const pricing = calculatePlanPrice(duration);
    setOptions((prev) => {
      if (prev.finalTotalPrice === pricing.finalTotal) {
        return prev;
      }
      const next = { ...prev, finalTotalPrice: pricing.finalTotal };
      saveToStorage(STORAGE_KEYS.SERVICE_OPTIONS, next);
      return next;
    });
  }, [options.selectedPlanDuration, options.propertyType, options.squareFeet, selectedPlan, selectedSqftOption]);

  const handlePropertyTypeSelect = (propertyType: PropertyTypeId) => {
    const selectedType = PROPERTY_TYPES.find((type) => type.id === propertyType);
    if (selectedType?.disabled) {
      return;
    }
    setOptions((prev) => ({
      ...prev,
      propertyType,
      bhkType: null,
      squareFeet: 0,
      squareFeetLabel: undefined
    }));
  };

  const handleBhkSelect = (bhkId: BhkId) => {
    setOptions((prev) => ({
      ...prev,
      bhkType: bhkId,
      squareFeet: 0,
      squareFeetLabel: undefined
    }));
  };

  const handleSqftSelect = (value: string) => {
    const sqftValue = Number(value);
    const label = selectedBhkConfig?.sqftOptions.find((opt) => opt.value === sqftValue)?.range;
    setOptions((prev) => ({
      ...prev,
      squareFeet: sqftValue,
      squareFeetLabel: label
    }));
  };

  const handlePlanDurationSelect = (durationId: PlanDurationId) => {
    const duration = PLAN_DURATIONS.find((plan) => plan.id === durationId);
    if (!duration) return;

    const pricing = calculatePlanPrice(duration);
    setOptions((prev) => {
      const next = {
        ...prev,
        selectedPlanDuration: durationId,
        finalTotalPrice: pricing.finalTotal
      };
      saveToStorage(STORAGE_KEYS.SERVICE_OPTIONS, next);
      return next;
    });
  };

  const handleOptionChange = (field: keyof ServiceOptions, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Location unavailable',
        description: 'Your browser does not support geolocation.',
        variant: 'destructive'
      });
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        setOptions((prev) => ({
          ...prev,
          latitude,
          longitude
        }));
        setTempLat(latitude.toFixed(6));
        setTempLng(longitude.toFixed(6));
      },
      (err) => {
        setIsLocating(false);
        setLocationError(err.message);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleMapSave = () => {
    const lat = Number(tempLat);
    const lng = Number(tempLng);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      toast({
        title: 'Invalid coordinates',
        description: 'Please provide valid latitude and longitude values.',
        variant: 'destructive'
      });
      return;
    }

    setOptions((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));

    setIsMapOpen(false);
  };

  const handleNext = () => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please sign in to continue.',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    if (!selectedPlan) {
      toast({
        title: 'Plan not found',
        description: 'Please choose a subscription plan again.',
        variant: 'destructive'
      });
      navigate('/subscription');
      return;
    }

    if (!options.selectedPlanDuration) {
      toast({
        title: 'Select plan duration',
        description: 'Choose a billing duration to proceed.',
        variant: 'destructive'
      });
      return;
    }

    if (!options.bhkType) {
      toast({
        title: 'Select property configuration',
        description: 'Choose a BHK configuration to continue.',
        variant: 'destructive'
      });
      return;
    }

    if (!options.squareFeet) {
      toast({
        title: 'Select size range',
        description: 'Choose the size range for your property.',
        variant: 'destructive'
      });
      return;
    }

    if (!options.addressLine || !options.city || !options.pincode) {
      toast({
        title: 'Complete address details',
        description: 'Please provide address, city and pincode to continue.',
        variant: 'destructive'
      });
      return;
    }

    const duration = PLAN_DURATIONS.find((d) => d.id === options.selectedPlanDuration)!;
    const pricing = calculatePlanPrice(duration);

    const optionsToPersist: ServiceOptions = {
      ...options,
      finalTotalPrice: pricing.finalTotal,
      squareFeetLabel: options.squareFeetLabel ?? selectedSqftOption?.range
    };

    saveToStorage(STORAGE_KEYS.SELECTED_PLAN, selectedPlan);
    saveToStorage(STORAGE_KEYS.SERVICE_OPTIONS, optionsToPersist);

    navigate('/review-payment', {
      state: {
        selectedPlan,
        selectedOptions: optionsToPersist
      }
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleDashboard=()=>{
    navigate('/');
  }

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
        {locationError && <p className="text-sm" style={{ color: BRAND.indigo }}>{locationError}</p>}
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
            onClick={handleBack}
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
          <Badge
            className="rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em]"
            style={{
              border: `1px solid ${BRAND.indigo}33`,
              background: `${BRAND.indigo}12`,
              color: BRAND.indigo
            }}
          >
            {selectedPlan.name}
          </Badge>
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

            <Card className="rounded-3xl border bg-white shadow-xl" style={{ borderColor: `${BRAND.indigo}26` }}>
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
                    <Sparkles className="mt-0.5 h-4 w-4" style={{ color: BRAND.indigo }} /> Sweepro Lux apartment plans are calibrated for premium 2 and 3 BHK layouts. Choose from curated size ranges below for tailored staffing.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-slate-200 bg-white shadow-xl">
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
                            background: isActive
                              ? `linear-gradient(135deg, ${BRAND.indigo}14 0%, ${BRAND.indigo}05 100%)`
                              : '#ffffff',
                            boxShadow: isActive
                              ? `0 25px 60px -35px ${BRAND.indigo}59`
                              : undefined
                          }}
                        >
                          <div>
                            <p className="text-base font-semibold" style={{ color: BRAND.indigo }}>
                              {option.range}
                            </p>
                            <p className="text-xs uppercase tracking-[0.35em]" style={{ color: 'rgba(32,30,69,0.45)' }}>
                              Approx. {option.value} sq ft
                            </p>
                          </div>
                          <div className="flex flex-col gap-1 text-sm">
                            <span className="text-base font-semibold" style={{ color: BRAND.indigo }}>
                              ₹{option.pricing['1month'].toLocaleString()}{' '}
                              <span className="text-xs font-medium" style={{ color: `${BRAND.indigo}c2` }}>/ month</span>
                            </span>
                            <Badge
                              variant="outline"
                              className="w-fit text-xs"
                              style={{
                                border: `1px solid ${BRAND.indigo}55`,
                                background: `${BRAND.indigo}0f`,
                                color: BRAND.indigo
                              }}
                            >
                              3 Months ₹{option.pricing['3month'].toLocaleString()}
                            </Badge>
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

            <Card className="rounded-3xl border border-slate-200 bg-white shadow-xl">
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
                          <p className="text-2xl font-semibold" style={{ color: BRAND.indigo }}>₹{pricing.finalTotal.toLocaleString()}</p>
                          <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
                            ₹{monthly.toLocaleString()} per month
                          </p>
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

                {options.selectedPlanDuration && (
                  <div
                    className="rounded-2xl px-5 py-4 text-sm text-slate-700 shadow-inner"
                    style={{ border: `1px solid ${BRAND.indigo}26`, background: `${BRAND.indigo}0d` }}
                  >
                    <div className="flex items-center justify-between">
                      <span>Plan subtotal ({PLAN_DURATIONS.find((d) => d.id === options.selectedPlanDuration)?.label}):</span>
                      <span className="font-semibold text-slate-900">₹{options.finalTotalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-slate-200 bg-white shadow-xl">
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
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Start date</label>
                    <Input
                      type="date"
                      value={options.startDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(event) => handleOptionChange('startDate', event.target.value)}
                      className="rounded-xl border border-slate-200 bg-white text-slate-800"
                      style={{
                        outline: 'none',
                        boxShadow: 'none'
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Time slot</label>
                    <Select value={options.timeSlot} onValueChange={(value) => handleOptionChange('timeSlot', value)}>
                      <SelectTrigger className="rounded-xl border border-slate-200 bg-white text-left text-slate-800">
                        <SelectValue placeholder="Pick a slot" />
                      </SelectTrigger>
                      <SelectContent className="border border-slate-200 bg-white text-slate-800">
                        {TIME_SLOTS.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-slate-200 bg-white shadow-xl">
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
                  Drop the exact location. Autofill from GPS or manually tune the address so our crew arrives precisely.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={handleUseCurrentLocation}
                    disabled={isLocating}
                    className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition disabled:opacity-60"
                    style={{ borderColor: `${BRAND.indigo}26` }}
                  >
                    {isLocating ? 'Locating…' : 'Use current location'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setIsMapOpen(true)}
                    className="rounded-full border px-5 py-2 text-sm font-semibold text-white"
                    style={{
                      borderColor: `${BRAND.indigo}33`,
                      background: INDIGO_STYLES.gradient,
                      boxShadow: `0 18px 40px -22px ${BRAND.indigo}73`
                    }}
                  >
                    Set on map
                  </Button>
                  {options.latitude && options.longitude && (
                    <Badge
                      variant="outline"
                      className="rounded-full px-4 py-1 text-xs font-semibold"
                      style={{ border: `1px solid ${BRAND.indigo}33`, background: `${BRAND.indigo}0f`, color: BRAND.indigo }}
                    >
                      GPS: {options.latitude.toFixed(4)}, {options.longitude.toFixed(4)}
                    </Badge>
                  )}
                </div>

                {locationError && <p className="text-sm font-medium" style={{ color: BRAND.indigo }}>{locationError}</p>}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Pincode</label>
                    <Input
                      value={options.pincode}
                      onChange={(event) => handleOptionChange('pincode', event.target.value)}
                      placeholder="110001"
                      className="rounded-xl border border-slate-200 bg-white text-slate-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Locality</label>
                    <Input
                      value={options.locality}
                      onChange={(event) => handleOptionChange('locality', event.target.value)}
                      placeholder="Area / Locality"
                      className="rounded-xl border border-slate-200 bg-white text-slate-800"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Address (area & street)</label>
                    <Input
                      value={options.addressLine}
                      onChange={(event) => handleOptionChange('addressLine', event.target.value)}
                      placeholder="House no., street"
                      className="rounded-xl border border-slate-200 bg-white text-slate-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">City / Town</label>
                    <Input
                      value={options.city}
                      onChange={(event) => handleOptionChange('city', event.target.value)}
                      placeholder="City"
                      className="rounded-xl border border-slate-200 bg-white text-slate-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">State</label>
                    <Input
                      value={options.state}
                      onChange={(event) => handleOptionChange('state', event.target.value)}
                      placeholder="State"
                      className="rounded-xl border border-slate-200 bg-white text-slate-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Landmark (optional)</label>
                    <Input
                      value={options.landmark}
                      onChange={(event) => handleOptionChange('landmark', event.target.value)}
                      placeholder="Nearby landmark"
                      className="rounded-xl border border-slate-200 bg-white text-slate-800"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Additional address notes</label>
                    <Input
                      value={options.address}
                      onChange={(event) => handleOptionChange('address', event.target.value)}
                      placeholder="Apartment, block, other instructions"
                      className="rounded-xl border border-slate-200 bg-white text-slate-800"
                    />
                  </div>
                </div>
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
                disabled={!options.selectedPlanDuration}
                className="group flex items-center gap-3 rounded-full border-none px-8 py-6 text-base font-semibold text-white transition hover:opacity-95 disabled:opacity-60"
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

            <Card className="rounded-3xl border border-slate-200 bg-white shadow-xl">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-lg text-slate-900">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ border: `1px solid ${BRAND.indigo}33`, background: `${BRAND.indigo}12` }}
                  >
                    <Sparkles className="h-5 w-5" style={{ color: BRAND.indigo }} />
                  </span>
                  Why Sweep Pro?
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
            </Card>
          </aside>
        </div>
      </div>

      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogContent
          className="sm:max-w-xl rounded-3xl border border-slate-200 bg-white text-slate-900"
          style={{ boxShadow: `0 45px 90px -40px ${BRAND.indigo}47` }}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900">Set location on map</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex h-64 w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-100 text-sm text-slate-500">
              Map preview placeholder (enable integration)
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Latitude</label>
                <Input
                  value={tempLat}
                  onChange={(event) => setTempLat(event.target.value)}
                  placeholder="17.3850"
                  className="rounded-xl border border-slate-200 bg-white text-slate-800"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Longitude</label>
                <Input
                  value={tempLng}
                  onChange={(event) => setTempLng(event.target.value)}
                  placeholder="78.4867"
                  className="rounded-xl border border-slate-200 bg-white text-slate-800"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsMapOpen(false)} className="rounded-full text-slate-600 hover:bg-slate-100">
              Cancel
            </Button>
            <Button
              onClick={handleMapSave}
              className="rounded-full px-6 text-white hover:opacity-95"
              style={{ background: INDIGO_STYLES.gradient }}
            >
              Save location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentOptionsPage;