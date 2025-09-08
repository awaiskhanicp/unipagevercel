import { prisma } from '../../../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } =await params;
    const blogId = parseInt(id);

    if (isNaN(blogId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid blog ID' },
        { status: 400 }
      );
    }

    const blog = await prisma.blogs.findUnique({
      where: { id: blogId },
      include: {
        category: { select: { id: true, name: true } },
        user: { select: { email: true } }
      }
    });

    if (!blog) {
      return NextResponse.json(
        { success: false, message: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...blog,
        enable_meta_tags: blog.enable_meta_tags || false
      }
    });
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } =await params;
    const blogId = parseInt(id);

    if (isNaN(blogId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid blog ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Check if this is just a meta tag update
    const isMetaTagOnlyUpdate = Object.keys(body).length === 1 && 
                               body.enable_meta_tags !== undefined;

    const updateData = isMetaTagOnlyUpdate 
      ? { enable_meta_tags: body.enable_meta_tags }
      : {
          title: body.title,
          slug: body.slug,
          short_description: body.short_description,
          description: body.description,
          image: body.image,
          image_ext: body.image_ext,
          is_active: body.is_active,
          is_featured: body.is_featured,
          sm_question: body.sm_question,
          sm_answer: body.sm_answer,
          review_detail: body.review_detail,
          enable_meta_tags: body.enable_meta_tags,
          custom_post_type: body.custom_post_type,
          post_attributes: body.post_attributes,
          sort_order: body.sort_order,
          seo: body.seo,
          ...(body.category_id && {
            category: {
              connect: { id: body.category_id },
            },
          }),
        };

    const updatedBlog = await prisma.blogs.update({
      where: { id: blogId },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Blog updated successfully',
      data: updatedBlog,
    });
  } catch (error) {
    console.error('PUT Error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, message: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
export async function DELETE(request, { params }) {
  try {
    const { id } =await params;
    const blogId = parseInt(id);

    if (isNaN(blogId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid blog ID' },
        { status: 400 }
      );
    }

    await prisma.blogs.delete({ where: { id: blogId } });

    return NextResponse.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('DELETE Error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, message: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}