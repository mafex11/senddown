'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeProps {
  value: string;
  size?: number;
}

export default function QRCodeComponent({ value, size = 200 }: QRCodeProps) {
  const [qrCode, setQrCode] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL(value, { width: size }, (err, url) => {
      if (!err) setQrCode(url);
    });
  }, [value, size]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      {qrCode ? (
        <img src={qrCode} alt="QR Code" className="w-full h-auto" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          Generating QR Code...
        </div>
      )}
    </div>
  );
}