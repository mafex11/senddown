import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import cloudinary from '../../lib/cloudinary';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export async function POST(request: Request) {
  try {
    await client.connect();
    const db = client.db('filedrop');
    const collection = db.collection('files');

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const roomId = formData.get('roomId') as string;

    if (!file || !roomId) {
      return NextResponse.json(
        { success: false, error: 'File and roomId are required' },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadResult: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `filedrop/${roomId}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    const fileId = new ObjectId().toString();
    const fileData = {
      fileId,
      roomId,
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      url: uploadResult.secure_url,
      uploadedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      type: 'file',
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    await collection.insertOne(fileData);

    return NextResponse.json({ success: true, fileId, url: fileData.url });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
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
    const collection = db.collection('files');

    const files = await collection.find({ roomId }).toArray();
    return NextResponse.json({ success: true, files });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  } finally {
    await client.close();
  }
}