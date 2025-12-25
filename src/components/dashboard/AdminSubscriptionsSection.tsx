import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CreditCard, ChevronLeft, ChevronRight, Calendar as CalendarIcon, User, Mail, Package, TrendingUp, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredSubscriptions = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return subscriptions;
    return subscriptions.filter((subscription) => {
      const name = subscription.customerName.toLowerCase();
      const email = subscription.customerEmail.toLowerCase();
      const plan = subscription.plan.toLowerCase();
      const status = subscription.status.toLowerCase();
      return (
        name.includes(term) ||
        email.includes(term) ||
        plan.includes(term) ||
        status.includes(term)
      );
    });
  }, [subscriptions, searchTerm]);

  const totalPages = Math.max(1, getTotalPages(filteredSubscriptions));
  const paginatedSubscriptions = getPaginatedData(filteredSubscriptions, currentPage);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  React.useEffect(() => {
    const updatedTotal = Math.max(1, getTotalPages(filteredSubscriptions));
    if (currentPage > updatedTotal) {
      setCurrentPage(updatedTotal);
    }
  }, [filteredSubscriptions, currentPage]);

  return (
    <Card className="dashboard-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Customer Subscriptions
        </CardTitle>
        <CardDescription>Manage customer subscription plans and usage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Showing {paginatedSubscriptions.length > 0 ? `${getSerialNumber(0, currentPage)}-
              ${getSerialNumber(paginatedSubscriptions.length - 1, currentPage)}` : 0} of {filteredSubscriptions.length} subscriptions
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by customer, email, plan, or status"
              className="pl-9"
            />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background">
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
              {paginatedSubscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                    {filteredSubscriptions.length === 0 ? 'No subscriptions match your search.' : 'No subscriptions on this page.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSubscriptions.map((subscription, index) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-medium">
                      {getSerialNumber(index, currentPage)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          <span className="font-medium">{subscription.customerName}</span>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{subscription.customerEmail}</span>
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {subscription.plan}
                      </Badge>
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
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span>₹{subscription.price.toLocaleString('en-IN')}/month</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{subscription.nextBilling}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        {subscription.status === 'active' && (
                          <Button size="sm" variant="outline">
                            Manage Plan
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {filteredSubscriptions.length > itemsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </CardContent>
    </Card>
  );
};