

import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

// GET: Get a single post level by id
export async function GET(req, context) {
  try {
    const params = await context.params;
    const { id } = params;
    const level = await prisma.posts.findUnique({ where: { id: Number(id) } });
    if (!level) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: level });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Update a post level by id
export async function PUT(req, context) {
  try {
    const params = await context.params;
    const { id } = params;
    
    console.log('PUT /api/internal/add_post_level/[id] - ID:', id);
    console.log('PUT /api/internal/add_post_level/[id] - Request headers:', Object.fromEntries(req.headers.entries()));
    
    let body;
    try {
      body = await req.json();
      console.log('PUT /api/internal/add_post_level/[id] - Request body:', body);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid JSON in request body',
        parseError: parseError.message 
      }, { status: 400 });
    }
    
    // Validation with detailed error messages
    const validationErrors = [];
    
    if (!body.title) validationErrors.push('title is required');
    if (!body.user_id) validationErrors.push('user_id is required');
    if (!body.category_id) validationErrors.push('category_id is required');
    if (body.price === undefined || body.price === null) validationErrors.push('price is required');
    
    // Additional type validation
    if (body.user_id && isNaN(Number(body.user_id))) validationErrors.push('user_id must be a valid number');
    if (body.category_id && isNaN(Number(body.category_id))) validationErrors.push('category_id must be a valid number');
    if (body.price !== undefined && body.price !== null && isNaN(Number(body.price))) validationErrors.push('price must be a valid number');
    
    if (validationErrors.length > 0) {
      console.log('Validation errors:', validationErrors);
      return NextResponse.json({ 
        success: false, 
        error: 'Validation failed', 
        details: validationErrors,
        receivedData: {
          title: body.title,
          user_id: body.user_id,
          category_id: body.category_id,
          price: body.price,
          priceType: typeof body.price
        }
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
      price: Number(body.price),
      discounted_price: body.discounted_price ? Number(body.discounted_price) : null,
      quantity: body.quantity ? Number(body.quantity) : 0,
      gallery: body.gallery || '',
      discount: body.discount ? Number(body.discount) : null,
      post_type: body.post_type ? Number(body.post_type) : 1, // Convert to integer, default to 1
      meta_keywords: body.meta_keywords || '',
      meta_description: body.meta_description || '',
      meta_title: body.meta_title || '',
      link_canonical: body.link_canonical || '',
      is_featured: body.is_featured ? 1 : 0, // Convert boolean to integer
      attributes: body.attributes || undefined,
      related: body.related || undefined,
      best_seller: body.best_seller ? 1 : 0, // Convert boolean to integer
      top_rated: body.top_rated ? 1 : 0, // Convert boolean to integer
      unit: body.unit || '',
      weight: body.weight ? Number(body.weight) : null,
      is_active: body.is_active ? 1 : 0, // Convert boolean to integer
    };
    
    console.log('Prepared data for Prisma:', data);
    
    // Check if the post exists before updating
    const existingPost = await prisma.posts.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingPost) {
      console.log('Post not found with ID:', id);
      return NextResponse.json({ 
        success: false, 
        error: 'Post not found',
        id: id 
      }, { status: 404 });
    }
    
    console.log('Existing post found:', existingPost);
    
    const updated = await prisma.posts.update({
      where: { id: Number(id) },
      data,
    });
    
    console.log('Update successful:', updated);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error in PUT /api/internal/add_post_level/[id]:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}

// DELETE: Delete a post level by id
export async function DELETE(req, context) {
  try {
    const params = await context.params;
    const { id } = params;
    await prisma.posts.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}