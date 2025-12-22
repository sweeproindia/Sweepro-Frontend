import React, { useEffect, useMemo, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MaidService } from '@/services/maidService';
import { useUser } from '@/contexts/UserContext';

export const MaidAvailabilityToggle: React.FC = () => {
  const { user, refreshUser, isAuthenticated } = useUser();
  const { toast } = useToast();
  const initialAvailable = useMemo(() => {
    const isUnavailable = (user as any)?.profiles?.maid?.availability?.isAvailable === false;
    return !isUnavailable;
  }, [user]);

  const [isAvailable, setIsAvailable] = useState<boolean>(initialAvailable);
  const [note, setNote] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    setIsAvailable(initialAvailable);
  }, [initialAvailable]);

  if (!isAuthenticated || user?.role !== 'MAID') return null;

  const handleToggle = async (checked: boolean) => {
    setIsAvailable(checked);
    setSaving(true);
    try {
      const res = await MaidService.setAvailability({ isAvailable: checked, note: note?.trim() ? note.trim() : undefined });
      if (res.success) {
        toast({
          title: 'Availability updated',
          description: checked ? 'You are now available for assignments.' : 'You are now unavailable. New requests will be routed to admin.',
        });
        await refreshUser();
      } else {
        throw new Error(res.message || 'Failed to update');
      }
    } catch (err: any) {
      setIsAvailable(!checked);
      toast({ title: 'Update failed', description: err?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNote = async () => {
    setSaving(true);
    try {
      const res = await MaidService.setAvailability({ isAvailable, note: note?.trim() ? note.trim() : undefined });
      if (res.success) {
        toast({ title: 'Note saved', description: 'Your availability note has been updated.' });
        await refreshUser();
      } else {
        throw new Error(res.message || 'Failed to update note');
      }
    } catch (err: any) {
      toast({ title: 'Save failed', description: err?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="dashboard-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium text-muted-foreground">Availability</CardTitle>
          <CardDescription>Toggle to control automatic assignments</CardDescription>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
            {isAvailable ? 'Available' : 'Unavailable'}
          </span>
          <Switch checked={isAvailable} onCheckedChange={handleToggle} disabled={saving} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          placeholder="Optional note (e.g., On leave today)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={saving}
        />
        <div className="flex gap-2">
          <Button onClick={handleSaveNote} disabled={saving} variant="outline">
            Save Note
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
