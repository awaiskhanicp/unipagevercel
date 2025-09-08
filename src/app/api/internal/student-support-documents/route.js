import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { prisma } from '../../../../lib/prisma';
import { generateS3Key, getUploadPath } from '../../../../constants/uploadPath';

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
    const file = formData.get('file');
    const title = formData.get('title');
    const description = formData.get('description');

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    const fileName = (file.name && typeof file.name === 'string') ? file.name : 'document.pdf';

    const s3Key = generateS3Key('pdf', fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    const bucket = process.env.AWS_BUCKET;
    const uploadParams = {
      Bucket: bucket,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type || 'application/octet-stream',
    };
    await s3.send(new PutObjectCommand(uploadParams));
    const url = `https://${bucket}.s3.${process.env.AWS_DEFAULT_REGION}.amazonaws.com/${s3Key}`;
    const doc = await prisma.student_support_documents.create({
      data: {
        file_name: title || fileName,
        file_desc: description,
        document_file: url,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    // Convert BigInt id to string for JSON
    const safeDoc = { ...doc, id: doc.id.toString() };
    return NextResponse.json({ success: true, document: safeDoc });
  } catch (error) {
    console.error('Student Support Document upload error:', error);
    return NextResponse.json({ success: false, message: 'Upload failed', error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const startTime = Date.now();
    console.log('🔍 Student Support Documents API: Starting GET request...');
    
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    console.log('🔍 Student Support Documents API: Filter params:', { search, startDate, endDate });

    // Build where clause for filters
    const where = {};
    
    // Search filter
    if (search) {
      where.OR = [
        { file_name: { contains: search } },
        { file_desc: { contains: search } },
      ];
    }
    
    // Date range filter
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) {
        where.created_at.gte = new Date(startDate);
      }
      if (endDate) {
        where.created_at.lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    console.log('🔍 Student Support Documents API: Final where clause:', JSON.stringify(where, null, 2));

    // Get documents with filters
    const docs = await prisma.student_support_documents.findMany({ 
      where,
      orderBy: { created_at: 'desc' } 
    });
    
    const responseTime = Date.now() - startTime;
    console.log('🔍 Student Support Documents API: Response details:', {
      totalCount: docs.length,
      responseTime: `${responseTime}ms`
    });

    // Convert BigInt id to string for all docs
    const safeDocs = docs.map(doc => ({ ...doc, id: doc.id.toString() }));
    return NextResponse.json(safeDocs);
  } catch (error) {
    console.error("❌ Student Support Documents API Error:", error);
    console.error("❌ Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json({ success: false, message: 'Failed to fetch documents', error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const formData = await req.formData();
    const id = formData.get('id');
    const title = formData.get('title');
    const description = formData.get('description');
    let updateData = { file_name: title, file_desc: description, updated_at: new Date() };
    const file = formData.get('file');
    if (file && file.name) {
      if (!file.type || file.type !== 'application/pdf') {
        return NextResponse.json({ success: false, message: 'Only PDF files are allowed.' }, { status: 400 });
      }
      const s3Key = generateS3Key('pdf', file.name);
      const buffer = Buffer.from(await file.arrayBuffer());
      const bucket = process.env.AWS_BUCKET;
      const uploadParams = {
        Bucket: bucket,
        Key: s3Key,
        Body: buffer,
        ContentType: file.type || 'application/octet-stream',
      };
      await s3.send(new PutObjectCommand(uploadParams));
      const url = `https://${bucket}.s3.${process.env.AWS_DEFAULT_REGION}.amazonaws.com/${s3Key}`;
      updateData.document_file = url;
    }
    const doc = await prisma.student_support_documents.update({
      where: { id: BigInt(id) },
      data: updateData,
    });
    const safeDoc = { ...doc, id: doc.id.toString() };
    return NextResponse.json({ success: true, document: safeDoc });
  } catch (error) {
    console.error('Edit Student Support Document error:', error);
    return NextResponse.json({ success: false, message: 'Edit failed', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ success: false, message: 'Missing id' }, { status: 400 });
    // Optionally delete from S3 (not implemented here)
    await prisma.student_support_documents.delete({ where: { id: BigInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete Student Support Document error:', error);
    return NextResponse.json({ success: false, message: 'Delete failed', error: error.message }, { status: 500 });
  }
}