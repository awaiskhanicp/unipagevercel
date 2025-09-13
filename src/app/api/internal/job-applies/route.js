
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db/db';

export async function GET(req) {
  try {
    // Check if this is a test request
    const { searchParams } = new URL(req.url);
    if (searchParams.get('test') === 'true') {
      // Perform a simple test query for connection and data count
      const [countResult] = await pool.execute('SELECT COUNT(*) AS totalCount FROM job_applies');
      const [sampleData] = await pool.execute('SELECT * FROM job_applies LIMIT 1');
      return NextResponse.json({
        success: true,
        message: 'MySQL connection test successful',
        totalCount: countResult[0].totalCount,
        sampleData
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

    // Build the WHERE clause for search and date filtering
    let whereClause = '';
    let queryParams = [];

    // Search filter
    if (searchTerm) {
      whereClause += ` AND (name LIKE ? OR email LIKE ? OR phone_number LIKE ?)`;
      queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
    }

    // Date range filters
    if (startDate || endDate) {
      if (startDate) {
        whereClause += ` AND created_at >= ?`;
        queryParams.push(new Date(startDate + 'T00:00:00').toISOString().slice(0, 19).replace('T', ' '));
      }
      if (endDate) {
        whereClause += ` AND created_at <= ?`;
        queryParams.push(new Date(endDate + 'T23:59:59').toISOString().slice(0, 19).replace('T', ' '));
      }
    }

    // Get total count with filters
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) AS totalItems FROM job_applies WHERE 1=1 ${whereClause}`,
      queryParams
    );
    const totalItems = countResult[0].totalItems;

    console.log('Count query successful. Total items:', totalItems);

    // Get applications with pagination
    const [applications] = await pool.execute(
      `SELECT * FROM job_applies WHERE 1=1 ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...queryParams, limit, skip]
    );

    console.log('Find query successful. Applications found:', applications.length);

    // Get job details for each application (only for current page)
    const applicationsWithJobDetails = await Promise.all(
      applications.map(async (app) => {
        let jobDetails = null;
        try {
          // Get job details for the application
          const [jobData] = await pool.execute(
            `SELECT title, job_type, city, province, country FROM job_opprtunities WHERE id = ?`,
            [app.job_id]
          );
          jobDetails = jobData[0] || null;
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
