'use client';

interface RoomInfoProps {
  roomId: string;
  isConnected: boolean;
  isMobile: boolean;
}

export default function RoomInfo({ roomId, isConnected, isMobile }: RoomInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-xl font-semibold mb-2">Room Information</h2>
      <div className="space-y-2">
        <div className="flex items-center">
          <span className="w-24 font-medium">Room ID:</span>
          <span className="font-mono text-blue-600">{roomId}</span>
        </div>
        <div className="flex items-center">
          <span className="w-24 font-medium">Status:</span>
          <span
            className={`inline-block w-3 h-3 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <div className="flex items-center">
          <span className="w-24 font-medium">Device:</span>
          <span>{isMobile ? 'Mobile' : 'Desktop'}</span>
        </div>
      </div>
    </div>
  );
}