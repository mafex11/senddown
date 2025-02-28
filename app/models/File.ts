import { ObjectId } from 'mongodb';

export interface FileData {
  _id?: ObjectId;
  fileId: string;
  roomId: string;
  filename: string;
  size: number;
  mimeType: string;
  path: string;
  uploadedAt: Date;
  expiresAt: Date;
  type: string;
  url: string;
  sender: string;
  timestamp: string;
}