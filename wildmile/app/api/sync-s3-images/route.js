import { syncNewImagesFromS3 } from '../../../app/actions/CameratrapActions';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await syncNewImagesFromS3();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error syncing S3 images:', error);
    return NextResponse.json({ error: 'Failed to sync S3 images' }, { status: 500 });
  }
}

export async function POST() {
  // Keep the POST method for programmatic access
  return GET();
}
