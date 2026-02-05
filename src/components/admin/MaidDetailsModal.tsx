import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, MapPin, Calendar, Phone, Mail, Star, Users } from 'lucide-react';

interface MaidDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maid: any; // Maid details
  assignedCustomers?: any[]; // List of assigned customers
}

export const MaidDetailsModal: React.FC<MaidDetailsModalProps> = ({
  open,
  onOpenChange,
  maid,
  assignedCustomers,
}) => {
  if (!maid || !open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
            <div>
              <CardTitle className="text-2xl">{maid.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{maid.email}</p>
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
                  <p className="text-sm mt-1">{maid.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p className="text-sm mt-1">
                    <Badge variant={maid.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {maid.status}
                    </Badge>
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                  </div>
                  <p className="text-sm mt-1">{maid.email}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  </div>
                  <p className="text-sm mt-1">{maid.phone || 'Not provided'}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <label className="text-sm font-medium text-muted-foreground">Service Radius</label>
                  </div>
                  <p className="text-sm mt-1">{maid.serviceRadius || '2.0'} km</p>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <label className="text-sm font-medium text-muted-foreground">Joined</label>
                  </div>
                  <p className="text-sm mt-1">{new Date(maid.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">📊 Performance</h3>
              <div className="grid grid-cols-2 gap-4 bg-secondary/30 p-4 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Rating</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="h-4 w-4 text-amber-500" />
                    <p className="text-sm font-semibold">{maid.rating.toFixed(1)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Ratings</label>
                  <p className="text-sm mt-1">{maid.totalRatings || 0} reviews</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Completed Bookings</label>
                  <p className="text-sm mt-1">{maid.completedBookings || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cancelled Bookings</label>
                  <p className="text-sm mt-1">{maid.cancelledBookings || 0}</p>
                </div>
              </div>
            </div>

            {/* Weekly Off Day */}
            <div className="space-y-2 bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-purple-100">📅 Weekly Off Day</Badge>
              </div>
              <p className="text-sm font-semibold">
                {maid.weeklyOffDay ? (
                  <span className="text-purple-900">{maid.weeklyOffDay}</span>
                ) : (
                  <span className="text-gray-500">Not assigned</span>
                )}
              </p>
              <p className="text-xs text-purple-700 mt-2">
                {maid.weeklyOffDay 
                  ? `This maid will not be assigned for bookings on ${maid.weeklyOffDay}s`
                  : 'Assign a weekly off day to manage schedule'}
              </p>
            </div>

            {/* Skills */}
            {maid.skills && maid.skills.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">🎓 Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {maid.skills.map((skill: string) => (
                    <Badge key={skill} variant="default" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {maid.languages && maid.languages.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">🗣️ Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {maid.languages.map((lang: string) => (
                    <Badge key={lang} variant="secondary" className="text-xs">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Assigned Customers */}
            {assignedCustomers && assignedCustomers.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-lg">👥 Assigned Customers ({assignedCustomers.length})</h3>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  {assignedCustomers.map((customer: any) => (
                    <div
                      key={customer.id}
                      className="bg-white border border-blue-100 rounded-lg p-3 space-y-2"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Customer Name</label>
                          <p className="text-sm font-semibold">{customer.name}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Email</label>
                          <p className="text-sm">{customer.email}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Time Slot</label>
                          <p className="text-sm font-semibold">{customer.timeSlot || 'Not set'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Subscription Plan</label>
                          <p className="text-sm">{customer.planName || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Days/Week</label>
                          <p className="text-sm">{customer.sessionsPerWeek} days</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Status</label>
                          <Badge variant={customer.subscriptionStatus === 'ACTIVE' ? 'default' : 'secondary'} className="text-xs">
                            {customer.subscriptionStatus}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-5 w-5 text-gray-400" />
                  <p className="text-sm text-muted-foreground">No customers assigned yet</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
};
