import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface QrScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (text: string) => void;
}

const QrScannerDialog: React.FC<QrScannerDialogProps> = ({ open, onOpenChange, onScan }) => {
  const [code, setCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setCode('');
      setIsSubmitting(false);
      // Small delay to ensure dialog is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleSubmit = async () => {
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) return;

    setIsSubmitting(true);
    // Call the onScan callback with the verification code
    onScan(trimmedCode);
    // Dialog will be closed by parent after API call
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code.trim()) {
      handleSubmit();
    }
  };

  // Format code as user types (uppercase, max 6 characters)
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setCode(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Verify Service Completion
          </DialogTitle>
          <DialogDescription>
            Enter the 6-character code shown by your maid to verify and complete the service.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Code Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Maid's Verification Code</label>
            <Input
              ref={inputRef}
              value={code}
              onChange={handleCodeChange}
              onKeyDown={handleKeyDown}
              placeholder="ABC123"
              className="text-center text-2xl font-mono tracking-[0.2em] h-14 uppercase"
              maxLength={6}
              disabled={isSubmitting}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
            />
            <p className="text-xs text-muted-foreground text-center">
              Ask the maid to show you their code
            </p>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={code.trim().length < 6 || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4 mr-2" />
                Verify & Complete Service
              </>
            )}
          </Button>

          {/* Help Text */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground">
              <strong>Where to find the code?</strong><br />
              The maid has a unique 6-character code (like ABC123).
              Ask them to show it to you from their app or ID card.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QrScannerDialog;
