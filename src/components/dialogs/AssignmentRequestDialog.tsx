import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AssignmentRequest } from '@/services/assignmentService';
import { Calendar, Clock, MapPin, User, DollarSign, Check, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface AssignmentRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: AssignmentRequest | null;
  onAccept: (assignmentId: string) => Promise<void>;
  onReject: (assignmentId: string, reason: string) => Promise<void>;
}

export const AssignmentRequestDialog: React.FC<AssignmentRequestDialogProps> = ({
  isOpen,
  onClose,
  assignment,
  onAccept,
  onReject
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [processing, setProcessing] = useState(false);

  if (!assignment) return null;

  const handleAccept = async () => {
    setProcessing(true);
    try {
      await onAccept(assignment.id);
      onClose();
    } catch (error) {
      console.error('Error accepting assignment:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    
    setProcessing(true);
    try {
      await onReject(assignment.id, rejectionReason);
      onClose();
      setShowRejectionForm(false);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting assignment:', error);
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP');
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'p');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            New Assignment Request
          </DialogTitle>
          <DialogDescription>
            You have received a new assignment request. Please review the details and respond.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assignment Status */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              <Clock className="h-3 w-3 mr-1" />
              Expires: {formatDate(assignment.expiresAt)} at {formatTime(assignment.expiresAt)}
            </Badge>
            <Badge variant="secondary">
              Assignment ID: {assignment.id.slice(-8)}
            </Badge>
          </div>

          {/* Customer Information */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium">Name:</span> {assignment.booking.customer.name}
              </div>
              <div>
                <span className="font-medium">Phone:</span> {assignment.booking.customer.phone}
              </div>
              <div className="md:col-span-2">
                <span className="font-medium">Email:</span> {assignment.booking.customer.email}
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">Service Details</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{assignment.booking.service.name}</p>
                  <p className="text-sm text-muted-foreground">{assignment.booking.service.description}</p>
                </div>
                <Badge variant="outline">{assignment.booking.service.category}</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(assignment.booking.scheduledAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {assignment.booking.timeSlot || formatTime(assignment.booking.scheduledAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{assignment.booking.service.baseDuration} minutes</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Service Address:</p>
                  <p className="text-sm text-muted-foreground">{assignment.booking.serviceAddress}</p>
                </div>
              </div>

              {assignment.booking.specialInstructions && (
                <div>
                  <p className="text-sm font-medium mb-1">Special Instructions:</p>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                    {assignment.booking.specialInstructions}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Rejection Form */}
          {showRejectionForm && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <Label htmlFor="rejection-reason" className="text-sm font-medium">
                Reason for Rejection *
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="Please provide a reason for rejecting this assignment..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          {!showRejectionForm ? (
            <>
              <Button
                variant="outline"
                onClick={() => setShowRejectionForm(true)}
                disabled={processing}
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={handleAccept}
                disabled={processing}
                className="bg-green-600 hover:bg-green-700"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Accept Assignment
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectionForm(false);
                  setRejectionReason('');
                }}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Confirm Rejection
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
