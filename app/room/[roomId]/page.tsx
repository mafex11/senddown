"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import io, { Socket } from 'socket.io-client';
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
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    
    const socketInstance = io(process.env.NEXT_PUBLIC_BASE_URL, {
      query: { roomId }
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      socketInstance.emit('joinRoom', { roomId });
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    socketInstance.on('file', (file: FileData) => {
      setFiles(prev => [...prev, file]);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [roomId]);

  const sendMessage = async (text: string) => {
    if (socket && isConnected) {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          text,
          sender: 'user',
        }),
      });

      const data = await response.json();
      if (response.ok) {
        socket.emit('message', data.message);
        setMessages(prev => [...prev, data.message]);
      }
    }
  };

  const sendFile = async (file: File) => {
    if (socket && isConnected) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('roomId', roomId);

      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        const fileMessage: FileData = {
          fileId: data.fileId,
          roomId,
          type: 'file',
          filename: file.name,
          size: file.size,
          mimeType: file.type,
          path: data.path,
          uploadedAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          url: data.url,
          sender: 'user',
          timestamp: new Date().toISOString()
        };
        
        socket.emit('file', fileMessage);
        setFiles(prev => [...prev, fileMessage]);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 text-black">
      <RoomInfo 
        roomId={roomId} 
        isConnected={isConnected} 
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
    </div>
  );
}