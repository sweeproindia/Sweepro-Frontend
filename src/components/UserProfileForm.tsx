import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { UserProfile } from '@/types/user';

interface UserProfileFormProps {
  onSubmit: (profile: UserProfile) => void;
}

const availableServices = [
  'Regular Cleaning',
  'Deep Cleaning',
  'Laundry',
  'Ironing',
  'Kitchen Organization',
  'Window Cleaning',
  'Furniture Cleaning',
  'Pet-friendly Cleaning'
];

export const UserProfileForm: React.FC<UserProfileFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    pincode: '',
    phoneNumber: '',
    services: [] as string[]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.location && formData.pincode) {
      onSubmit(formData as UserProfile);
    }
  };

  const isFormValid = formData.name && formData.location && formData.pincode;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            placeholder="Enter your phone number"
            type="tel"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Enter your city/location"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pincode">Pincode *</Label>
          <Input
            id="pincode"
            name="pincode"
            value={formData.pincode}
            onChange={handleInputChange}
            placeholder="Enter your pincode"
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label>Select Services (Optional)</Label>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableServices.map((service) => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    id={service}
                    checked={formData.services.includes(service)}
                    onCheckedChange={() => handleServiceToggle(service)}
                  />
                  <Label htmlFor={service} className="text-sm cursor-pointer">
                    {service}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={!isFormValid}>
          Continue to Payment
        </Button>
      </div>
    </form>
  );
}; 