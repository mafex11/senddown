'use client';

import { formatFileSize } from '../lib/utils';
import { Message, FileData } from '../models/Message';

interface MessageListProps {
  messages: Message[];
  files: FileData[];
}

export default function MessageList({ messages, files }: MessageListProps) {
  const allItems = [...messages, ...files].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="space-y-4">
      {allItems.map((item) => (
        <div
          key={item._id?.toString() || item.fileId}
          className={`p-3 rounded-lg ${
            item.type === 'system'
              ? 'bg-gray-100 text-gray-600'
              : 'bg-blue-50 text-gray-800'
          }`}
        >
          {item.type === 'file' ? (
            <div>
              <a
                href={item.url}
                download={item.filename}
                className="text-blue-600 hover:underline"
              >
                {item.filename}
              </a>
              <span className="text-sm text-gray-500 ml-2">
                ({formatFileSize(item.size)})
              </span>
            </div>
          ) : (
            <p>{item.text}</p>
          )}
          <span className="text-xs text-gray-500 block mt-1">
            {new Date(item.timestamp).toLocaleTimeString()}
          </span>
        </div>
      ))}
    </div>
  );
}