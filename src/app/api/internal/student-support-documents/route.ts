import pool from '../../../../lib/db/db';
import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import type { ResultSetHeader } from 'mysql2';
import { generateS3Key } from '../../../../constants/uploadPath';

// ---------- S3 CLIENT ----------
const s3 = new S3Client({
  region: process.env.AWS_DEFAULT_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: process.env.AWS_USE_PATH_STYLE_ENDPOINT === 'true',
});

// ---------- POST: Upload new document ----------
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string | null;
    const description = formData.get('description') as string | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    const fileName = file.name || 'document.pdf';
    const s3Key = generateS3Key('pdf', fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    const bucket = process.env.AWS_BUCKET!;

    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type || 'application/octet-stream',
    }));

    const url = `https://${bucket}.s3.${process.env.AWS_DEFAULT_REGION}.amazonaws.com/${s3Key}`;
    const now = new Date();

    const [insertResult] = await pool.query<ResultSetHeader>(
      `INSERT INTO student_support_documents (file_name, file_desc, document_file, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?)`,
      [title || fileName, description, url, now, now]
    );

    return NextResponse.json({
      success: true,
      document: {
        id: insertResult.insertId,
        file_name: title || fileName,
        file_desc: description,
        document_file: url,
        created_at: now,
        updated_at: now,
      }
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, message: 'Upload failed', error: error.message }, { status: 500 });
  }
}

// ---------- GET: Fetch with filters ----------
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    let query = `SELECT * FROM student_support_documents WHERE 1=1`;
    const params: any[] = [];

    if (search) {
      query += ` AND (file_name LIKE ? OR file_desc LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (startDate) {
      query += ` AND created_at >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND created_at <= ?`;
      params.push(endDate + ' 23:59:59');
    }

    query += ` ORDER BY created_at DESC`;

    const [rows] = await pool.query(query, params);

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Fetch error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch documents', error: error.message }, { status: 500 });
  }
}

// ---------- PATCH: Update document ----------
export async function PATCH(req: Request) {
  try {
    const formData = await req.formData();
    const id = formData.get('id') as string;
    const title = formData.get('title') as string | null;
    const description = formData.get('description') as string | null;

    let updateFields = `file_name = ?, file_desc = ?, updated_at = ?`;
    const params: any[] = [title, description, new Date()];

    const file = formData.get('file') as File | null;
    let url: string | undefined;
    
    if (file && file.name) {
      if (file.type !== 'application/pdf') {
        return NextResponse.json({ success: false, message: 'Only PDF files are allowed.' }, { status: 400 });
      }
      const s3Key = generateS3Key('pdf', file.name);
      const buffer = Buffer.from(await file.arrayBuffer());
      const bucket = process.env.AWS_BUCKET!;
      await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: s3Key,
        Body: buffer,
        ContentType: file.type,
      }));
      url = `https://${bucket}.s3.${process.env.AWS_DEFAULT_REGION}.amazonaws.com/${s3Key}`;
      updateFields += `, document_file = ?`;
      params.push(url);
    }

    params.push(id);

    const [updateResult] = await pool.query<ResultSetHeader>(
      `UPDATE student_support_documents SET ${updateFields} WHERE id = ?`,
      params
    );

    if (updateResult.affectedRows === 0) {
      return NextResponse.json({ success: false, message: 'Document not found or not updated' }, { status: 404 });
    }

    // Fetch the updated document to return it
    const [updatedDoc] = await pool.query(
      `SELECT * FROM student_support_documents WHERE id = ?`,
      [id]
    );

    return NextResponse.json({
      success: true,
      document: updatedDoc[0], // Return the updated document
      message: 'Document updated successfully'
    });
  } catch (error: any) {
    console.error('Update error:', error);
    return NextResponse.json({ success: false, message: 'Edit failed', error: error.message }, { status: 500 });
  }
}

// ---------- DELETE: Remove document ----------
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing id' }, { status: 400 });
    }

    const [deleteResult] = await pool.query<ResultSetHeader>(
      `DELETE FROM student_support_documents WHERE id = ?`,
      [id]
    );

    if (deleteResult.affectedRows === 0) {
      return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Document deleted successfully' });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json({ success: false, message: 'Delete failed', error: error.message }, { status: 500 });
  }
}
