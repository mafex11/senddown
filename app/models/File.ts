// app/models/File.ts
import { ObjectId } from 'mongodb';

export interface FileData {
  _id?: ObjectId;
  fileId: string;
  roomId: string;
  filename: string;
  size: number;
  mimeType: string;
  url: string;
  uploadedAt: Date;
  expiresAt: Date;
  type: string;
  sender: string;
  timestamp: string;
}