import React, { useEffect, useMemo, useState } from 'react';

interface QrCodeRendererProps {
  data: string;
  size?: number;
  className?: string;
}

export const QrCodeRenderer: React.FC<QrCodeRendererProps> = ({ data, size = 192, className }) => {
  const [src, setSrc] = useState<string>('');
  const fallbackUrl = useMemo(() => {
    const encoded = encodeURIComponent(data);
    const s = `${size}x${size}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=${s}&data=${encoded}`;
  }, [data, size]);

  useEffect(() => {
    setSrc(fallbackUrl);
  }, [fallbackUrl]);

  return (
    <img
      src={src || fallbackUrl}
      alt="QR Code"
      width={size}
      height={size}
      className={className}
      draggable={false}
    />
  );
};

export default QrCodeRenderer;
