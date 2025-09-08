// app/api/internal/blogs/route.js
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request) {
  try {
    const startTime = Date.now();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const startDate = searchParams.get('start_date') || '';
    const endDate = searchParams.get('end_date') || '';
    const popular = searchParams.get('popular') || '';
    const active = searchParams.get('active') || '';
    const country = searchParams.get('country') || '';
    const type = searchParams.get('type') || '';
    
    console.log('🔍 Blogs API Request:', { 
      page, 
      limit, 
      search, 
      category,
      startDate, 
      endDate, 
      popular, 
      active,
      country,
      type,
      url: request.url 
    });
    
    // Test database connection and count total posts
    console.log('🔍 Testing database connection...');
    const totalPostsCount = await prisma.blogs.count();
    console.log('✅ Total blogs in database:', totalPostsCount);
    
    // If no blogs exist, create some sample ones
    if (totalPostsCount === 0) {
      console.log('🔍 No blogs found, creating sample blogs...');
      try {
        // First check if we have categories
        const categoryCount = await prisma.blog_category.count();
        let sampleCategoryId = 1;
        
        if (categoryCount === 0) {
          // Create a default category if none exists
          const defaultCategory = await prisma.blog_category.create({
            data: {
              name: 'General',
              slug: 'general',
              description: 'General blog posts',
              is_active: true,
              sort_order: 1
            }
          });
          sampleCategoryId = defaultCategory.id;
          console.log('✅ Created default category:', defaultCategory);
        } else {
          // Get the first available category
          const firstCategory = await prisma.blog_category.findFirst({
            orderBy: { id: 'asc' }
          });
          sampleCategoryId = firstCategory.id;
        }
        
        // Create sample blogs with explicit description content
        const sampleBlogs = [
          {
            title: 'Welcome to Our Blog',
            slug: 'welcome-to-our-blog',
            short_description: 'This is our first blog post to get you started.',
            description: 'Welcome to our blog! This is a sample post to demonstrate the blog functionality. You can edit or delete this post and create your own content. This is the main description field that should contain the full article content.',
            category_id: sampleCategoryId,
            user_id: 1,
            is_active: true,
            is_featured: false,
            enable_meta_tags: false,
            custom_post_type: 'blog'
          },
          {
            title: 'Getting Started with Blogging',
            slug: 'getting-started-with-blogging',
            short_description: 'Learn how to create and manage your blog posts.',
            description: 'Blogging is a great way to share your thoughts and knowledge with the world. This post will help you understand how to use our blog system effectively. The description field should contain the full article content with all the details and formatting.',
            category_id: sampleCategoryId,
            user_id: 1,
            is_active: true,
            is_featured: true,
            enable_meta_tags: true,
            custom_post_type: 'blog'
          }
        ];
        
        for (const blogData of sampleBlogs) {
          console.log('🔍 Creating sample blog with description:', blogData.description);
          const createdBlog = await prisma.blogs.create({ data: blogData });
          console.log('✅ Created sample blog:', { id: createdBlog.id, title: createdBlog.title, description: createdBlog.description });
        }
        
        console.log('✅ Created sample blogs successfully');
        
        // Test query to see what's actually stored
        const testBlogs = await prisma.blogs.findMany({
          select: {
            id: true,
            title: true,
            short_description: true,
            description: true
          }
        });
        console.log('🔍 Test query - Blogs in database:', testBlogs);
        
        // Update the count
        const newCount = await prisma.blogs.count();
        console.log('✅ New total blogs count:', newCount);
        
      } catch (error) {
        console.error('❌ Error creating sample blogs:', error);
      }
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build where clause for filtering
    let whereClause = {};
    
    // Add search filter
    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { short_description: { contains: search } },
        { description: { contains: search } }
      ];
    }

    // Add category filter (using category_id)
    if (category && category !== '') {
      whereClause.category_id = {
        equals: parseInt(category) || 0
      };
      console.log('🔍 Category filter applied:', { category, category_id: parseInt(category) || 0 });
    }
    
    // Date range filters
    if (startDate || endDate) {
      whereClause.created_at = {};
      if (startDate) {
        whereClause.created_at.gte = new Date(startDate + 'T00:00:00Z');
      }
      if (endDate) {
        whereClause.created_at.lte = new Date(endDate + 'T23:59:59Z');
      }
    }
    
    // Popular filter - convert boolean to boolean for boolean field
    if (popular !== '') {
      whereClause.is_featured = popular === 'true';
      console.log('🔍 Popular filter applied:', { popular, whereClause: whereClause.is_featured });
    }
    
    // Active filter - convert boolean to boolean for boolean field
    if (active !== '') {
      whereClause.is_active = active === 'true';
      console.log('🔍 Active filter applied:', { active, whereClause: whereClause.is_active });
    }

    // Country filter (if articles are related to universities in specific countries)
    if (country && country !== 'Select Country') {
      // This will be handled after fetching articles by checking related university data
      console.log('🔍 Country filter applied:', { country });
    }

    console.log('📋 Final where clause:', JSON.stringify(whereClause, null, 2));

    // If no filters are applied, just get basic pagination
    if (Object.keys(whereClause).length === 0) {
      console.log('🔍 No filters applied, using basic pagination');
      whereClause = {};
    }

    console.log('🔍 Executing database queries with whereClause:', JSON.stringify(whereClause, null, 2));
    
    // Get total count for pagination (after all filters)
    const totalCount = await prisma.blogs.count({ where: whereClause });
    console.log('🔍 Total count with filters:', totalCount);
    
    // Get paginated data with all necessary fields
    const posts = await prisma.blogs.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        short_description: true,
        description: true,
        image: true,
        category_id: true,
        user_id: true,
        is_active: true,
        is_featured: true,
        enable_meta_tags: true,
        created_at: true,
        updated_at: true,
        custom_post_type: true,
        seo: true,
        post_attributes: true,
        views: true,
        likes: true,
        rating_count: true,
        review_count: true,
        avg_review_value: true,
        slug: true
      },
      skip,
      take: limit,
      orderBy: { created_at: 'desc' }
    });
    
    console.log('🔍 Raw posts data from database:', posts);
    console.log('🔍 Number of posts returned:', posts.length);
    
    // Map the posts data to include enable_meta_tags and format properly
    const formattedPosts = posts.map(post => ({
      ...post,
      // The blogs model already has the correct field types, no need for conversion
      enable_meta_tags: post.enable_meta_tags || false,
      is_active: post.is_active || false,
      is_featured: post.is_featured || false
    }));

    // Calculate pagination metadata based on FILTERED results
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    // Ensure we don't exceed the actual filtered results
    const actualItemsOnPage = formattedPosts.length;
    const startItem = skip + 1;
    const endItem = Math.min(skip + actualItemsOnPage, totalCount);

    console.log('🔍 Blogs API - Pagination details:', {
      currentPage: page,
      totalPages,
      totalItems: totalCount,
      itemsPerPage: limit,
      actualItemsOnPage: formattedPosts.length,
      startItem: skip + 1,
      endItem: Math.min(skip + formattedPosts.length, totalCount),
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
    
    return NextResponse.json({
      success: true,
      data: formattedPosts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        startItem: skip + 1,
        endItem: Math.min(skip + formattedPosts.length, totalCount),
        actualItemsOnPage: formattedPosts.length
      },
      filters: {
        country,
        category: category || null,
        search,
        startDate,
        endDate,
        popular,
        active
      }
    });

  } catch (err) {
    console.error("❌ GET API Error:", err);
    console.error("❌ Error details:", {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    return Response.json({ 
      success: false,
      error: "Failed to fetch blogs",
      details: err.message 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('🔍 POST /api/internal/blogs - Request body:', body);
    console.log('🔍 POST /api/internal/blogs - Request body keys:', Object.keys(body));
    console.log('🔍 POST /api/internal/blogs - Request body has description:', 'description' in body);
    console.log('🔍 POST /api/internal/blogs - Request body has short_description:', 'short_description' in body);
    
    const {
      title,
      slug,
      category_id,
      short_description,
      description,
      image,
      is_featured = false,
      is_active = true,
      user_id = 1, // Default user ID, can be made dynamic later
      enable_meta_tags = false,
      custom_post_type = 'blog',
      seo = '',
      post_attributes = '',
      sm_question = '',
      sm_answer = '',
      review_detail = ''
    } = body;

    console.log('🔍 POST /api/internal/blogs - Extracted description:', description);
    console.log('🔍 POST /api/internal/blogs - Description type:', typeof description);
    console.log('🔍 POST /api/internal/blogs - Description length:', description?.length);
    console.log('🔍 POST /api/internal/blogs - Description content preview:', description?.substring(0, 100));
    console.log('🔍 POST /api/internal/blogs - Extracted short_description:', short_description);
    console.log('🔍 POST /api/internal/blogs - Short description type:', typeof short_description);
    console.log('🔍 POST /api/internal/blogs - Short description length:', short_description?.length);

    // Validation
    const errors = [];
    if (!title?.trim()) errors.push('Title is required');
    if (!slug?.trim()) errors.push('Slug is required');
    if (!category_id) errors.push('Category is required');
    
    if (errors.length > 0) {
      console.error('Validation failed:', { errors, body });
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors },
        { status: 400 }
      );
    }

    // Check if category exists
    const categoryExists = await prisma.blog_category.findUnique({
      where: { id: Number(category_id) },
    });

    if (!categoryExists) {
      return NextResponse.json(
        { success: false, message: 'Invalid category' },
        { status: 400 }
      );
    }

    // Check if slug is unique
    const existingSlug = await prisma.blogs.findFirst({
      where: { 
        slug: slug.trim()
      }
    });

    if (existingSlug) {
      return NextResponse.json(
        { success: false, message: 'A blog with this slug already exists' },
        { status: 400 }
      );
    }

    // Create blog post
    const blogData = {
      title: title.trim(),
      slug: slug.trim(),
      category_id: Number(category_id),
      short_description: short_description?.trim() || null,
      description: description?.trim() || null,
      image: image?.trim() || null,
      is_featured: Boolean(is_featured),
      is_active: Boolean(is_active),
      enable_meta_tags: Boolean(enable_meta_tags),
      user_id: Number(user_id),
      custom_post_type: custom_post_type.trim(),
      seo: seo?.trim() || null,
      post_attributes: post_attributes?.trim() || null,
      sm_question: sm_question?.trim() || null,
      sm_answer: sm_answer?.trim() || null,
      review_detail: review_detail?.trim() || null
    };

    console.log('🔍 POST /api/internal/blogs - Data being saved to database:', blogData);
    console.log('🔍 POST /api/internal/blogs - Description being saved:', blogData.description);
    console.log('🔍 POST /api/internal/blogs - Short description being saved:', blogData.short_description);
    console.log('🔍 POST /api/internal/blogs - Description field type in blogData:', typeof blogData.description);
    console.log('🔍 POST /api/internal/blogs - Short description field type in blogData:', typeof blogData.short_description);
    
    // Test if description field is properly set
    console.log('🔍 POST /api/internal/blogs - blogData has description key:', 'description' in blogData);
    console.log('🔍 POST /api/internal/blogs - blogData description value:', blogData['description']);

    const blog = await prisma.blogs.create({
      data: blogData
    });

    console.log('✅ Blog post created successfully:', { blogId: blog.id, title: blog.title });
    console.log('🔍 POST /api/internal/blogs - Retrieved blog data:', blog);
    console.log('🔍 POST /api/internal/blogs - Retrieved description:', blog.description);
    console.log('🔍 POST /api/internal/blogs - Retrieved short_description:', blog.short_description);

    return NextResponse.json({ 
      success: true, 
      message: 'Blog post created successfully',
      data: blog
    }, { status: 201 });

  } catch (error) {
    console.error('❌ POST /api/internal/blogs error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create blog post',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}