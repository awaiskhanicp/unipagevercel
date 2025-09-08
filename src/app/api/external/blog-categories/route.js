import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

const DEFAULT_CATEGORIES = [
  { name: 'Technology', slug: 'technology', is_active: true, sort_order: 1 },
  { name: 'Health', slug: 'health', is_active: true, sort_order: 2 },
  { name: 'Education', slug: 'education', is_active: true, sort_order: 3 },
];

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, message: 'Missing fields' },
        { status: 400 }
      );
    }

    const category = await prisma.blog_category.create({
      data: {
        name,
        slug,
        is_active: body.is_active ?? true,
        sort_order: body.sort_order ?? 1,
      },
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check if categories exist, if not create defaults
    const count = await prisma.blog_category.count();
    if (count === 0) {
      await prisma.blog_category.createMany({
        data: DEFAULT_CATEGORIES,
      });
    }

    const categories = await prisma.blog_category.findMany({
      orderBy: { sort_order: 'asc' },
    });
    
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}