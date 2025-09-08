import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// GET: List all post levels
export async function GET() {
  try {
    const levels = await prisma.posts.findMany();
    return NextResponse.json({ success: true, data: levels });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Add a new post level
export async function POST(req) {
  try {
    const body = await req.json();
    console.log('POST /api/internal/add_post_level - Request body:', body);
    
    // Validation
    if (!body.title || !body.user_id || !body.category_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: title, user_id, category_id' 
      }, { status: 400 });
    }
    // Slug generation if not provided
    let slug = body.slug;
    if (!slug || slug.trim() === '') {
      slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    // Prepare data for Prisma - matching database schema
    const data = {
      user_id: Number(body.user_id),
      category_id: Number(body.category_id),
      brand_id: body.brand_id ? Number(body.brand_id) : null,
      title: body.title,
      slug,
      short_description: body.short_description || '',
      description: body.description || '',
      image: body.image || '',
      sku: body.sku || '',
      price: body.price ? Number(body.price) : 0, // Make price optional, default to 0
      discounted_price: body.discounted_price ? Number(body.discounted_price) : null,
      quantity: body.quantity ? Number(body.quantity) : 0,
      gallery: body.gallery || '',
      discount: body.discount ? Number(body.discount) : null,
      post_type: body.post_type ? Number(body.post_type) : 1, // Convert to integer
      meta_keywords: body.meta_keywords || '',
      meta_description: body.meta_description || '',
      meta_title: body.meta_title || '',
      link_canonical: body.link_canonical || '',
      is_featured: body.isFeatured ? 1 : 0, // Convert boolean to integer
      attributes: body.attributes || undefined,
      related: body.related || undefined,
      best_seller: body.best_seller ? 1 : 0, // Convert boolean to integer
      top_rated: body.top_rated ? 1 : 0, // Convert boolean to integer
      unit: body.unit || '',
      weight: body.weight ? Number(body.weight) : null,
      is_active: body.isActive ? 1 : 0, // Convert boolean to integer
    };
    
    console.log('Prepared data for Prisma:', data);
    const newLevel = await prisma.posts.create({ data });
    console.log('Level created successfully:', newLevel);
    return NextResponse.json({ success: true, data: newLevel });
  } catch (error) {
    console.error('POST /api/internal/add_post_level error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
}