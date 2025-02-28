import { NextResponse } from 'next/server';
import clientPromise from '../../lib/db';
import { generateRoomCode } from '../../lib/utils';

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db('filedrop');
    
    // Generate a unique room code
    let roomId = generateRoomCode();
    let existingRoom = await db.collection('rooms').findOne({ roomId });
    
    // Ensure room ID is unique
    while (existingRoom) {
      roomId = generateRoomCode();
      existingRoom = await db.collection('rooms').findOne({ roomId });
    }
    
    // Create a new room with 24-hour expiration
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    const room = {
      roomId,
      createdAt: new Date(),
      expiresAt,
      isActive: true
    };
    
    await db.collection('rooms').insertOne(room);
    
    return NextResponse.json({ roomId });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}