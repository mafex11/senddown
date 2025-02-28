import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

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

    // Save file to disk
    const uploadDir = join(process.cwd(), 'uploads', roomId);
    await mkdir(uploadDir, { recursive: true });

    const fileId = new ObjectId().toString();
    const filePath = join(uploadDir, fileId);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Save file metadata to MongoDB
    const fileData = {
      fileId,
      roomId,
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      path: filePath,
      uploadedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    await collection.insertOne(fileData);

    return NextResponse.json({ success: true, fileId, url: `/api/files/${fileId}` });
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