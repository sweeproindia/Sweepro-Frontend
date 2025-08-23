import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, Calendar, Clock, MapPin } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { saveServiceAddress, getServiceAddress, ServiceAddress } from '@/services/addressService';
import { AuthService } from '@/services/authService';

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
  timeSlot: string; // e.g., "09:00 AM"
  startDate: string; // yyyy-mm-dd
  frequency: string; // now fixed to 'daily'
  address: string;
  latitude?: number;
  longitude?: number;
  pincode: string;
  locality: string;
  addressLine: string;
  city: string;
  state: string;
  landmark: string;
}

// Fixed frequency configuration
const DAILY_FREQUENCY = { id: 'daily', name: 'Daily', description: 'Service every day', price: 0 } as const;

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
    for (let i = 0; i <= 20; i++) { // 11 hours * 2 slots = 22 entries (08:00 -> 18:00)
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
    landmark: ''
  });
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
  const [savedAddress, setSavedAddress] = useState<Pick<ServiceOptions, 'pincode' | 'locality' | 'addressLine' | 'city' | 'state' | 'landmark' | 'address' | 'latitude' | 'longitude'>>();
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  useEffect(() => {
    if (!selectedPlan) {
      navigate('/subscription');
      return;
    }
  }, [selectedPlan, navigate]);

  useEffect(() => {
    // Initialize temp coords from saved options when dialog opens
    if (isMapOpen) {
      setTempLat(options.latitude !== undefined ? String(options.latitude) : '');
      setTempLng(options.longitude !== undefined ? String(options.longitude) : '');
      setCoordError(null);
      // Delay slightly to ensure dialog content has been laid out
      setTimeout(() => initMap(), 50);
    } else {
      destroyMap();
    }
  }, [isMapOpen]);

  // Prefill from any previously saved service address (local storage)
  useEffect(() => {
    try {
      const saved = getServiceAddress();
      if (saved) {
        setOptions(prev => ({ ...prev, ...saved }));
        setSavedAddress(saved);
      }
    } catch {}
  }, []);

  useEffect(() => {
    // Auto-detect like Zomato: try once on mount if nothing set yet
    if (options.latitude === undefined && options.longitude === undefined && !options.address) {
      detectLocationAuto();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!selectedPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center text-gray-900">
          <h1 className="text-2xl font-bold mb-4">No plan selected</h1>
          <Button onClick={() => navigate('/subscription')}>
            Back to Plans
          </Button>
        </div>
      </div>
    );
  }

  const handleOptionChange = (key: keyof ServiceOptions, value: string | number) => {
    setOptions(prev => ({ ...prev, [key]: value as any }));
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

  const geocodeAddressToCoords = async (addr: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(addr)}`);
      if (!resp.ok) return null;
      const data = await resp.json();
      if (Array.isArray(data) && data.length > 0) {
        return { lat: Number(data[0].lat), lng: Number(data[0].lon) };
      }
      return null;
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
    // Validate required fields
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

      // Persist locally for later use during subscription/booking
      saveServiceAddress(addressData);

      // Try to persist on backend as well (non-blocking for now)
      try {
        await AuthService.updateUserAddress(addressData);
      } catch (e: any) {
        // If backend fails, we still keep local copy
        console.warn('Backend address update failed:', e?.message || e);
      }

      // Also update simple address string on the user for display elsewhere
      if (options.address) {
        updateUser({ address: options.address });
      }

      // Update local state for immediate UI feedback
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

  const getFrequencyPrice = () => {
    return DAILY_FREQUENCY.price;
  };

  const totalPrice = selectedPlan.price + getFrequencyPrice();

  const handleNext = () => {
    // Persist latest address/options to ensure availability on the next step
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
    } catch {}

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

  async function loadGoogleMaps(): Promise<any> {
    if (!googleMapsKey) return null;
    if ((window as any).google && (window as any).google.maps) return (window as any).google;
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsKey}`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps'));
      document.body.appendChild(script);
    });
    return (window as any).google;
  }

  async function loadLeaflet(): Promise<any> {
    if ((window as any).L) return (window as any).L;
    await new Promise<void>((resolve) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.onload = () => resolve();
      document.head.appendChild(link);
    });
    await new Promise<void>((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
    return (window as any).L;
  }

  async function waitForContainer(maxTries = 20, intervalMs = 50): Promise<HTMLElement | null> {
    for (let i = 0; i < maxTries; i++) {
      const el = document.getElementById(mapContainerIdRef.current) as HTMLElement | null;
      if (el) return el;
      await new Promise(r => setTimeout(r, intervalMs));
    }
    return null;
  }

  async function initMap() {
    const container = await waitForContainer();
    if (!container) return;
    destroyMap();

    const desiredCenter = async (): Promise<{ lat: number; lng: number }> => {
      if (options.latitude !== undefined && options.longitude !== undefined) return { lat: options.latitude, lng: options.longitude };
      if (options.address) {
        const gc = await geocodeAddressToCoords(options.address);
        if (gc) return gc;
      }
      return { lat: 17.385, lng: 78.4867 };
    };

    const center = await desiredCenter();

    if (prefersGoogle) {
      try {
        const google = await loadGoogleMaps();
        if (google && google.maps) {
          const map = new google.maps.Map(container, { center, zoom: 15, mapTypeControl: false, streetViewControl: false });
          const marker = new google.maps.Marker({ position: center, map, draggable: true, icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' });
          marker.addListener('dragend', () => {
            const pos = marker.getPosition();
            if (!pos) return;
            setTempLat(String(pos.lat()));
            setTempLng(String(pos.lng()));
          });
          map.addListener('click', (e: any) => {
            marker.setPosition(e.latLng);
            setTempLat(String(e.latLng.lat()));
            setTempLng(String(e.latLng.lng()));
          });
          setTempLat(String(center.lat));
          setTempLng(String(center.lng));
          mapRef.current = map;
          markerRef.current = marker;
          mapTypeRef.current = 'google';
          setTimeout(() => {
            google.maps.event.trigger(map, 'resize');
            map.setCenter(center);
          }, 100);
          return;
        }
      } catch (e) {
        // fall back to leaflet
      }
    }

    const L = await loadLeaflet();
    const map = L.map(container).setView([center.lat, center.lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    const redIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    const marker = L.marker([center.lat, center.lng], { draggable: true, icon: redIcon }).addTo(map);
    marker.on('dragend', () => {
      const ll = marker.getLatLng();
      setTempLat(String(ll.lat));
      setTempLng(String(ll.lng));
    });
    map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      setTempLat(String(lat));
      setTempLng(String(lng));
    });
    setTempLat(String(center.lat));
    setTempLng(String(center.lng));
    mapRef.current = map;
    markerRef.current = marker;
    mapTypeRef.current = 'leaflet';
    setTimeout(() => {
      if (map && map.invalidateSize) map.invalidateSize();
    }, 100);
  }

  function destroyMap() {
    if (mapTypeRef.current === 'leaflet') {
      const map = mapRef.current;
      if (map && map.remove) {
        map.off();
        map.remove();
      }
    }
    mapRef.current = null;
    markerRef.current = null;
    mapTypeRef.current = null;
  }

  return (<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
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
            Choose your preferred time, date, frequency, and service location
          </p>
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
                {autoDetecting && (
                  <div className="mt-2 text-sm text-blue-600">Detecting your location…</div>
                )}
                {!autoDetecting && autoDetected && (
                  <div className="mt-2 text-sm text-green-700">Location auto-detected</div>
                )}
                {accuracyMeters !== null && (
                  <div className="mt-1 text-xs text-gray-500">Estimated accuracy: ±{Math.round(accuracyMeters)} m</div>
                )}
              </div>
              <div className="text-right">
                {selectedPlan.originalPrice && selectedPlan.discount ? (
                  <div>
                    <p className="text-lg text-gray-500 line-through">₹{selectedPlan.originalPrice}</p>
                    <p className="text-2xl font-bold text-blue-600">₹{selectedPlan.price}</p>
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      Save {selectedPlan.discount}%
                    </Badge>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-blue-600">₹{selectedPlan.price}</p>
                )}
                <p className="text-gray-500">per {selectedPlan.duration}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Time & Date */}
          <div className="space-y-6">
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
          </div>

          {/* Right Column - Frequency (fixed Daily) and Price */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                  Service Frequency
                </CardTitle>
                <CardDescription>Frequency is fixed to daily</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-xl border-2 border-purple-500 bg-purple-50 text-purple-700 font-semibold flex items-center justify-between">
                  <span>{DAILY_FREQUENCY.name}</span>
                  <Badge className="bg-green-500 text-white">No extra charge</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Estimated Monthly Cost</p>
                  <p className="text-3xl font-bold text-blue-600">₹{totalPrice.toLocaleString()}</p>
                  <div className="mt-3 text-sm text-gray-600">
                    <p>Service Duration: {selectedPlan.serviceHours}</p>
                    <p>Coverage: {selectedPlan.coverage}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Full-width Delivery Address (two-column form) */}
        <Card className="mt-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-red-600" />
              Delivery Address
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
        <div className="text-center mt-12">
          <Button 
            className="px-8 py-4 text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={handleNext}
          >
            Next: Review & Payment
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <p className="text-sm text-gray-500 mt-3">
            Review your selections on the next page before confirming
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
    </div>);
}