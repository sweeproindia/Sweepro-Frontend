import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/card';
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
  if (!user || !open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
            <div>
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="h-6 w-6 rounded-md hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">👤 Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-sm mt-1">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p className="text-sm mt-1">
                    <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>
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
                  <p className="text-sm mt-1">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Time Slot */}
            {user.timeSlot && (
              <div className="space-y-2 bg-secondary/30 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <h3 className="font-semibold">🕐 Preferred Time Slot</h3>
                </div>
                <p className="text-sm font-medium">{user.timeSlot}</p>
              </div>
            )}

            {/* Subscription Details */}
            {subscription && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">📋 Subscription</h3>
                <div className="grid grid-cols-2 gap-4 bg-secondary/30 p-4 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Plan</label>
                    <p className="text-sm mt-1 font-semibold">{subscription.planName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <p className="text-sm mt-1">
                      <Badge variant={subscription.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {subscription.status}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                    <p className="text-sm mt-1">{new Date(subscription.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Sessions/Week</label>
                    <p className="text-sm mt-1">{subscription.sessionsPerWeek} days</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">End Date</label>
                    <p className="text-sm mt-1">{new Date(subscription.endDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Sessions/Month</label>
                    <p className="text-sm mt-1">{subscription.sessionsPerMonth} sessions</p>
                  </div>
                </div>
                {subscription.isInBufferPeriod && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm font-semibold text-yellow-900">⏸️ In Buffer Period</p>
                    <p className="text-xs text-yellow-800 mt-1">
                      From {new Date(subscription.bufferStartDate).toLocaleDateString()} to{' '}
                      {new Date(subscription.bufferEndDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Assigned Maid */}
            {assignedMaid ? (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">👩‍🔧 Assigned Maid</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <p className="text-sm mt-1 font-semibold">{assignedMaid.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Rating</label>
                      <p className="text-sm mt-1">
                        ⭐ {assignedMaid.rating.toFixed(1)} ({assignedMaid.totalRatings} reviews)
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-sm mt-1">{assignedMaid.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="text-sm mt-1">{assignedMaid.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Completed Bookings</label>
                      <p className="text-sm mt-1">{assignedMaid.completedBookings}</p>
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
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">❌ No maid assigned yet</p>
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
};
