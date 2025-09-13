import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { generateS3Key, getUploadPath } from '../../../../constants/uploadPath';
import { addImageToContent } from '../../../utils/imageContent';

const s3 = new S3Client({
  region: process.env.AWS_DEFAULT_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: process.env.AWS_USE_PATH_STYLE_ENDPOINT === 'true',
});

export async function POST(req) {
  try {                                                         
    const formData = await req.formData();
    const file = formData.get('image');
    const uploadType = formData.get('uploadType') || 'general'; // Get upload type from form data

    if (!file || !file.name) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    // Generate S3 key using constants file
    const s3Key = generateS3Key(uploadType, file.name);
    const uploadPath = getUploadPath(uploadType);
    const buffer = Buffer.from(await file.arrayBuffer());
    const bucket = process.env.AWS_BUCKET;

    const uploadParams = {
      Bucket: bucket,
      Key: s3Key, // Use the generated S3 key with path
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read', // Removed because bucket does not allow ACLs
    };

   await s3.send(new PutObjectCommand(uploadParams));

    const url = `https://${bucket}.s3.${process.env.AWS_DEFAULT_REGION}.amazonaws.com/${s3Key}`;

    // Save image data to content file
    const imageData = {
      filename: s3Key.split('/').pop(), // Get just the filename
      originalName: file.name,
      s3Key: s3Key,
      s3Url: url,
      uploadType: uploadType,
      uploadPath: uploadPath,
      size: file.size,
      mimeType: file.type
    };

    const savedImage = addImageToContent(imageData);

    return NextResponse.json({
      success: true,
      url,
      uploadType,
      uploadPath,
      s3Key,
      imageId: savedImage.id,
      message: `Image uploaded successfully to ${uploadPath}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Upload failed', error: error.message },
      { status: 500 }
    );
  }
}