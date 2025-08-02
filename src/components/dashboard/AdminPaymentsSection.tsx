import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Receipt, ChevronLeft, ChevronRight } from 'lucide-react';

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
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">S.No</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getPaginatedData(payments, currentPage).map((payment, index) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">
                  {getSerialNumber(index, currentPage)}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{payment.customerName}</p>
                    <p className="text-sm text-muted-foreground">{payment.customerEmail}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">${payment.amount}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{getMethodIcon(payment.method)}</span>
                    <span className="text-sm">{payment.method}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(payment.status)}>
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell>{payment.date}</TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {payment.transactionId}
                  </code>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    {payment.status === 'pending' && (
                      <Button size="sm" variant="outline">
                        Process
                      </Button>
                    )}
                    {payment.status === 'completed' && (
                      <Button size="sm" variant="outline">
                        Refund
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {payments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No payments found
          </div>
        )}
        {payments.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={getTotalPages(payments)}
            onPageChange={setCurrentPage}
          />
        )}
      </CardContent>
    </Card>
  );
}; 