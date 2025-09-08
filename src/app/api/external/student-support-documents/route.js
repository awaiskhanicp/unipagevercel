import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';

// GET: List student support documents with search and pagination
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const search = searchParams.get('search') || '';

    const where = {};
    if (search) {
      where.OR = [
        { file_name: { contains: search } },
        { file_desc: { contains: search } },
        { document_file: { contains: search } },
      ];
    }

    const total = await prisma.student_support_documents.count({ where });
    const data = await prisma.student_support_documents.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return NextResponse.json({ success: true, data, total, page, pageSize });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch documents' }, { status: 500 });
  }
}

// POST: Create a new student support document
export async function POST(req) {
  try {
    const body = await req.json();
    const doc = await prisma.student_support_documents.create({
      data: {
        file_name: body.file_name,
        file_desc: body.file_desc,
        file_download: body.file_download,
        document_file: body.document_file,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create document' }, { status: 500 });
  }
} 