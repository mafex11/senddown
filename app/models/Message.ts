import { ObjectId } from 'mongodb';

export interface Message {
  _id: ObjectId;
  roomId: string;
  text: string;
  type: 'text' | 'system';
  sender: string;
  timestamp: string;
}

// export interface FileData {
//   _id?: ObjectId;
//   fileId: string;
//   filename: string;
//   size: number;
//   type: string;
//   url: string;
//   timestamp: string;
// }