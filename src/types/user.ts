export type UserStatus = 'active' | 'inactive' | 'pending';

export interface User {
  id: string;
  email: string;
  name: string;
  status: UserStatus;
  subscription?: Subscription;
  profile?: UserProfile;
}

export interface Subscription {
  id: string;
  planName: string;
  planType: 'Basic' | 'Standard' | 'Premium';
  price: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  autoRenewal: boolean;
  nextBillingDate: string;
}

export interface UserProfile {
  name: string;
  location: string;
  pincode: string;
  services: string[];
  phoneNumber?: string;
}

export interface Plan {
  id: string;
  name: string;
  type: 'Basic' | 'Standard' | 'Premium';
  price: number;
  description: string;
  features: string[];
  visitsPerWeek: number;
  hoursPerVisit: number;
}

export interface PaymentDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
} 