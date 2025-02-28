import { ObjectId } from 'mongodb';

export interface Room {
  _id?: ObjectId;
  roomId: string;
  createdAt: Date;
  expiresAt: Date; // Rooms expire after 24 hours
  isActive: boolean;
}