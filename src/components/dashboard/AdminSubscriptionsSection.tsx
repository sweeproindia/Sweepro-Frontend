import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';

interface Subscription {
  id: string;
  customerName: string;
  customerEmail: string;
  plan: string;
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  price: number;
  usage: number;
  limit: number;
  nextBilling: string;
}

interface AdminSubscriptionsSectionProps {
  subscriptions: Subscription[];
}

export const AdminSubscriptionsSection: React.FC<AdminSubscriptionsSectionProps> = ({
  subscriptions,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getPaginatedData = (data: Subscription[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (data: Subscription[]) => {
    return Math.ceil(data.length / itemsPerPage);
  };

  const getSerialNumber = (index: number, page: number) => {
    return (page - 1) * itemsPerPage + index + 1;
  };

  const getUsagePercentage = (usage: number, limit: number) => {
    return Math.round((usage / limit) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/20 text-success';
      case 'expired':
        return 'bg-destructive/20 text-destructive';
      case 'cancelled':
        return 'bg-muted text-muted-foreground';
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
          <CreditCard className="h-5 w-5 text-primary" />
          Customer Subscriptions
        </CardTitle>
        <CardDescription>Manage customer subscription plans and usage</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">S.No</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Next Billing</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getPaginatedData(subscriptions, currentPage).map((subscription, index) => (
              <TableRow key={subscription.id}>
                <TableCell className="font-medium">
                  {getSerialNumber(index, currentPage)}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{subscription.customerName}</p>
                    <p className="text-sm text-muted-foreground">{subscription.customerEmail}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{subscription.plan}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(subscription.status)}>
                    {subscription.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{subscription.usage} / {subscription.limit}</span>
                      <span>{getUsagePercentage(subscription.usage, subscription.limit)}%</span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(subscription.usage, subscription.limit)} 
                      className="h-2"
                    />
                  </div>
                </TableCell>
                <TableCell>${subscription.price}/month</TableCell>
                <TableCell>{subscription.nextBilling}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                      View Details
                    </Badge>
                    {subscription.status === 'active' && (
                      <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                        Manage
                      </Badge>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {subscriptions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No subscriptions found
          </div>
        )}
        {subscriptions.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={getTotalPages(subscriptions)}
            onPageChange={setCurrentPage}
          />
        )}
      </CardContent>
    </Card>
  );
}; 