"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MessageList from '../../components/MessageList';
import FileUpload from '../../components/FileUpload';
import RoomInfo from '../../components/RoomInfo';
import { Message } from '../../models/Message';
import { FileData } from '../../models/File';

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [files, setFiles] = useState<FileData[]>([]);
  const [isMobile] = useState(() => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)); // Run once on client

  // Fetch messages and files from the server
  const fetchRoomData = async () => {
    try {
      const [messagesRes, filesRes] = await Promise.all([
        fetch(`/api/messages?roomId=${roomId}`),
        fetch(`/api/files?roomId=${roomId}`),
      ]);

      const messagesData = await messagesRes.json();
      const filesData = await filesRes.json();

      if (messagesRes.ok) setMessages(messagesData.messages || []);
      if (filesRes.ok) setFiles(filesData.files || []);
    } catch (error) {
      console.error('Error fetching room data:', error);
    }
  };

  useEffect(() => {
    fetchRoomData();
    const interval = setInterval(fetchRoomData, 15000);
    return () => clearInterval(interval);
  }, [roomId]);

  const sendMessage = async (text: string) => {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId,
        text,
        sender: 'user',
      }),
    });

    if (response.ok) {
      fetchRoomData(); // Refresh data after sending
    }
  };

  const sendFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', roomId);

    const response = await fetch('/api/files', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      fetchRoomData(); // Refresh data after uploading
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 text-black">
      <RoomInfo 
        roomId={roomId} 
        isConnected={true} // No real-time connection, so assume true
        isMobile={isMobile} 
      />
      
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <MessageList messages={messages} files={files} />
        
        <div className="mt-4 flex items-center gap-2">
          <FileUpload onFileSelect={sendFile} />
          <input 
            type="text" 
            className="flex-1 border rounded-full px-4 py-2" 
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(e.currentTarget.value)}
          />
          <button 
            className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center"
            onClick={() => {
              const input = document.querySelector('input');
              if (input) sendMessage(input.value);
            }}
          >
            ➤
          </button>
        </div>
      </div>
      <button 
        className="bg-gray-500 text-white py-2 px-4 rounded"
        onClick={fetchRoomData}
      >
        Refresh
      </button>
    </div>
  );
}