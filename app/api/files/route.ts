import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import clientPromise from '@/lib/db';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const roomId = formData.get('roomId') as string;
    
    if (!file || !roomId) {
      return NextResponse.json(
        { error: 'File and roomId are required' },
        { status: 400 }
      );
    }
    
    // Create a unique ID for the file
    const fileId = uuidv4();
    
    // Create directories if they don't exist
    const uploadDir = join(process.cwd(), 'uploads', roomId);
    await mkdir(uploadDir, { recursive: true });
    
    // Create a file path
    const filename = file.name.replace(/\s/g, '_');
    const filepath = join(uploadDir, `${fileId}-${filename}`);
    
    // Convert file to Buffer and save it
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);
    
    // Save file metadata to database
    const client = await clientPromise;
    const db = client.db('filedrop');
    
    // Files expire after 24 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    const fileData = {
      fileId,
      roomId,
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      path: filepath,
      uploadedAt: new Date(),
      expiresAt
    };
    
    await db.collection('files').insertOne(fileData);
    
    // Return the file URL for download
    const fileUrl = `/api/files/${fileId}`;
    
    return NextResponse.json({ 
      fileId,
      filename: file.name,
      size: file.size,
      url: fileUrl 
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}