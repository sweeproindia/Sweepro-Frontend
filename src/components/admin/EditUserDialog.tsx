import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../../hooks/use-toast';
import { apiRequest, HttpMethod } from '../../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  timeSlot?: string;
  role: 'CUSTOMER' | 'MAID' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BLACKLISTED';
  createdAt: string;
}

interface EditUserDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const timeSlots = [
  '08:00-11:00',
  '09:00-12:00',
  '10:00-13:00',
  '11:00-14:00',
  '12:00-15:00',
  '13:00-16:00',
  '14:00-17:00',
  '15:00-18:00',
  '16:00-19:00',
  '17:00-20:00',
];

export default function EditUserDialog({ user, isOpen, onClose, onSuccess }: EditUserDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    timeSlot: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        timeSlot: user.timeSlot || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const response = await apiRequest(`/users/${user.id}/details`, {
        method: HttpMethod.PUT,
        body: formData,
        requiresAuth: true
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: 'User details updated successfully'
        });
        onSuccess();
        onClose();
      } else {
        throw new Error(response.message || 'Failed to update user details');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User Details</DialogTitle>
          <DialogDescription>
            Update customer information. All fields are optional.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter full name"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter complete address"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="timeSlot">Preferred Time Slot</Label>
            <Select 
              value={formData.timeSlot} 
              onValueChange={(value) => handleInputChange('timeSlot', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select preferred time slot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No preference</SelectItem>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Details'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
