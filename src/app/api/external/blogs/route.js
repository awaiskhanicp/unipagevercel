import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const blogs = await prisma.blogs.findMany({
      include: { 
        category: {  
          select: {
            id: true,
            name: true,
            slug: true
          }
        } 
      },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({ 
      success: true, 
      data: blogs.map(blog => ({
        ...blog,
        created_at: blog.created_at.toISOString(),
        updated_at: blog.updated_at?.toISOString() || null
      }))
    });
  } catch (error) {
    console.error('GET /api/blogs error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch blogs',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      title,
      slug,
      category_id,
      description,
      short_description,
      image,
      image_ext,
      is_active,
      is_featured,
      sm_question,
      sm_answer,
      review_detail,
      rating_count,
      review_count,
      avg_review_value,
      seo,
      likes,
      views,
      sort_order,
      custom_post_type,
      post_attributes,
    } = body;

    // Validation
    if (!title || !slug || !category_id) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if category exists
    const categoryExists = await prisma.blog_category.findUnique({
      where: { id: Number(category_id) },
    });

    if (!categoryExists) {
      return NextResponse.json(
        { success: false, message: 'Invalid category_id' },
        { status: 400 }
      );
    }

    // Create blog post
    const blog = await prisma.blogs.create({
      data: {
        title,
        slug,
        category_id: Number(category_id),
        short_description,
        description,
        image,
        image_ext,
        is_active: Boolean(is_active),
        is_featured: Boolean(is_featured),
        sm_question,
        sm_answer,
        review_detail,
        rating_count: Number(rating_count) || 0,
        review_count: Number(review_count) || 0,
        avg_review_value: Number(avg_review_value) || 0,
        seo,
        likes: Number(likes) || 0,
        views: Number(views) || 0,
        sort_order: Number(sort_order) || 1,
        custom_post_type,
        post_attributes,
      },
      include: {
        category: {  // Must match relation name in schema
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        ...blog,
        created_at: blog.created_at.toISOString(),
        updated_at: blog.updated_at?.toISOString() || null
      }
    });
  } catch (error) {
    console.error('POST /api/blogs error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create blog post',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      },
      { status: 500 }
    );
  }
}