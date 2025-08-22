import { Button } from '@/components/ui/button';
import { Plus, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  ...props
}) => {
  const handleClick = () => {
    onClick(prefilledDate);
  };

  const getDefaultIcon = () => {
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

  const buttonIcon = getDefaultIcon();

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
          {loading ? "Booking..." : text}
        </>
      ) : (
        <>
          {buttonIcon && (
            <span className="mr-2">{buttonIcon}</span>
          )}
          {children || text}
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
