import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import QrCodeRenderer from '@/components/qr/QrCodeRenderer';
import { getMaidQRCode } from '@/services/qrService';

interface MaidQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MaidQrDialog: React.FC<MaidQrDialogProps> = ({ open, onOpenChange }) => {
  const [qr, setQr] = useState<string>('');
  const [maidName, setMaidName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setError(null);
      setLoading(true);
      try {
        const res = await getMaidQRCode();
        if (!active) return;
        if (res.success && res.data) {
          setQr(res.data.qrCodeData);
          setMaidName(res.data.maidInfo.name);
        } else {
          setError(res.message || 'Failed to load QR');
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load QR');
      } finally {
        if (active) setLoading(false);
      }
    };
    if (open) load();
    return () => {
      active = false;
    };
  }, [open]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(qr);
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>My QR Code</DialogTitle>
          <DialogDescription>Ask the customer to scan this code to verify and complete the booking.</DialogDescription>
        </DialogHeader>
        <div className="grid place-items-center gap-3">
          {!loading && !error && qr && (
            <QrCodeRenderer data={qr} size={220} />
          )}
          {loading && (
            <div className="text-sm text-muted-foreground">Loading…</div>
          )}
          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}
          {maidName && (
            <div className="text-sm text-muted-foreground">{maidName}</div>
          )}
          {qr && (
            <Button variant="outline" size="sm" onClick={onCopy}>Copy QR Data</Button>
          )}
        </div>
        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
};

export default MaidQrDialog;
