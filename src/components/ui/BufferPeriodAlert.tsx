import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Pause, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BufferPeriodAlertProps {
  isVisible: boolean;
  endDate: string;
  className?: string;
}

export const BufferPeriodAlert: React.FC<BufferPeriodAlertProps> = ({
  isVisible,
  endDate,
  className
}) => {
  if (!isVisible) return null;

  return (
    <Alert className={cn(
      "border-orange-200 bg-orange-50 text-orange-800 shadow-lg",
      "animate-in slide-in-from-top-2 duration-300",
      className
    )}>
      <div className="flex items-center gap-2">
        <Pause className="h-5 w-5 text-orange-600" />
        <AlertTriangle className="h-4 w-4 text-orange-600" />
      </div>
      <AlertTitle className="text-orange-900 font-semibold">
        🚫 Booking Services Currently Paused
      </AlertTitle>
      <AlertDescription className="text-orange-700 mt-2">
        <div className="space-y-2">
          <p>
            Your services are temporarily paused due to an active buffer period until{' '}
            <span className="font-semibold">{endDate}</span>.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>All booking services will resume automatically after your buffer period ends.</span>
          </div>
          <p className="text-sm font-medium">
            💡 You can view your buffer period details and history in your dashboard.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default BufferPeriodAlert;
