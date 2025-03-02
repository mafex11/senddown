import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export async function POST(request: Request) {
  try {
    await client.connect();
    const db = client.db('filedrop');
    const collection = db.collection('messages');

    const { roomId, text, sender } = await request.json();

    const message = {
      _id: new ObjectId(),
      roomId,
      text,
      type: 'text',
      sender,
      timestamp: new Date().toISOString(),
    };

    await collection.insertOne(message);

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Error saving message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save message' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');

  if (!roomId) {
    return NextResponse.json({ error: 'roomId is required' }, { status: 400 });
  }

  try {
    await client.connect();
    const db = client.db('filedrop');
    const collection = db.collection('messages');

    const messages = await collection.find({ roomId }).toArray();
    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  } finally {
    await client.close();
  }
}

