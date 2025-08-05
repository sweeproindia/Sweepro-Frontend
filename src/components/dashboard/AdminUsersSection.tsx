import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, ChevronLeft, ChevronRight } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  status: 'active' | 'pending' | 'suspended';
  totalBookings: number;
  totalSpent: number;
  lastActive: string;
}

interface AdminUsersSectionProps {
  users: User[];
  onVerifyUser: (userId: string) => void;
}

export const AdminUsersSection: React.FC<AdminUsersSectionProps> = ({
  users,
  onVerifyUser,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getPaginatedData = (data: User[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (data: User[]) => {
    return Math.ceil(data.length / itemsPerPage);
  };

  const getSerialNumber = (index: number, page: number) => {
    return (page - 1) * itemsPerPage + index + 1;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/20 text-success';
      case 'pending':
        return 'bg-warning/20 text-warning';
      case 'suspended':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
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
    <Card className="dashboard-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Customer Management
        </CardTitle>
        <CardDescription>Manage customer accounts, verify new users, and monitor activity</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">S.No</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getPaginatedData(users, currentPage).map((user, index) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {getSerialNumber(index, currentPage)}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm">{user.phone}</p>
                </TableCell>
                <TableCell>{user.joinDate}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(user.status)}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{user.totalBookings}</Badge>
                </TableCell>
                <TableCell>
                  <span className="font-medium">${user.totalSpent}</span>
                </TableCell>
                <TableCell>{user.lastActive}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    {user.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onVerifyUser(user.id)}
                      >
                        Verify
                      </Button>
                    )}
                    {user.status === 'active' && (
                      <Button size="sm" variant="outline">
                        Suspend
                      </Button>
                    )}
                    {user.status === 'suspended' && (
                      <Button size="sm" variant="outline">
                        Activate
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {users.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No users found
          </div>
        )}
        {users.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={getTotalPages(users)}
            onPageChange={setCurrentPage}
          />
        )}
      </CardContent>
    </Card>
  );
}; 