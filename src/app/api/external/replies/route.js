import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      parent_comment_id,
      first_name,
      last_name,
      phone_number = '',
      email,
      comment,
      article_id = '0',
      article_url = '',
      type = 'blog',
      status = 0
    } = body;

    // Validate required fields
    const requiredFields = [
      { field: 'parent_comment_id', message: 'Parent comment ID is required' },
      { field: 'first_name', message: 'First name is required' },
      { field: 'last_name', message: 'Last name is required' },
      { field: 'email', message: 'Email is required' },
      { field: 'comment', message: 'Comment text is required' }
    ];

    const missingFields = requiredFields.filter(v => !body[v.field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: missingFields.map(mf => mf.message)
        },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Validate parent comment exists
    const parentComment = await prisma.comment.findUnique({
      where: { comment_id: parseInt(parent_comment_id) }
    });

    if (!parentComment) {
      return NextResponse.json(
        { success: false, message: "The comment you're replying to doesn't exist." },
        { status: 404 }
      );
    }

    // Create reply
    const newReply = await prisma.replies.create({
      data: {
        parent_comment_id: parseInt(parent_comment_id),
        first_name,
        last_name,
        phone_number,
        email,
        comment,
        article_id: article_id.toString(),
        article_url,
        type,
        status,
        created_at: new Date(),
        updated_at: new Date()
      },
      include: {
        parentComment: {
          select: {
            comment_id: true,
            first_name: true,
            last_name: true
          }
        }
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Your reply has been posted successfully.',
        data: newReply
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Reply submission error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred while processing your reply',
        error: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack
        } : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const article_id = searchParams.get('article_id');
    const parent_comment_id = searchParams.get('parent_comment_id');

    let whereClause = {};

    if (article_id) {
      whereClause.article_id = article_id.toString();
    }

    if (parent_comment_id) {
      whereClause.parent_comment_id = parseInt(parent_comment_id);
    }

    const replies = await prisma.replies.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' },
      take: 100,
      include: {
        parentComment: {
          select: {
            comment_id: true,
            first_name: true,
            last_name: true,
            created_at: true
          }
        }
      }
    });

    // Optional: filter out replies with null parentComment in JS if needed
    const filteredReplies = replies.filter(reply => reply.parentComment !== null);

    return NextResponse.json({
      success: true,
      data: filteredReplies
    });
  } catch (error) {
    console.error('Get replies error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while fetching replies',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}