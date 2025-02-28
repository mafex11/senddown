"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import io from 'socket.io-client';
import MessageList from '../../components/MessageList';
import FileUpload from '../../components/FileUpload';
import RoomInfo from '../../components/RoomInfo';

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    
    // Initialize socket connection
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

    socketInstance.on('message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socketInstance.on('file', (file) => {
      setFiles(prev => [...prev, file]);
    });

    setSocket(socketInstance);

    // Clean up on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [roomId]);

  const sendMessage = (text) => {
    if (socket && isConnected) {
      const message = {
        id: Date.now().toString(),
        roomId,
        text,
        type: 'text',
        sender: 'user',
        timestamp: new Date().toISOString()
      };
      
      socket.emit('message', message);
      setMessages(prev => [...prev, message]);
    }
  };

  const sendFile = async (file) => {
    if (socket && isConnected) {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('roomId', roomId);

      // Upload the file to the server
      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        // Notify all room members about the new file
        const fileMessage = {
          id: data.fileId,
          roomId,
          type: 'file',
          filename: file.name,
          size: file.size,
          mimeType: file.type,
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
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(e.target.value)}
          />
          <button 
            className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center"
            onClick={() => sendMessage(document.querySelector('input').value)}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}