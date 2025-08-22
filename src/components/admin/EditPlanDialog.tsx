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
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../../hooks/use-toast';
import { apiRequest, HttpMethod } from '../../services/api';
import { SubscriptionPlan } from '../../services/subscriptionService';

interface Service {
  id: string;
  name: string;
}

interface EditPlanDialogProps {
  plan: SubscriptionPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditPlanDialog({ plan, isOpen, onClose, onSuccess }: EditPlanDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: 0,
    finalPrice: 0,
    discountPercent: 0,
    duration: 1,
    sessionsPerWeek: 1,
    sessionsPerMonth: 4,
    isActive: true,
    isPopular: false,
    serviceId: ''
  });

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        description: plan.description || '',
        basePrice: plan.basePrice,
        finalPrice: plan.finalPrice,
        discountPercent: plan.discountPercent || 0,
        duration: plan.duration,
        sessionsPerWeek: plan.sessionsPerWeek || 1,
        sessionsPerMonth: plan.sessionsPerMonth || 4,
        isActive: plan.isActive,
        isPopular: plan.isPopular || false,
        serviceId: plan.service?.id || ''
      });
    }
  }, [plan]);

  useEffect(() => {
    if (isOpen) {
      fetchServices();
    }
  }, [isOpen]);

  const fetchServices = async () => {
    try {
      const response = await apiRequest('/services', {
        method: HttpMethod.GET,
        requiresAuth: true
      });
      
      if (response.success) {
        setServices(response.data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan) return;

    setLoading(true);
    try {
      const response = await apiRequest(`/subscriptions/admin/plans/${plan.id}`, {
        method: HttpMethod.PUT,
        body: formData,
        requiresAuth: true
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Plan updated successfully'
        });
        onSuccess();
        onClose();
      } else {
        throw new Error(response.message || 'Failed to update plan');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update plan',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateDiscount = () => {
    if (formData.basePrice > 0 && formData.finalPrice > 0) {
      const discount = ((formData.basePrice - formData.finalPrice) / formData.basePrice) * 100;
      return Math.max(0, Math.round(discount));
    }
    return 0;
  };

  useEffect(() => {
    const discount = calculateDiscount();
    if (discount !== formData.discountPercent) {
      setFormData(prev => ({
        ...prev,
        discountPercent: discount
      }));
    }
  }, [formData.basePrice, formData.finalPrice]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Subscription Plan</DialogTitle>
          <DialogDescription>
            Update the plan details below. Changes will be reflected immediately.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="service">Service *</Label>
              <Select 
                value={formData.serviceId} 
                onValueChange={(value) => handleInputChange('serviceId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="basePrice">Base Price (₹) *</Label>
              <Input
                id="basePrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.basePrice}
                onChange={(e) => handleInputChange('basePrice', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="finalPrice">Final Price (₹) *</Label>
              <Input
                id="finalPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.finalPrice}
                onChange={(e) => handleInputChange('finalPrice', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="discountPercent">Discount (%)</Label>
              <Input
                id="discountPercent"
                type="number"
                min="0"
                max="100"
                value={formData.discountPercent}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="duration">Duration (months) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 1)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="sessionsPerWeek">Sessions/Week</Label>
              <Input
                id="sessionsPerWeek"
                type="number"
                min="1"
                value={formData.sessionsPerWeek}
                onChange={(e) => handleInputChange('sessionsPerWeek', parseInt(e.target.value) || 1)}
              />
            </div>
            
            <div>
              <Label htmlFor="sessionsPerMonth">Sessions/Month</Label>
              <Input
                id="sessionsPerMonth"
                type="number"
                min="1"
                value={formData.sessionsPerMonth}
                onChange={(e) => handleInputChange('sessionsPerMonth', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isPopular"
                checked={formData.isPopular}
                onCheckedChange={(checked) => handleInputChange('isPopular', checked)}
              />
              <Label htmlFor="isPopular">Popular</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
