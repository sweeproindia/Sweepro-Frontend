import { Plan } from '@/types/user';

export const availablePlans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    type: 'Basic',
    price: 1999,
    description: 'Perfect for small apartments',
    features: [
      '2 visits per week',
      '2-3 hours per visit',
      'Basic cleaning supplies',
      'Email support',
      'Standard cleaning',
      'Kitchen cleaning',
      'Bathroom cleaning',
      'Living area cleaning'
    ],
    visitsPerWeek: 2,
    hoursPerVisit: 2.5
  },
  {
    id: 'standard',
    name: 'Standard',
    type: 'Standard',
    price: 3499,
    description: 'Most popular for families',
    features: [
      '5 visits per week',
      '3-4 hours per visit',
      'Premium cleaning supplies',
      'Priority support',
      'Deep cleaning included',
      'Laundry and ironing',
      'Kitchen organization',
      'Rescheduling flexibility',
      'Window cleaning',
      'Furniture dusting'
    ],
    visitsPerWeek: 5,
    hoursPerVisit: 3.5
  },
  {
    id: 'premium',
    name: 'Premium',
    type: 'Premium',
    price: 5999,
    description: 'Complete home management',
    features: [
      'Daily visits',
      '4-5 hours per visit',
      'Luxury cleaning products',
      '24/7 support',
      'Complete home management',
      'Laundry and ironing',
      'Kitchen organization',
      'Flexible scheduling',
      'Window and glass cleaning',
      'Furniture and upholstery cleaning',
      'Special occasion cleaning',
      'Pet-friendly cleaning'
    ],
    visitsPerWeek: 7,
    hoursPerVisit: 4.5
  }
]; 