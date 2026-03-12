import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getMaidQRCode } from '@/services/qrService';
import { Copy, Check, User, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

interface MaidQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MaidQrDialog: React.FC<MaidQrDialogProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [maidName, setMaidName] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setError(null);
      setLoading(true);
      try {
        const res = await getMaidQRCode();
        if (!active) return;
        if (res.success && res.data) {
          const code = res.data.verificationCode || '';
          setVerificationCode(code);
          setMaidName(res.data.maidInfo?.name || '');
          // Generate QR code image
          if (code) {
            try {
              const qrData = res.data.qrCodeData || JSON.stringify({ type: 'maid_verification', code });
              const dataUrl = await QRCode.toDataURL(qrData, { width: 200, margin: 2 });
              if (active) setQrDataUrl(dataUrl);
            } catch {
              // QR generation failed - code still shows
            }
          }
        } else {
          setError(res.message || 'Failed to load verification code');
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load verification code');
      } finally {
        if (active) setLoading(false);
      }
    };
    if (open) load();
    return () => {
      active = false;
    };
  }, [open]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(verificationCode);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Verification code copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Please copy the code manually',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            My Verification Code
          </DialogTitle>
          <DialogDescription>
            Show this code to the customer after completing the service.
            They will enter it to verify and confirm completion.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-8">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {!loading && !error && verificationCode && (
            <>
              {/* QR Code Image */}
              {qrDataUrl && (
                <div className="flex justify-center">
                  <div className="bg-white p-3 rounded-xl border-2 border-primary/20 shadow-sm">
                    <img src={qrDataUrl} alt="QR Code" className="w-48 h-48" />
                  </div>
                </div>
              )}

              {/* Large Code Display */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-5 text-center border-2 border-primary/20">
                <p className="text-sm text-muted-foreground mb-2">Your Code</p>
                <p className="text-3xl font-mono font-bold tracking-[0.2em] text-primary">
                  {verificationCode}
                </p>
              </div>

              {/* Copy Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </>
                )}
              </Button>

              {/* Maid Name */}
              {maidName && (
                <p className="text-center text-sm text-muted-foreground">
                  {maidName}
                </p>
              )}

              {/* Instructions */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium">How it works:</p>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Complete the cleaning service</li>
                  <li>Show this QR code or tell the code to the customer</li>
                  <li>Customer scans QR or enters the code in their app</li>
                  <li>Service is marked as completed</li>
                </ol>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaidQrDialog;
