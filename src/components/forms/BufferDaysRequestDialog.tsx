import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { BufferService, BufferRequestData } from '@/services/bufferService';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BufferDaysRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subscriptionId: string;
  remainingBufferDays: number;
}

export function BufferDaysRequestDialog({
  isOpen,
  onClose,
  onSuccess,
  subscriptionId,
  remainingBufferDays
}: BufferDaysRequestDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BufferRequestData>({
    daysCount: 1,
    startDate: '',
    reason: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.reason) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    if (formData.daysCount > remainingBufferDays) {
      toast({
        title: 'Insufficient Buffer Days',
        description: `You only have ${remainingBufferDays} buffer days remaining`,
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await BufferService.requestBufferDays(subscriptionId, formData);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: response.message || 'Buffer period requested successfully',
        });
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          daysCount: 1,
          startDate: '',
          reason: '',
          notes: ''
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to request buffer days',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      // Reset form
      setFormData({
        daysCount: 1,
        startDate: '',
        reason: '',
        notes: ''
      });
    }
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Request Buffer Days
          </DialogTitle>
          <DialogDescription>
            Pause your cleaning services for a specified period. You have {remainingBufferDays} buffer days remaining.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="daysCount">Number of Days *</Label>
              <Select
                value={formData.daysCount.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, daysCount: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select days" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: Math.min(7, remainingBufferDays) }, (_, i) => i + 1).map(day => (
                    <SelectItem key={day} value={day.toString()}>
                      {day} day{day > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                min={today}
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Select
              value={formData.reason}
              onValueChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vacation">Vacation/Travel</SelectItem>
                <SelectItem value="medical">Medical reasons</SelectItem>
                <SelectItem value="family">Family emergency</SelectItem>
                <SelectItem value="work">Work commitments</SelectItem>
                <SelectItem value="renovation">Home renovation</SelectItem>
                <SelectItem value="personal">Personal reasons</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {formData.notes.length}/500 characters
            </p>
          </div>

          {remainingBufferDays === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You have no buffer days remaining. Contact support if you need additional buffer days.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || remainingBufferDays === 0}
              className="min-w-[100px]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Requesting...
                </div>
              ) : (
                'Request Buffer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
