import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Loader2, Camera, Keyboard } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface QrScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (text: string) => void;
}

const QrScannerDialog: React.FC<QrScannerDialogProps> = ({ open, onOpenChange, onScan }) => {
  const [code, setCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [mode, setMode] = useState<'code' | 'scanner'>('code');
  const [scannerError, setScannerError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader';

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) { // SCANNING
          await scannerRef.current.stop();
        }
      } catch {
        // Ignore stop errors
      }
      try {
        scannerRef.current.clear();
      } catch {
        // Ignore clear errors
      }
      scannerRef.current = null;
    }
  }, []);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setCode('');
      setIsSubmitting(false);
      setScannerError('');
      setMode('code');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      stopScanner();
    }
  }, [open, stopScanner]);

  // Handle scanner mode
  useEffect(() => {
    if (!open || mode !== 'scanner') {
      stopScanner();
      return;
    }

    let mounted = true;
    const startScanner = async () => {
      // Wait for DOM element to be available
      await new Promise(resolve => setTimeout(resolve, 300));
      if (!mounted) return;

      const container = document.getElementById(scannerContainerId);
      if (!container) {
        setScannerError('Scanner container not found');
        return;
      }

      try {
        const scanner = new Html5Qrcode(scannerContainerId);
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (!mounted) return;
            // Extract verification code from QR data
            let verificationCode = decodedText;
            try {
              const parsed = JSON.parse(decodedText);
              if (parsed.code) verificationCode = parsed.code;
            } catch {
              // Not JSON, use raw text
            }
            const normalized = verificationCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
            if (normalized.length >= 6) {
              setIsSubmitting(true);
              onScan(normalized);
              stopScanner();
            }
          },
          () => {
            // QR decode failure - ignore (scanning in progress)
          }
        );
      } catch (err: any) {
        if (mounted) {
          setScannerError(err?.message || 'Failed to start camera. Please use manual code entry.');
        }
      }
    };

    startScanner();
    return () => {
      mounted = false;
      stopScanner();
    };
  }, [open, mode, onScan, stopScanner]);

  const handleSubmit = async () => {
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) return;

    setIsSubmitting(true);
    onScan(trimmedCode);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code.trim().length >= 6) {
      handleSubmit();
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    setCode(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Verify Service Completion
          </DialogTitle>
          <DialogDescription>
            Scan the maid's QR code or enter their verification code to complete the service.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Mode Toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setMode('code')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                mode === 'code'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              <Keyboard className="h-4 w-4" />
              Enter Code
            </button>
            <button
              type="button"
              onClick={() => setMode('scanner')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                mode === 'scanner'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              <Camera className="h-4 w-4" />
              Scan QR Code
            </button>
          </div>

          {mode === 'code' ? (
            <>
              {/* Code Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Maid's Verification Code</label>
                <Input
                  ref={inputRef}
                  value={code}
                  onChange={handleCodeChange}
                  onKeyDown={handleKeyDown}
                  placeholder="ABCDE12345"
                  className="text-center text-xl font-mono tracking-[0.15em] h-14 uppercase"
                  maxLength={10}
                  disabled={isSubmitting}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="characters"
                />
                <p className="text-xs text-muted-foreground text-center">
                  {code.length}/10 characters • Ask the maid to show you their code
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
            </>
          ) : (
            <>
              {/* QR Scanner */}
              <div className="space-y-3">
                {scannerError ? (
                  <div className="text-center py-8 space-y-3">
                    <p className="text-sm text-destructive">{scannerError}</p>
                    <Button variant="outline" onClick={() => setMode('code')}>
                      <Keyboard className="h-4 w-4 mr-2" />
                      Switch to Manual Entry
                    </Button>
                  </div>
                ) : (
                  <div className="relative rounded-lg overflow-hidden bg-black">
                    <div id={scannerContainerId} className="w-full" />
                  </div>
                )}
                <p className="text-xs text-muted-foreground text-center">
                  Point camera at the maid's QR code to scan
                </p>
              </div>
            </>
          )}

          {/* Help Text */}
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              <strong>How to complete:</strong> The maid has a unique verification code.
              Either scan their QR code with your camera or ask them to show you the code
              and enter it manually.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QrScannerDialog;
