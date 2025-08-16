import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react';

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  service: string;
  date: string;
  time: string;
  address: string;
  status: 'pending' | 'confirmed';
  assignedMaid?: string;
  price: number;
}

interface Maid {
  id: string;
  name: string;
  status: 'active' | 'pending';
}

interface AdminBookingsSectionProps {
  pendingBookings: Booking[];
  confirmedBookings: Booking[];
  availableMaids: Maid[];
  onAssignMaid: (bookingId: string, maidId: string) => void;
}

export const AdminBookingsSection: React.FC<AdminBookingsSectionProps> = ({
  pendingBookings,
  confirmedBookings,
  availableMaids,
  onAssignMaid,
}) => {
  const [pendingPage, setPendingPage] = useState(1);
  const [confirmedPage, setConfirmedPage] = useState(1);
  const itemsPerPage = 5;

  const getPaginatedData = (data: Booking[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (data: Booking[]) => {
    return Math.ceil(data.length / itemsPerPage);
  };

  const getSerialNumber = (index: number, page: number) => {
    return (page - 1) * itemsPerPage + index + 1;
  };

  const Pagination = ({ currentPage, totalPages, onPageChange }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Pending Bookings */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-warning" />
            Pending Bookings
          </CardTitle>
          <CardDescription>Assign maids to pending bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getPaginatedData(pendingBookings, pendingPage).map((booking, index) => (
              <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                    {getSerialNumber(index, pendingPage)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{booking.customerName}</p>
                        <p className="text-sm text-muted-foreground">{booking.customerEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{booking.service}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.date} at {booking.time}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm">{booking.address}</p>
                        <Badge variant="outline" className="mt-1">
                          ${booking.price}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select onValueChange={(maidId) => onAssignMaid(booking.id, maidId)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Assign maid" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMaids.map((maid) => (
                        <SelectItem key={maid.id} value={maid.id}>
                          {maid.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
            {pendingBookings.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No pending bookings
              </div>
            )}
            {pendingBookings.length > 0 && (
              <Pagination
                currentPage={pendingPage}
                totalPages={getTotalPages(pendingBookings)}
                onPageChange={setPendingPage}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmed Bookings */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-success" />
            Confirmed Bookings
          </CardTitle>
          <CardDescription>Bookings with assigned maids</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getPaginatedData(confirmedBookings, confirmedPage).map((booking, index) => (
              <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                    {getSerialNumber(index, confirmedPage)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                      <div>
                        <p className="text-sm font-medium">{booking.service}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.date} at {booking.time}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm">{booking.address}</p>
                        <Badge variant="outline" className="mt-1">
                          ${booking.price}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Assigned to:</p>
                        <p className="text-sm text-muted-foreground">{booking.assignedMaid}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-success/20 text-success">Confirmed</Badge>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
            {confirmedBookings.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No confirmed bookings
              </div>
            )}
            {confirmedBookings.length > 0 && (
              <Pagination
                currentPage={confirmedPage}
                totalPages={getTotalPages(confirmedBookings)}
                onPageChange={setConfirmedPage}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 