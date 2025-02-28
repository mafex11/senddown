"use client";

import { useState } from 'react';
import Link from 'next/link';
import QRCode from './components/QRCode';
import { generateRoomCode } from './lib/utils';

export default function Home() {
  const [roomCode, setRoomCode] = useState(generateRoomCode());
  const roomUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/room/${roomCode}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">FileDrop</h1>
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-black">Transfer Files Instantly</h2>
        <p className="mb-6 text-black">Scan this QR code with your phone to connect and send files.</p>
        
        <div className="flex flex-col items-center mb-6">
          <QRCode value={roomUrl} size={400} />
        </div>
        
        <div className="text-center mb-4">
          <h3 className="font-medium text-black">Room Code:</h3>
          <div className="text-2xl font-bold text-blue-600 my-2">{roomCode}</div>
        </div>
        
        <Link 
          href={`/room/${roomCode}`}
          className="block w-full bg-blue-600 text-white py-3 px-4 rounded-md text-center hover:bg-blue-700 transition-colors"
        >
          Enter Room
        </Link>
      </div>
    </div>
  );
}