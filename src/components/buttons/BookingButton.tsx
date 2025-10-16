import { Button } from '@/components/ui/button';
import { Plus, Calendar, Clock, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBufferPeriod } from '@/hooks/useBufferPeriod';
import { useToast } from '@/hooks/use-toast';

export interface BookingButtonProps {
  onClick: (date?: Date) => void;
  text?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  prefilledDate?: Date;
  fullWidth?: boolean;
  children?: React.ReactNode;
  ignoreBufferPeriod?: boolean; // Allow bypassing buffer period check for admin actions
}

export const BookingButton: React.FC<BookingButtonProps> = ({
  onClick,
  text = "Book Now",
  variant = "default",
  size = "default",
  className,
  disabled = false,
  loading = false,
  icon,
  prefilledDate,
  fullWidth = false,
  children,
  ignoreBufferPeriod = false,
  ...props
}) => {
  const { toast } = useToast();
  const { 
    isInBufferPeriod, 
    shouldDisableBooking, 
    getBufferPeriodMessage, 
    getFormattedEndDate,
    isLoading: bufferLoading 
  } = useBufferPeriod();

  const handleClick = () => {
    // Check buffer period unless explicitly ignored
    if (!ignoreBufferPeriod && shouldDisableBooking()) {
      toast({
        title: '🚫 Booking Services Paused',
        description: getBufferPeriodMessage(),
        variant: 'destructive',
        duration: 8000, // Show for 8 seconds for better visibility
      });
      return;
    }
    
    onClick(prefilledDate);
  };

  const getDefaultIcon = () => {
    // Show buffer period icon if in buffer period and not ignoring it
    if (!ignoreBufferPeriod && shouldDisableBooking()) {
      return <Pause className="h-4 w-4" />;
    }
    
    if (icon !== undefined) return icon;
    
    if (prefilledDate) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (prefilledDate.toDateString() === today.toDateString()) {
        return <Clock className="h-4 w-4" />;
      } else if (prefilledDate.toDateString() === tomorrow.toDateString()) {
        return <Calendar className="h-4 w-4" />;
      }
      return <Calendar className="h-4 w-4" />;
    }
    
    return <Plus className="h-4 w-4" />;
  };

  const getButtonText = () => {
    if (!ignoreBufferPeriod && shouldDisableBooking()) {
      return `Services Paused (Until ${getFormattedEndDate()})`;
    }
    return children || text;
  };

  const getButtonVariant = () => {
    if (!ignoreBufferPeriod && shouldDisableBooking()) {
      return 'outline' as const;
    }
    return variant;
  };

  const isButtonDisabled = () => {
    return disabled || loading || bufferLoading || (!ignoreBufferPeriod && shouldDisableBooking());
  };

  const buttonIcon = getDefaultIcon();

  return (
    <Button
      variant={getButtonVariant()}
      size={size}
      className={cn(
        fullWidth && "w-full",
        // Add buffer period styling
        !ignoreBufferPeriod && shouldDisableBooking() && "border-orange-300 text-orange-600 bg-orange-50 hover:bg-orange-100",
        className
      )}
      disabled={isButtonDisabled()}
      onClick={handleClick}
      {...props}
    >
      {loading || bufferLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
          {bufferLoading ? "Checking..." : "Booking..."}
        </>
      ) : (
        <>
          {buttonIcon && (
            <span className="mr-2">{buttonIcon}</span>
          )}
          {getButtonText()}
        </>
      )}
    </Button>
  );
};

// Predefined common booking buttons
export const BookTodayButton: React.FC<Omit<BookingButtonProps, 'prefilledDate' | 'text' | 'icon'>> = (props) => (
  <BookingButton
    {...props}
    prefilledDate={new Date()}
    text="Book for Today"
    icon={<Clock className="h-4 w-4" />}
  />
);

export const BookTomorrowButton: React.FC<Omit<BookingButtonProps, 'prefilledDate' | 'text' | 'icon'>> = (props) => (
  <BookingButton
    {...props}
    prefilledDate={(() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    })()}
    text="Book for Tomorrow"
    icon={<Calendar className="h-4 w-4" />}
  />
);

export const QuickBookButton: React.FC<Omit<BookingButtonProps, 'text' | 'icon' | 'variant'>> = (props) => (
  <BookingButton
    {...props}
    text="Quick Book"
    icon={<Plus className="h-4 w-4" />}
    variant="default"
    className={cn("btn-hero", props.className)}
  />
);
