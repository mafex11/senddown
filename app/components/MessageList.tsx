'use client';

import { formatFileSize } from '../lib/utils';
import { Message } from '../models/Message';
import { FileData } from '../models/File';
interface MessageListProps {
  messages: Message[];
  files: FileData[];
}

export default function MessageList({ messages, files }: MessageListProps) {
  // Combine messages and files into a single array
  const allItems = [...messages, ...files].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="space-y-4">
      {allItems.map((item) => {
        // Use type narrowing to handle Message and FileData separately
        if (item.type === 'file') {
          // Handle FileData
          const file = item as FileData;
          return (
            <div
              key={file.fileId}
              className="p-3 rounded-lg bg-blue-50 text-gray-800"
            >
              <a
                href={file.url}
                download={file.filename}
                className="text-blue-600 hover:underline"
              >
                {file.filename}
              </a>
              <span className="text-sm text-gray-500 ml-2">
                ({formatFileSize(file.size)})
              </span>
              <span className="text-xs text-gray-500 block mt-1">
                {new Date(file.timestamp).toLocaleTimeString()}
              </span>
            </div>
          );
        } else {
          // Handle Message
          const message = item as Message;
          return (
            <div
              key={message._id?.toString()}
              className={`p-3 rounded-lg ${
                message.type === 'system'
                  ? 'bg-gray-100 text-gray-600'
                  : 'bg-blue-50 text-gray-800'
              }`}
            >
              <p>{message.text}</p>
              <span className="text-xs text-gray-500 block mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          );
        }
      })}
    </div>
  );
}