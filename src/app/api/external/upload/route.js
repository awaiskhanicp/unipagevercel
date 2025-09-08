import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('image');

    if (!file || !file.name) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    const ext = path.extname(file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}${ext}`;
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', fileName);

    await writeFile(uploadPath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${fileName}`,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Upload failed', error: error.message },
      { status: 500 }
    );
  }
}
