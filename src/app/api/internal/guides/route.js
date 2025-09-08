import { prisma } from '../../../../lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 15;
    const search = searchParams.get('search') || '';
    const featured = searchParams.get('featured') || '';
    const active = searchParams.get('active') || '';
    const startDate = searchParams.get('start_date') || '';
    const endDate = searchParams.get('end_date') || '';

    console.log('🔍 Guides API called with params:', { page, limit, search, featured, active, startDate, endDate });

    // Build where clause for filtering
    let whereClause = {};

    // Add search filter
    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { sub_title: { contains: search } },
        { guide_type: { contains: search } }
      ];
    }

    // Add featured filter
    if (featured !== '') {
      whereClause.is_featured = featured === 'true' ? 1 : 0;
    }

    // Add active filter
    if (active !== '') {
      whereClause.is_active = active === 'true' ? 1 : 0;
    }

    // Add date filters
    if (startDate) {
      whereClause.created_at = {
        ...whereClause.created_at,
        gte: new Date(startDate)
      };
    }
    if (endDate) {
      whereClause.created_at = {
        ...whereClause.created_at,
        lte: new Date(endDate)
      };
    }

    // Get total count for pagination
    const totalItems = await prisma.guides.count({ where: whereClause });
    const totalPages = Math.ceil(totalItems / limit);

    console.log('🔍 Total guides in database:', totalItems);
    console.log('🔍 Total pages:', totalPages);

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch guides with pagination
    const guides = await prisma.guides.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        sub_title: true,
        description: true,
        image: true,
        guide_type: true,
        university_id: true,
        subject_id: true,
        slug: true,
        sort_order: true,
        is_active: true,
        is_featured: true,
        sm_question: true,
        sm_answer: true,
        review_detail: true,
        seo: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: { created_at: 'desc' },
      skip: skip,
      take: limit,
    });

    console.log('🔍 Fetched guides count:', guides.length);

    return Response.json({
      success: true,
      data: guides,
      meta: {
        totalItems: totalItems,
        totalPages: totalPages,
        currentPage: page,
        limit: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('🔍 Error in guides API:', error);
    return Response.json({
      success: false,
      error: 'Failed to fetch guides',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    const newGuide = await prisma.guides.create({
      data: {
        user_id: body.user_id || 1,
        guide_type: body.guide_type,
        university_id: body.university_id ? Number(body.university_id) : null,
        subject_id: body.subject_id ? Number(body.subject_id) : null,
        title: body.title,
        slug: body.slug,
        sub_title: body.sub_title,
        sort_order: body.sort_order ? Number(body.sort_order) : 0,
        description: body.description,
        sm_question: body.schema ? JSON.stringify(body.schema) : null,
        sm_answer: body.schema ? JSON.stringify(body.schema) : null,
        review_detail: body.reviews ? JSON.stringify(body.reviews) : null,
        image: body.image,
        is_active: body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1,
        is_featured: body.is_featured !== undefined ? (body.is_featured ? 1 : 0) : 0,
        seo: body.seo ? JSON.stringify(body.seo) : null,
      },
    });

    return Response.json({
      success: true,
      data: newGuide,
      message: 'Guide created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('🔍 Error creating guide:', error);
    return Response.json({
      success: false,
      error: 'Failed to create guide',
      details: error.message
    }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return Response.json({
        success: false,
        error: 'Guide ID is required'
      }, { status: 400 });
    }

    const body = await request.json();
    
    const updatedGuide = await prisma.guides.update({
      where: { id: parseInt(id) },
      data: {
        guide_type: body.guide_type,
        university_id: body.university_id ? Number(body.university_id) : null,
        subject_id: body.subject_id ? Number(body.subject_id) : null,
        title: body.title,
        slug: body.slug,
        sub_title: body.sub_title,
        sort_order: body.sort_order ? Number(body.sort_order) : 0,
        description: body.description,
        sm_question: body.schema ? JSON.stringify(body.schema) : null,
        sm_answer: body.schema ? JSON.stringify(body.schema) : null,
        review_detail: body.reviews ? JSON.stringify(body.reviews) : null,
        is_active: body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1,
        is_featured: body.is_featured !== undefined ? (body.is_featured ? 1 : 0) : 0,
        seo: body.seo ? JSON.stringify(body.seo) : null,
      },
    });

    return Response.json({
      success: true,
      data: updatedGuide,
      message: 'Guide updated successfully'
    });

  } catch (error) {
    console.error('🔍 Error updating guide:', error);
    return Response.json({
      success: false,
      error: 'Failed to update guide',
      details: error.message
    }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return Response.json({
        success: false,
        error: 'Guide ID is required'
      }, { status: 400 });
    }

    const body = await request.json();
    
    const updatedGuide = await prisma.guides.update({
      where: { id: parseInt(id) },
      data: body,
    });

    return Response.json({
      success: true,
      data: updatedGuide,
      message: 'Guide updated successfully'
    });

  } catch (error) {
    console.error('🔍 Error updating guide:', error);
    return Response.json({
      success: false,
      error: 'Failed to update guide',
      details: error.message
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return Response.json({
        success: false,
        error: 'Guide ID is required'
      }, { status: 400 });
    }

    await prisma.guides.delete({
      where: { id: parseInt(id) },
    });

    return Response.json({
      success: true,
      message: 'Guide deleted successfully'
    });

  } catch (error) {
    console.error('🔍 Error deleting guide:', error);
    return Response.json({
      success: false,
      error: 'Failed to delete guide',
      details: error.message
    }, { status: 500 });
  }
}