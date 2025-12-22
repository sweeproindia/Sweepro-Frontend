import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Flag, AlertCircle, Loader2, CheckCircle2, Sliders } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface FeedbackActionPanelProps {
  feedbackId: string;
  currentStatus: string;
  currentWeight: number;
  isWeightAdjusted: boolean;
  onStatusChange?: (status: string, reason: string) => Promise<void>;
  onWeightChange?: (weight: number, reason: string) => Promise<void>;
  onRecalculate?: () => Promise<void>;
  onAddNote?: (note: string, isVerified: boolean) => Promise<void>;
}

const FeedbackActionPanel: React.FC<FeedbackActionPanelProps> = ({
  feedbackId,
  currentStatus,
  currentWeight,
  isWeightAdjusted,
  onStatusChange,
  onWeightChange,
  onRecalculate,
  onAddNote
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [disputeReason, setDisputeReason] = useState('');
  const [weight, setWeight] = useState(currentWeight);
  const [weightReason, setWeightReason] = useState('');
  const [note, setNote] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [showWeightDialog, setShowWeightDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'DISPUTED': return 'bg-orange-100 text-orange-800';
      case 'RESOLVED': return 'bg-blue-100 text-blue-800';
      case 'REMOVED': return 'bg-red-100 text-red-800';
      case 'INVALID': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = async () => {
    if (newStatus === 'DISPUTED' && !disputeReason) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for dispute',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      if (onStatusChange) {
        await onStatusChange(newStatus, disputeReason);
        toast({
          title: 'Success',
          description: `Feedback status changed to ${newStatus}`
        });
        setShowStatusConfirm(false);
        setDisputeReason('');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to change status',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWeightChange = async () => {
    if (!weightReason) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for weight adjustment',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      if (onWeightChange) {
        await onWeightChange(weight, weightReason);
        toast({
          title: 'Success',
          description: `Feedback weight adjusted to ${weight.toFixed(1)}x`
        });
        setShowWeightDialog(false);
        setWeightReason('');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to adjust weight',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!note) {
      toast({
        title: 'Error',
        description: 'Please enter a note',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      if (onAddNote) {
        await onAddNote(note, isVerified);
        toast({
          title: 'Success',
          description: 'Note added successfully'
        });
        setShowNoteDialog(false);
        setNote('');
        setIsVerified(false);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add note',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecalculate = async () => {
    setIsLoading(true);
    try {
      if (onRecalculate) {
        await onRecalculate();
        toast({
          title: 'Success',
          description: 'Maid rating recalculated successfully'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to recalculate',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Admin Actions
          </CardTitle>
          <Badge className={getStatusColor(currentStatus)}>
            {currentStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Status Display */}
          <div>
            <Label className="text-sm font-medium">Current Status</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Status: <Badge variant="outline">{currentStatus}</Badge>
            </p>
          </div>

          {/* Weight Display */}
          <div>
            <Label className="text-sm font-medium">Feedback Weight</Label>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm">{currentWeight.toFixed(1)}x</span>
              {isWeightAdjusted && (
                <Badge variant="secondary" className="text-xs">
                  Adjusted
                </Badge>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {/* Status Change Dialog */}
            <Dialog open={showStatusConfirm} onOpenChange={setShowStatusConfirm}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start" disabled={isLoading}>
                  <Flag className="h-4 w-4 mr-2" />
                  Change Status
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Feedback Status</DialogTitle>
                  <DialogDescription>
                    Update the status of this feedback entry
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="status-select">New Status</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger id="status-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="DISPUTED">Disputed</SelectItem>
                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                        <SelectItem value="REMOVED">Removed</SelectItem>
                        <SelectItem value="INVALID">Invalid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newStatus === 'DISPUTED' && (
                    <div>
                      <Label htmlFor="dispute-reason">Reason for Dispute</Label>
                      <Textarea
                        id="dispute-reason"
                        placeholder="Why is this feedback being disputed?"
                        value={disputeReason}
                        onChange={(e) => setDisputeReason(e.target.value)}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowStatusConfirm(false)}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleStatusChange}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Update Status
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Weight Adjustment Dialog */}
            <Dialog open={showWeightDialog} onOpenChange={setShowWeightDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start" disabled={isLoading}>
                  <Sliders className="h-4 w-4 mr-2" />
                  Adjust Weight
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adjust Feedback Weight</DialogTitle>
                  <DialogDescription>
                    Change the weight multiplier for this feedback (0-2x)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="weight-slider">Weight: {weight.toFixed(2)}x</Label>
                    <input
                      id="weight-slider"
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(parseFloat(e.target.value))}
                      className="w-full mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="weight-reason">Reason for Adjustment</Label>
                    <Textarea
                      id="weight-reason"
                      placeholder="Why are you adjusting the weight?"
                      value={weightReason}
                      onChange={(e) => setWeightReason(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowWeightDialog(false)}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleWeightChange}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Save Weight
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Add Note Dialog */}
            <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start" disabled={isLoading}>
                  Add Admin Note
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Admin Note</DialogTitle>
                  <DialogDescription>
                    Add a note or resolution details to this feedback
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="admin-note">Note</Label>
                    <Textarea
                      id="admin-note"
                      placeholder="Enter your note..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="mt-1"
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="verified"
                      checked={isVerified}
                      onChange={(e) => setIsVerified(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="verified" className="font-normal cursor-pointer">
                      Mark as verified/resolved
                    </Label>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowNoteDialog(false)}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddNote}
                      disabled={isLoading || !note}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Save Note
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Recalculate Button */}
            {onRecalculate && (
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={handleRecalculate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Recalculating...
                  </>
                ) : (
                  'Recalculate Rating'
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackActionPanel;
