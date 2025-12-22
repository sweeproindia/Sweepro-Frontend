import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface QrScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (text: string) => void;
}

const QrScannerDialog: React.FC<QrScannerDialogProps> = ({ open, onOpenChange, onScan }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState<string>('');
  const [scanning, setScanning] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    let rafId: number | null = null;
    let detector: any = null;

    const stop = () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        setStream(null);
      }
      setScanning(false);
    };

    const loopDetect = async () => {
      if (!active || !videoRef.current) return;
      try {
        if (detector && typeof detector.detect === 'function') {
          const results = await detector.detect(videoRef.current as any);
          if (results && results.length > 0) {
            const value = results[0].rawValue || results[0].rawValue || results[0].displayValue || '';
            if (value) {
              onScan(value);
              onOpenChange(false);
              return;
            }
          }
        }
      } catch {}
      rafId = requestAnimationFrame(loopDetect);
    };

    const start = async () => {
      setError(null);
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (!active) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        setStream(s);
        if (videoRef.current) {
          (videoRef.current as any).srcObject = s;
          await videoRef.current.play().catch(() => {});
        }
        const BD = (window as any).BarcodeDetector;
        if (BD && BD.getSupportedFormats) {
          const formats = await BD.getSupportedFormats();
          detector = new BD({ formats });
          setScanning(true);
          rafId = requestAnimationFrame(loopDetect);
        } else {
          setError('Scanner not supported. Paste the QR data manually.');
        }
      } catch (e: any) {
        setError(e?.message || 'Camera access denied. Paste the QR data manually.');
      }
    };

    if (open) {
      active = true;
      start();
    } else {
      active = false;
      stop();
    }

    return () => {
      active = false;
      stop();
    };
  }, [open, onOpenChange, onScan]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Scan Maid QR</DialogTitle>
          <DialogDescription>Align the QR within the frame. Grant camera permission if prompted.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            {!scanning && !error && (
              <div className="absolute inset-0 grid place-items-center text-white/80 text-sm">Starting camera…</div>
            )}
            {error && (
              <div className="absolute inset-0 grid place-items-center text-red-200 text-sm px-4 text-center">{error}</div>
            )}
          </div>
          <div className="space-y-2">
            <Input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="Or paste QR data here"
            />
            <Button
              onClick={() => {
                if (manual.trim()) {
                  onScan(manual.trim());
                  onOpenChange(false);
                }
              }}
              disabled={!manual.trim()}
            >
              Submit
            </Button>
          </div>
        </div>
        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
};

export default QrScannerDialog;
