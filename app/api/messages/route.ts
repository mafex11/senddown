import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { Message } from '@/models/Message';
import { sanitizeMessage } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db('filedrop');
    const data = await request.json();

    // Validate required fields
    if (!data.roomId || !data.text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Sanitize message content
    const sanitizedText = sanitizeMessage(data.text);

    const newMessage: Message = {
      roomId: data.roomId,
      text: sanitizedText,
      type: data.type || 'text',
      sender: data.sender || 'anonymous',
      timestamp: new Date()
    };

    // Insert message into database
    const result = await db.collection('messages').insertOne(newMessage);

    return NextResponse.json({
      _id: result.insertedId,
      ...newMessage
    });
  } catch (error) {
    console.error('Error saving message:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    
    if (!roomId) {
      return NextResponse.json(
        { error: 'roomId parameter is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('filedrop');

    const messages = await db.collection('messages')
      .find({ roomId })
      .sort({ timestamp: 1 })
      .toArray();

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve messages' },
      { status: 500 }
    );
  }
}