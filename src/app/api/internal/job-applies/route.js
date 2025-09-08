import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req) {
  try {
    const formData = await req.formData();

    // Helper function to get form fields
    const field = (name) => formData.get(name) || null;

    const name = field('name');
    const email = field('email');
    const phone_number = field('phone_number');
    const start_date = field('start_date');
    const job_id = field('job_id');
    const resumeFile = field('resume');

    if (!name || !email || !job_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate start_date if provided
    let startDateString = null;
    if (start_date) {
      const dateObj = new Date(start_date);
      if (isNaN(dateObj.getTime())) {
        return NextResponse.json({ error: 'Invalid start_date' }, { status: 400 });
      }
      // Store as string because Prisma schema expects String for start_date
      startDateString = dateObj.toISOString();
    }

    // Handle resume file upload
    let resumePath = null;
    if (resumeFile && resumeFile.name) {
      // Validate file type
      if (resumeFile.type !== 'application/pdf') {
        return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
      }

      const buffer = Buffer.from(await resumeFile.arrayBuffer());
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');
      await mkdir(uploadsDir, { recursive: true });
      
      const fileName = `${Date.now()}-${resumeFile.name.replace(/\s+/g, '-')}`;
      await writeFile(path.join(uploadsDir, fileName), buffer);
      resumePath = `/uploads/resumes/${fileName}`;
    }

    const newApply = await prisma.job_applies.create({
      data: {
        name,
        email,
        phone_number,
        start_date: startDateString,
        resume: resumePath, // Store the file path instead of base64
        job_id: String(job_id),
      },
    });

    return NextResponse.json(newApply, { status: 201 });
  } catch (error) {
    console.error(error);
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return NextResponse.json(
        { error: 'This email has already been used to apply for a job.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create application', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    // Test basic Prisma connectivity
    try {
      const testCount = await prisma.job_applies.count();
      console.log('Prisma connection test successful. Total applications in DB:', testCount);
      
      // Test a simple findMany without filters
      const testApplications = await prisma.job_applies.findMany({
        take: 1,
        orderBy: { created_at: 'desc' }
      });
      console.log('Basic findMany test successful. Sample application:', testApplications[0] ? 'Found' : 'None');
      
    } catch (prismaError) {
      console.error('Prisma connection test failed:', prismaError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Database connection failed', 
          details: prismaError.message 
        }, 
        { status: 500 }
      );
    }

    // Check if this is a test request
    const { searchParams } = new URL(req.url);
    if (searchParams.get('test') === 'true') {
      return NextResponse.json({
        success: true,
        message: 'Prisma connection test successful',
        totalCount: await prisma.job_applies.count(),
        sampleData: await prisma.job_applies.findMany({ take: 1 })
      });
    }

    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    const limitParam = parseInt(searchParams.get('limit') || '15', 10);
    const searchTerm = searchParams.get('search') || '';
    const startDate = searchParams.get('start_date') || '';
    const endDate = searchParams.get('end_date') || '';
    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const limit = Number.isNaN(limitParam) || limitParam < 1 ? 15 : limitParam;
    const skip = (page - 1) * limit;

    console.log('Fetching job applications with params:', { page, limit, skip, searchTerm, startDate, endDate });

    // Build where clause for search and date filtering
    let whereClause = {};
    
    // Search filter
    if (searchTerm) {
      whereClause.OR = [
        { name: { contains: searchTerm } },
        { email: { contains: searchTerm } },
        { phone_number: { contains: searchTerm } },
      ];
    }
    
    // Date range filters
    if (startDate || endDate) {
      whereClause.created_at = {};
      if (startDate) {
        try {
          // For MySQL compatibility, create date at start of day
          const startDateTime = new Date(startDate + 'T00:00:00');
          if (!isNaN(startDateTime.getTime())) {
            whereClause.created_at.gte = startDateTime;
            console.log('Start date filter:', startDateTime);
          }
        } catch (error) {
          console.warn('Invalid start date format:', startDate, error);
        }
      }
      if (endDate) {
        try {
          // For MySQL compatibility, create date at end of day
          const endDateTime = new Date(endDate + 'T23:59:59');
          if (!isNaN(endDateTime.getTime())) {
            whereClause.created_at.lte = endDateTime;
            console.log('End date filter:', endDateTime);
          }
        } catch (error) {
          console.warn('Invalid end date format:', endDate, error);
        }
      }
    }

    console.log('Final where clause:', JSON.stringify(whereClause, null, 2));

    // Test the where clause with a simple count first
    let totalItems = 0;
    try {
      totalItems = await prisma.job_applies.count({ where: whereClause });
      console.log('Count query successful. Total items:', totalItems);
    } catch (countError) {
      console.error('Count query failed:', countError);
      
      // Fallback: try without search filters if they exist
      if (searchTerm || startDate || endDate) {
        console.log('Attempting fallback query without filters...');
        try {
          totalItems = await prisma.job_applies.count();
          console.log('Fallback count query successful. Total items:', totalItems);
          
          // Reset where clause for fallback
          whereClause = {};
          console.log('Using fallback where clause (no filters)');
        } catch (fallbackError) {
          console.error('Fallback query also failed:', fallbackError);
          return NextResponse.json(
            { 
              success: false,
              error: 'Failed to count applications even without filters', 
              details: fallbackError.message 
            }, 
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { 
            success: false,
            error: 'Failed to count applications', 
            details: countError.message 
          }, 
          { status: 500 }
        );
      }
    }

    // Get applications with pagination
    let applications = [];
    try {
      applications = await prisma.job_applies.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
        skip, // Skip previous pages
        take: limit, // Take only current page data
      });
      console.log('FindMany query successful. Applications found:', applications.length);
    } catch (findError) {
      console.error('FindMany query failed:', findError);
      
      // Fallback: try without filters if they exist
      if (searchTerm || startDate || endDate) {
        console.log('Attempting fallback findMany query without filters...');
        try {
          applications = await prisma.job_applies.findMany({
            orderBy: { created_at: 'desc' },
            skip,
            take: limit,
          });
          console.log('Fallback findMany query successful. Applications found:', applications.length);
        } catch (fallbackError) {
          console.error('Fallback findMany query also failed:', fallbackError);
          return NextResponse.json(
            { 
              success: false,
              error: 'Failed to fetch applications even without filters', 
              details: fallbackError.message 
            }, 
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { 
            success: false,
            error: 'Failed to fetch applications', 
            details: findError.message 
          }, 
          { status: 500 }
        );
      }
    }

    console.log('Raw applications found for page:', page, 'Count:', applications.length, 'Search term:', searchTerm, 'Date range:', { startDate, endDate });

    // Get job details for each application (only for current page)
    const applicationsWithJobDetails = await Promise.all(
      applications.map(async (app) => {
        let jobDetails = null;
        try {
          // Try to find the job by ID (assuming job_id matches job_opprtunities.id)
          if (app.job_id && app.job_id.trim() !== '') {
            console.log('Looking for job with ID:', app.job_id);
            
            // Try to parse as integer first
            const jobIdInt = parseInt(app.job_id);
            if (!isNaN(jobIdInt)) {
              jobDetails = await prisma.job_opprtunities.findFirst({
                where: { id: jobIdInt },
                select: {
                  title: true,
                  job_type: true,
                  city: true,
                  province: true,
                  country: true
                }
              });
            }
            
            // If no job found with integer ID, try string matching
            if (!jobDetails && app.job_id) {
              jobDetails = await prisma.job_opprtunities.findFirst({
                where: { id: app.job_id },
                select: {
                  title: true,
                  job_type: true,
                  city: true,
                  province: true,
                  country: true
                }
              });
            }
            
            console.log('Job details found:', jobDetails);
          }
        } catch (error) {
          console.warn(`Could not fetch job details for job_id: ${app.job_id}`, error);
        }

        return {
          id: app.id,
          name: app.name,
          email: app.email,
          phone_number: app.phone_number,
          start_date: app.start_date,
          resume: app.resume,
          job_id: app.job_id,
          created_at: app.created_at,
          job_title: jobDetails?.title || 'N/A',
          job_type: jobDetails?.job_type || 'N/A',
          location: jobDetails ? [jobDetails.city, jobDetails.province, jobDetails.country]
            .filter(Boolean)
            .join(', ') : 'N/A'
        };
      })
    );

    console.log('Processed applications for page:', page, 'Count:', applicationsWithJobDetails.length);

    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    
    return NextResponse.json({ 
      success: true,
      data: applicationsWithJobDetails, // Only current page data
      meta: { 
        page, 
        limit, 
        totalItems, 
        totalPages, 
        startIndex: skip, 
        endIndex: skip + applicationsWithJobDetails.length,
        searchTerm,
        startDate,
        endDate
      } 
    });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch applications', 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}