
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(request) {
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

    // Validation
    if (!first_name || !last_name || !email || !comment || !article_id || !article_url) {
      return NextResponse.json(
        { success: false, message: "All required fields must be provided." },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format." },
        { status: 400 }
      );
    }

    // Create comment
    const newComment = await prisma.comment.create({
      data: {
        first_name,
        last_name,
        phone_number: phone_number || null,
        email,
        comment,
        article_id: article_id.toString(),
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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 15;
    const articleIdParam = searchParams.get('article_id');
    const statusParam = searchParams.get('status');
    const allParam = searchParams.get('all');
    const search = (searchParams.get('search') || '').trim();
    const fromDate = searchParams.get('from_date');
    const toDate = searchParams.get('to_date');

    // console.log('=== COMMENTS API DEBUG ===');
    // console.log('Received params:', { page, limit, articleIdParam, statusParam, allParam, search, fromDate, toDate });
    // console.log('Search value:', search);
    // console.log('Search type:', typeof search);
    // console.log('Search length:', search.length);

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    const where = {};
    if (articleIdParam) {
      where.article_id = articleIdParam.toString();
    }
    // By default, only return approved comments.
    // Admin callers can pass status=all or all=true to retrieve all statuses
    const wantAll = (statusParam && statusParam.toLowerCase() === 'all') || (allParam && allParam.toLowerCase() === 'true');
    if (!wantAll) {
      where.status = statusParam || '1';
    }

    // Search across multiple fields (supports multi-word queries)
    if (search) {
      const tokens = search.split(/\s+/).filter(Boolean);
      const tokenClauses = tokens.map((t) => ({
        OR: [
          { first_name: { contains: t } },
          { last_name: { contains: t } },
          { email: { contains: t } },
          { comment: { contains: t } },
          { article_url: { contains: t } },
        ],
      }));
      if (tokenClauses.length > 0) {
        where.AND = (where.AND || []).concat(tokenClauses);
      }
      console.log('Search tokens:', tokens);
    }

    // Date range filter
    if (fromDate || toDate) {
      where.created_at = {};
      if (fromDate) {
        const d = new Date(fromDate);
        if (!isNaN(d)) where.created_at.gte = d;
      }
      if (toDate) {
        const d = new Date(toDate);
        if (!isNaN(d)) where.created_at.lte = d;
      }
    }

    console.log('Final where clause:', JSON.stringify(where, null, 2));

    // Test: Check what status values actually exist in database
    if (search || statusParam) {
      try {
        const statusTest = await prisma.comment.findMany({
          select: { comment_id: true, first_name: true, last_name: true, status: true },
          take: 5
        });
        console.log('Sample comments with status:', statusTest);
        
        const allStatuses = await prisma.comment.findMany({
          select: { status: true },
          distinct: ['status']
        });
        console.log('All status values in database:', allStatuses.map(s => s.status));
      } catch (error) {
        console.log('Status test failed:', error.message);
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.comment.count({ where });

    // Get paginated data
    const comments = await prisma.comment.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: skip,
      take: limit
    });

    console.log('Search results:', { totalCount, returnedCount: comments.length });
    if (search && comments.length > 0) {
      console.log('Sample search result:', {
        id: comments[0].comment_id,
        name: `${comments[0].first_name} ${comments[0].last_name}`,
        email: comments[0].email,
        comment: comments[0].comment?.substring(0, 50) + '...'
      });
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({ 
      success: true, 
      data: comments,
      meta: {
        totalItems: totalCount,
        totalPages: totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error("Get comments error:", error);
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