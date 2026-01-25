import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Send, Loader2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FeedbackService, { SubmitFeedbackData } from '@/services/feedbackService';

interface AssignedMaid {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  rating: number;
  totalRatings: number;
}

interface FeedbackFormProps {
  booking: any;
  assignedMaids?: AssignedMaid[];
  defaultMaidId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function FeedbackForm({ booking, assignedMaids = [], defaultMaidId, onSuccess, onCancel }: FeedbackFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedMaidId, setSelectedMaidId] = useState<string>(() => {
    // Initialize with defaultMaidId, booking maid, or first assigned maid
    return defaultMaidId || booking.maid?.id || (assignedMaids.length > 0 ? assignedMaids[0].id : '');
  });
  const [overallRating, setOverallRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [punctualityRating, setPunctualityRating] = useState(0);
  const [behaviorRating, setBehaviorRating] = useState(0);
  const [comment, setComment] = useState('');
  const [improvements, setImprovements] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);

  const StarRating = ({ 
    rating, 
    onRatingChange, 
    label 
  }: { 
    rating: number; 
    onRatingChange: (rating: number) => void;
    label: string;
  }) => {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onRatingChange(star)}
              className="focus:outline-none transition-transform hover:scale-110"
              disabled={loading}
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  star <= rating
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300 fill-gray-300'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              {rating}/5
            </span>
          )}
        </div>
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (overallRating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please provide an overall rating',
        variant: 'destructive'
      });
      return;
    }

    // If there are assigned maids, maid selection is required
    if (assignedMaids.length > 0 && !selectedMaidId) {
      toast({
        title: 'Maid Selection Required',
        description: 'Please select a maid to rate',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const feedbackData: SubmitFeedbackData = {
        bookingId: booking.id,
        maidId: selectedMaidId || undefined,
        overallRating,
        qualityRating: qualityRating > 0 ? qualityRating : undefined,
        punctualityRating: punctualityRating > 0 ? punctualityRating : undefined,
        behaviorRating: behaviorRating > 0 ? behaviorRating : undefined,
        comment: comment.trim() || undefined,
        improvements: improvements.trim() || undefined,
        wouldRecommend: wouldRecommend !== null ? wouldRecommend : undefined
      };

      await FeedbackService.submitFeedback(feedbackData);

      toast({
        title: 'Feedback Submitted',
        description: 'Thank you for your feedback! It helps us improve our services.',
        variant: 'default'
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || error.message || 'Failed to submit feedback',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedMaid = assignedMaids.find(m => m.id === selectedMaidId) || booking.maid;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400" />
          Rate Your Service Experience
        </CardTitle>
        <CardDescription>
          Help us improve by sharing your feedback about the service
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Maid Selection Dropdown - Only show if multiple assigned maids */}
          {assignedMaids.length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="maid-select">Select Homecare Partner to Rate *</Label>
              <Select
                value={selectedMaidId}
                onValueChange={setSelectedMaidId}
                disabled={loading}
              >
                <SelectTrigger id="maid-select">
                  <SelectValue placeholder="Select a homecare partner">
                    {selectedMaid ? (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{selectedMaid.name}</span>
                        {selectedMaid.rating > 0 && (
                          <span className="text-sm text-muted-foreground">
                            ({selectedMaid.rating.toFixed(1)} ⭐)
                          </span>
                        )}
                      </div>
                    ) : (
                      'Select a maid'
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {assignedMaids.map((maid) => (
                    <SelectItem key={maid.id} value={maid.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{maid.name}</span>
                        {maid.rating > 0 && (
                          <span className="text-sm text-muted-foreground">
                            ({maid.rating.toFixed(1)} ⭐, {maid.totalRatings} reviews)
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Show selected maid info if only one maid */}
          {assignedMaids.length === 1 && selectedMaid && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium">{selectedMaid.name}</span>
                {selectedMaid.rating > 0 && (
                  <span className="text-sm text-muted-foreground">
                    ({selectedMaid.rating.toFixed(1)} ⭐, {selectedMaid.totalRatings} reviews)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Overall Rating - Required */}
          <StarRating
            rating={overallRating}
            onRatingChange={setOverallRating}
            label="Overall Rating *"
          />

          {/* Detailed Ratings - Optional */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StarRating
              rating={qualityRating}
              onRatingChange={setQualityRating}
              label="Service Quality"
            />
            <StarRating
              rating={punctualityRating}
              onRatingChange={setPunctualityRating}
              label="Punctuality"
            />
            <StarRating
              rating={behaviorRating}
              onRatingChange={setBehaviorRating}
              label="Professionalism"
            />
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Your Comments</Label>
            <Textarea
              id="comment"
              placeholder="Tell us about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              disabled={loading}
              className="resize-none"
            />
          </div>

          {/* Improvements */}
          <div className="space-y-2">
            <Label htmlFor="improvements">Suggestions for Improvement</Label>
            <Textarea
              id="improvements"
              placeholder="What could we do better?"
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              rows={3}
              disabled={loading}
              className="resize-none"
            />
          </div>

          {/* Would Recommend */}
          <div className="space-y-2">
            <Label>Would you recommend this service?</Label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={wouldRecommend === true ? 'default' : 'outline'}
                onClick={() => setWouldRecommend(true)}
                disabled={loading}
                className="flex-1"
              >
                Yes
              </Button>
              <Button
                type="button"
                variant={wouldRecommend === false ? 'default' : 'outline'}
                onClick={() => setWouldRecommend(false)}
                disabled={loading}
                className="flex-1"
              >
                No
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading || overallRating === 0 || (assignedMaids.length > 0 && !selectedMaidId)}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
