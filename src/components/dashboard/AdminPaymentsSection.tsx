import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Receipt, ChevronLeft, ChevronRight, Wallet, Mail, Calendar as CalendarIcon, CreditCard as CreditCardIcon, Search } from 'lucide-react';

interface Payment {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  date: string;
  transactionId: string;
  description: string;
}

interface AdminPaymentsSectionProps {
  payments: Payment[];
}

export const AdminPaymentsSection: React.FC<AdminPaymentsSectionProps> = ({
  payments,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [searchTerm, setSearchTerm] = useState('');

  const getPaginatedData = (data: Payment[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (data: Payment[]) => {
    return Math.ceil(data.length / itemsPerPage);
  };

  const getSerialNumber = (index: number, page: number) => {
    return (page - 1) * itemsPerPage + index + 1;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/20 text-success';
      case 'pending':
        return 'bg-warning/20 text-warning';
      case 'failed':
        return 'bg-destructive/20 text-destructive';
      case 'refunded':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'credit card':
        return '💳';
      case 'paypal':
        return '🔵';
      case 'bank transfer':
        return '🏦';
      default:
        return '💰';
    }
  };

  const filteredPayments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return payments;
    return payments.filter((payment) => {
      const name = payment.customerName.toLowerCase();
      const email = payment.customerEmail.toLowerCase();
      const method = payment.method.toLowerCase();
      const status = payment.status.toLowerCase();
      const transactionId = payment.transactionId.toLowerCase();
      return (
        name.includes(term) ||
        email.includes(term) ||
        method.includes(term) ||
        status.includes(term) ||
        transactionId.includes(term)
      );
    });
  }, [payments, searchTerm]);

  const totalPages = Math.max(1, getTotalPages(filteredPayments));
  const paginatedPayments = getPaginatedData(filteredPayments, currentPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    const updatedTotal = Math.max(1, getTotalPages(filteredPayments));
    if (currentPage > updatedTotal) {
      setCurrentPage(updatedTotal);
    }
  }, [filteredPayments, currentPage]);

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
          <Receipt className="h-5 w-5 text-primary" />
          Payment History
        </CardTitle>
        <CardDescription>Track customer payments and transactions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Showing {paginatedPayments.length > 0 ? `${getSerialNumber(0, currentPage)}-
              ${getSerialNumber(paginatedPayments.length - 1, currentPage)}` : 0} of {filteredPayments.length} payments
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by customer, method, status, or transaction ID"
              className="pl-9"
            />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">S.No</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="hidden md:table-cell">Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="hidden lg:table-cell">Transaction ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <CreditCardIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {searchTerm ? 'No results found' : 'No payments yet'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {searchTerm
                            ? 'No payments match your search. Try a different term.'
                            : 'Payment records will appear here once transactions occur.'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPayments.map((payment, index) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {getSerialNumber(index, currentPage)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{payment.customerName}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{payment.customerEmail}</span>
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">₹{payment.amount.toLocaleString('en-IN')}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2 text-sm">
                        <span>{getMethodIcon(payment.method)}</span>
                        <span>{payment.method}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{payment.date}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <code className="text-xs bg-muted px-2 py-1 rounded block w-max">
                        {payment.transactionId}
                      </code>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {filteredPayments.length > itemsPerPage && (
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