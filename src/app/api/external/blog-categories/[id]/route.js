import { prisma } from '../../../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(_, { params }) {
  try {
    const category = await prisma.blog_Category.findUnique({
      where: { id: Number(params.id) }
    });
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const body = await req.json();
    const categoryId = Number(params.id);

    // Optional slug uniqueness check
    if (body.slug) {
      const exists = await prisma.blog_Category.findFirst({
        where: {
          slug: body.slug,
          id: { not: categoryId }
        }
      });
      if (exists) {
        return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 400 });
      }
    }

    const updated = await prisma.blog_Category.update({
      where: { id: categoryId },
      data: body
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  try {
    const category = await prisma.blog_Category.findUnique({ where: { id: Number(params.id) } });
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    await prisma.blogCategory.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
