import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { forwardRef, useEffect, useRef, useState } from 'react';

interface OtpInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  length?: number;
  onComplete?: (otp: string) => void;
}

const OtpInput = forwardRef<HTMLInputElement, OtpInputProps>(
  ({ className, length = 6, onComplete, ...props }, ref) => {
    const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
      inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index: number, value: string) => {
      if (value.length > 1) {
        value = value[0];
      }

      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      const otpValue = newOtp.join('');
      if (otpValue.length === length && onComplete) {
        onComplete(otpValue);
      }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text').slice(0, length);
      const newOtp = [...otp];
      
      pastedData.split('').forEach((char, index) => {
        if (index < length) {
          newOtp[index] = char;
        }
      });
      
      setOtp(newOtp);
      
      if (pastedData.length === length && onComplete) {
        onComplete(pastedData);
      }
    };

    return (
      <div className="flex gap-2">
        {otp.map((digit, index) => (
          <Input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={cn(
              'w-12 h-12 text-center text-2xl font-bold',
              className
            )}
            {...props}
          />
        ))}
      </div>
    );
  }
);

OtpInput.displayName = 'OtpInput';

export { OtpInput };
