import { useEffect, useMemo, useState } from 'react';
import { MaidDashboardLayout } from '@/components/dashboard/MaidDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, HttpMethod } from '@/services/api';
import { MaidService } from '@/services/maidService';

type Weekday = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY' | null;

export default function MaidAvailabilityPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [weeklyOffDay, setWeeklyOffDay] = useState<Weekday>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const availabilityBadge = useMemo(() => {
    return isAvailable ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">Available</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 border-red-200">Unavailable</Badge>
    );
  }, [isAvailable]);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const res: any = await apiRequest('/profile/me', {
        method: HttpMethod.GET,
        requiresAuth: true
      });

      const data = res?.data || res;
      const maidProfile = data?.maidProfile;

      setWeeklyOffDay((maidProfile?.weeklyOffDay ?? null) as Weekday);

      const availabilityObj = maidProfile?.availability && typeof maidProfile.availability === 'object' ? maidProfile.availability : {};
      const availableFlag = !(availabilityObj && availabilityObj.isAvailable === false);
      setIsAvailable(availableFlag);
      setNote(availabilityObj.note || '');
    } catch (e: any) {
      toast({
        title: 'Failed to load availability',
        description: e?.message || 'Could not fetch maid profile',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const saveAvailability = async (nextIsAvailable: boolean) => {
    setSaving(true);
    try {
      const res = await MaidService.setAvailability({
        isAvailable: nextIsAvailable,
        note
      });

      if ((res as any)?.success === false) {
        throw new Error((res as any)?.message || 'Failed to update availability');
      }

      setIsAvailable(nextIsAvailable);
      toast({
        title: 'Availability updated',
        description: nextIsAvailable ? 'You are now marked available.' : 'You are now marked unavailable.'
      });
    } catch (e: any) {
      toast({
        title: 'Update failed',
        description: e?.message || 'Failed to update availability',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <MaidDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Maid Availability</h1>
          <p className="text-muted-foreground mt-2">
            Your weekly leave is configured by admin. You can also temporarily toggle your availability.
          </p>
        </div>

        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Weekly Leave</CardTitle>
            <CardDescription>
              On your weekly leave day, daily assignments are routed to admin reassignment as <code>MAID_ON_LEAVE</code>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Weekly off day</div>
                  <div className="text-lg font-semibold">{weeklyOffDay || 'Not set'}</div>
                </div>
                <Badge variant="outline">Admin controlled</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Temporary Availability</CardTitle>
            <CardDescription>
              Use this when you are sick/unavailable. This affects assignment selection immediately.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground">Current status</div>
                {availabilityBadge}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={saving || loading}
                  onClick={() => saveAvailability(true)}
                >
                  Mark Available
                </Button>
                <Button
                  variant="outline"
                  disabled={saving || loading}
                  onClick={() => saveAvailability(false)}
                >
                  Mark Unavailable
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Input
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Eg: Out of station / Sick / Emergency"
                disabled={saving || loading}
              />
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={fetchAvailability} disabled={saving}>
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MaidDashboardLayout>
  );
}
