import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface AuditEntry {
  id: string;
  action: string;
  adminId: string;
  admin: {
    id: string;
    name: string;
    email: string;
  };
  note: string | null;
  previousValue: any;
  newValue: any;
  deltaRating: number | null;
  createdAt: string;
}

interface AuditTrailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  auditEntries: AuditEntry[];
  isLoading?: boolean;
}

const AuditTrailModal: React.FC<AuditTrailModalProps> = ({
  open,
  onOpenChange,
  auditEntries,
  isLoading = false
}) => {
  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'CREATED':
        return 'bg-green-100 text-green-800';
      case 'DISPUTED':
        return 'bg-orange-100 text-orange-800';
      case 'RESOLVED':
        return 'bg-blue-100 text-blue-800';
      case 'WEIGHT_ADJUSTED':
        return 'bg-purple-100 text-purple-800';
      case 'REMOVED':
        return 'bg-red-100 text-red-800';
      case 'STATUS_CHANGED':
        return 'bg-yellow-100 text-yellow-800';
      case 'ADMIN_RESPONSE_ADDED':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionDescription = (entry: AuditEntry) => {
    switch (entry.action) {
      case 'CREATED':
        return 'Feedback created';
      case 'DISPUTED':
        return `Feedback disputed${entry.note ? ': ' + entry.note : ''}`;
      case 'RESOLVED':
        return `Dispute resolved${entry.note ? ': ' + entry.note : ''}`;
      case 'WEIGHT_ADJUSTED':
        return `Weight adjusted to ${entry.newValue?.weight}x`;
      case 'REMOVED':
        return 'Feedback removed';
      case 'STATUS_CHANGED':
        return `Status changed to ${entry.newValue?.status}`;
      case 'ADMIN_RESPONSE_ADDED':
        return 'Admin response added';
      case 'RATING_ADJUSTED':
        return `Rating adjusted by ${entry.deltaRating ? (entry.deltaRating > 0 ? '+' : '') + entry.deltaRating.toFixed(2) : '0'}`;
      default:
        return entry.action;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Audit Trail
          </DialogTitle>
          <DialogDescription>
            Complete history of admin actions on this feedback
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading audit trail...</p>
          </div>
        ) : auditEntries.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No audit entries found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {auditEntries.map((entry, index) => (
              <Card key={entry.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Timeline marker */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      {index < auditEntries.length - 1 && (
                        <div className="w-0.5 h-12 bg-gray-200 mt-1"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getActionBadgeColor(entry.action)}>
                            {entry.action}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(entry.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                          </span>
                        </div>
                      </div>

                      {/* Action description */}
                      <p className="text-sm font-medium mb-2">
                        {getActionDescription(entry)}
                      </p>

                      {/* Admin info */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                        <User className="h-3 w-3" />
                        <span>{entry.admin.name}</span>
                        <span className="text-gray-300">•</span>
                        <span>{entry.admin.email}</span>
                      </div>

                      {/* Additional details */}
                      {entry.note && (
                        <div className="bg-muted p-2 rounded-md mb-2">
                          <p className="text-xs">
                            <span className="font-medium">Note:</span> {entry.note}
                          </p>
                        </div>
                      )}

                      {/* Value changes */}
                      {(entry.previousValue || entry.newValue) && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {entry.previousValue && (
                            <div className="bg-red-50 p-2 rounded">
                              <p className="font-medium text-red-700">Previous</p>
                              <pre className="text-xs text-red-600 overflow-auto max-h-20">
                                {JSON.stringify(entry.previousValue, null, 2)}
                              </pre>
                            </div>
                          )}
                          {entry.newValue && (
                            <div className="bg-green-50 p-2 rounded">
                              <p className="font-medium text-green-700">New</p>
                              <pre className="text-xs text-green-600 overflow-auto max-h-20">
                                {JSON.stringify(entry.newValue, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Rating impact */}
                      {entry.deltaRating !== null && entry.deltaRating !== 0 && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded">
                          <p className="text-xs">
                            <span className="font-medium">Rating Impact:</span>
                            <span
                              className={`ml-2 ${
                                entry.deltaRating > 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {entry.deltaRating > 0 ? '+' : ''}
                              {entry.deltaRating.toFixed(2)}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuditTrailModal;
