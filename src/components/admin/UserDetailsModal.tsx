import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Clock, User, MapPin, Calendar, Phone, Mail } from 'lucide-react';

interface UserDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any; // User details
  assignedMaid?: any; // Assigned maid details
  subscription?: any; // Subscription details
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  open,
  onOpenChange,
  user,
  assignedMaid,
  subscription,
}) => {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
          <div>
            <DialogTitle className="text-2xl">{user.name}</DialogTitle>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </DialogHeader>

        <div className="pt-4 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-sm mt-1">{user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <p className="text-sm mt-1">
                  <Badge variant={user.status === 'ACTIVE' || user.status === 'active' ? 'default' : 'secondary'}>
                    {user.status}
                  </Badge>
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                </div>
                <p className="text-sm mt-1">{user.email}</p>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                </div>
                <p className="text-sm mt-1">{user.phone || 'Not provided'}</p>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                </div>
                <p className="text-sm mt-1">{user.address || 'Not provided'}</p>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium text-muted-foreground">Joined</label>
                </div>
                <p className="text-sm mt-1">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Time Slot */}
          {user.timeSlot && (
            <div className="space-y-2 bg-secondary/30 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <h3 className="font-semibold">Preferred Time Slot</h3>
              </div>
              <p className="text-sm font-medium">{user.timeSlot}</p>
            </div>
          )}

          {/* Subscription Details */}
          {subscription && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Subscription</h3>
              <div className="grid grid-cols-2 gap-4 bg-secondary/30 p-4 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Plan</label>
                  <p className="text-sm mt-1 font-semibold">{subscription.planName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p className="text-sm mt-1">
                    <Badge variant={subscription.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {subscription.status || 'Unknown'}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                  <p className="text-sm mt-1">{subscription.startDate ? new Date(subscription.startDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sessions/Week</label>
                  <p className="text-sm mt-1">{subscription.sessionsPerWeek ?? 'N/A'} days</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">End Date</label>
                  <p className="text-sm mt-1">{subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sessions/Month</label>
                  <p className="text-sm mt-1">{subscription.sessionsPerMonth ?? 'N/A'} sessions</p>
                </div>
              </div>
              {subscription.isInBufferPeriod && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 dark:bg-yellow-950/20 dark:border-yellow-800">
                  <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200">In Buffer Period</p>
                  <p className="text-xs text-yellow-800 dark:text-yellow-300 mt-1">
                    From {subscription.bufferStartDate ? new Date(subscription.bufferStartDate).toLocaleDateString() : 'N/A'} to{' '}
                    {subscription.bufferEndDate ? new Date(subscription.bufferEndDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Assigned Maid */}
          {assignedMaid ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Assigned Homecare Partner</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3 dark:bg-blue-950/20 dark:border-blue-800">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-sm mt-1 font-semibold">{assignedMaid.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Rating</label>
                    <p className="text-sm mt-1">
                      {assignedMaid.rating != null ? `${assignedMaid.rating.toFixed(1)}★` : 'N/A'}
                      {assignedMaid.totalRatings != null ? ` (${assignedMaid.totalRatings} reviews)` : ''}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-sm mt-1">{assignedMaid.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-sm mt-1">{assignedMaid.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Completed Bookings</label>
                    <p className="text-sm mt-1">{assignedMaid.completedBookings ?? 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Weekly Off</label>
                    <p className="text-sm mt-1 font-semibold">{assignedMaid.weeklyOffDay || 'None set'}</p>
                  </div>
                </div>
                {assignedMaid.skills && assignedMaid.skills.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Skills</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {assignedMaid.skills.map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center dark:bg-gray-900/50 dark:border-gray-700">
              <p className="text-sm text-muted-foreground">No homecare partner assigned yet</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
