

import { NextRequest } from 'next/server';
import pool from '../../../../lib/db/db';
import { ResultSetHeader, RowDataPacket } from "mysql2";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').trim();
    const siteType = (searchParams.get('site_type') || '').trim(); // 'onsite' | 'remote' | ''
    
    // Pagination parameters
    const limit = parseInt(searchParams.get('items_per_page') || '10'); // Default limit of 10 items per page
    const page = parseInt(searchParams.get('page') || '1');  // Default to the first page
    const offset = (page - 1) * limit;  // Calculate offset for pagination

    let whereClauses: string[] = [];
    let values: string[] = [];

    if (search) {
      const tokens = search.split(/\s+/).filter(Boolean);
      tokens.forEach((t) => {
        whereClauses.push(`(title LIKE ? OR job_type LIKE ? OR city LIKE ? OR province LIKE ? OR country LIKE ? OR skills LIKE ? OR description LIKE ? OR requirements LIKE ? OR responsibilities LIKE ?)`);
        values.push(`%${t}%`, `%${t}%`, `%${t}%`, `%${t}%`, `%${t}%`, `%${t}%`, `%${t}%`, `%${t}%`, `%${t}%`);
      });
    }

    if (siteType) {
      if (siteType === 'onsite') {
        whereClauses.push(`site_based = 1`);
      } else if (siteType === 'remote') {
        whereClauses.push(`site_based = 0`);
      }
    }

    let whereClause = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    // Pagination SQL query
    const query = `
      SELECT * FROM job_opprtunities ${whereClause} 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?`;

    const [jobs] = await pool.execute<RowDataPacket[]>(query, [...values, limit, offset]);

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) AS total FROM job_opprtunities ${whereClause}`;
    const [countResults] = await pool.execute<RowDataPacket[]>(countQuery, values);
    const totalJobs = countResults[0].total;
    const totalPages = Math.ceil(totalJobs / limit);

    return Response.json({
      jobs: jobs,
      currentPage: page,
      totalPages,
      totalJobs,
    });
  } catch (error) {
    console.error('Database error:', error);
    return Response.json(
      {
        error: 'Failed to fetch jobs',
        details: {
          message: error.message,
          code: error.code,
          meta: error.meta,
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {

  try {
    const body = await request.json();
    console.log('Received job data:', body);
    
    let {
      title, job_type, city, province, country,
      site_based, skills, experience,
      requirements, responsibilities, description,
    } = body;

    // Validate required fields
    if (!title || !job_type) {
      return Response.json({ message: "Title and job_type are required" }, { status: 400 });
    }

    // Parse skills if it's a stringified array
    if (typeof skills === "string") {
      try {
        skills = JSON.parse(skills);
      } catch {
        skills = skills.split(",").map((s) => s.trim());
      }
    }

    const jobData = {
      title: title.trim(),
      job_type: job_type.trim(),
      city: city?.trim() || "",
      province: province?.trim() || "",
      country: country?.trim() || "",
      site_based: site_based ? 1 : 0, // 1 for true, 0 for false
      skills: Array.isArray(skills) ? skills.join(",") : "",
      experience: experience?.trim() || "",
      requirements: requirements || "",
      responsibilities: responsibilities || "",
      description: description || "",
      post_status: 1, // 1 for active, 0 for inactive
    };

    // Using mysql2 pool to insert job data into the database
    const [rows] = await pool.execute<ResultSetHeader>(
      'INSERT INTO job_opprtunities (title, job_type, city, province, country, site_based, skills, experience, requirements, responsibilities, description, post_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        jobData.title,
        jobData.job_type,
        jobData.city,
        jobData.province,
        jobData.country,
        jobData.site_based,
        jobData.skills,
        jobData.experience,
        jobData.requirements,
        jobData.responsibilities,
        jobData.description,
        jobData.post_status,
      ]
    );

    if(rows.affectedRows === 0) {
      return Response.json({ error: "Failed to create job" }, { status: 500 });
    }

    return Response.json({ id: rows.insertId, ...jobData, message: "Job created successfully" }, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return Response.json({ 
      message: "Failed to create job", 
    }, { status: 500 });
  }
}
