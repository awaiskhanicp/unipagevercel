import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

function checkAuth(req) {
  const authHeader = req.headers.get('authorization');
  const token = process.env.API_SECRET_TOKEN;
  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== token) {
    return false;
  }
  return true;
}

// POST - Create comment
export async function POST(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const {
      first_name,
      last_name,
      phone_number,
      email,
      comment,
      article_id,
      article_url,
      type
    } = body;
    if (!first_name || !last_name || !email || !comment || !article_id || !article_url) {
      return NextResponse.json(
        { success: false, message: "All required fields must be provided." },
        { status: 400 }
      );
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format." },
        { status: 400 }
      );
    }
    const newComment = await prisma.comment.create({
      data: {
        first_name,
        last_name,
        phone_number: phone_number || null,
        email,
        comment,
        article_id: parseInt(article_id),
        article_url,
        type: type || 'blog',
      },
    });
    return NextResponse.json(
      { 
        success: true, 
        message: "Comment submitted successfully", 
        data: newComment 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Comment submission error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// GET with filtering, pagination, and search
export async function GET(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const search = searchParams.get('search') || '';
    const quality_status = searchParams.get('quality_status');
    const choosable_status = searchParams.get('choosable_status');
    const user_id = searchParams.get('user_id');
    const user_ids = searchParams.get('user_ids');
    const from_date = searchParams.get('from_date');
    const to_date = searchParams.get('to_date');

    const where = {};
    if (search) {
      where.OR = [
        { first_name: { contains: search } },
        { last_name: { contains: search } },
        { email: { contains: search } },
        { comment: { contains: search } },
        { article_url: { contains: search } },
      ];
    }
    if (quality_status) where.quality_status = quality_status;
    if (choosable_status) where.choosable_status = choosable_status;
    if (from_date || to_date) {
      where.created_at = {};
      if (from_date) {
        const d = new Date(from_date);
        if (!isNaN(d)) where.created_at.gte = d;
      }
      if (to_date) {
        const d = new Date(to_date);
        if (!isNaN(d)) where.created_at.lte = d;
      }
    }
    // user_id/user_ids/assignment logic skipped (not in schema)
    const orderBy = [
      { created_at: 'desc' },
    ];
    const [total, records] = await Promise.all([
      prisma.comment.count({ where }),
      prisma.comment.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      })
    ]);
    return NextResponse.json({ success: true, data: records, total, page, pageSize });
  } catch (error) {
    console.error('GET /api/comments error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch comments', error }, { status: 500 });
  }
}


