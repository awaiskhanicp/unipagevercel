

import { NextResponse } from 'next/server';
import pool from '../../../../lib/db/db';
import { RowDataPacket } from "mysql2";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').trim();
    const siteType = (searchParams.get('site_type') || '').trim(); // 'onsite' | 'remote' | ''
    const status = (searchParams.get('status') || '').trim(); // 'active' | 'inactive' | ''
    const startDate = (searchParams.get('start_date') || '').trim();
    const endDate = (searchParams.get('end_date') || '').trim();

    const [rows] = await pool.query('SELECT * FROM job_opprtunities');

    if(rows.length === 0) {
      return Response.json([]);
    }

    const transformedJobs = rows.map(row => ({
      ...row,
      site_based: row.site_based === 'true',
    }));

    return NextResponse.json(transformedJobs)

    /*const where = {};

    if (search) {
      const tokens = search.split(/\s+/).filter(Boolean);
      const tokenClauses = tokens.map(t => ({
        OR: [
          { title: { contains: t } },
          { job_type: { contains: t } },
          { city: { contains: t } },
          { province: { contains: t } },
          { country: { contains: t } },
          { skills: { contains: t } },
          { description: { contains: t } },
          { requirements: { contains: t } },
          { responsibilities: { contains: t } },
        ]
      }));
      if (tokenClauses.length > 0) {
        where.AND = (where.AND || []).concat(tokenClauses);
      }
    }

    if (siteType) {
      // DB stores site_based as String ('true' | 'false')
      if (siteType === 'onsite') where.site_based = 'true';
      if (siteType === 'remote') where.site_based = 'false';
    }

    if (status) {
      // DB stores post_status as Int (1 for active, 0 for inactive)
      if (status === 'active') where.post_status = 1;
      if (status === 'inactive') where.post_status = 0;
    }

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) {
        const start = new Date(startDate + 'T00:00:00Z');
        if (!isNaN(start)) {
          where.created_at.gte = start;
        }
      }
      if (endDate) {
        const end = new Date(endDate + 'T23:59:59Z');
        if (!isNaN(end)) {
          where.created_at.lte = end;
        }
      }
    }

    const jobs = await prisma.job_opprtunities.findMany({
      where,
      orderBy: { created_at: "desc" },
    });

    const transformedJobs = jobs.map(job => ({
      ...job,
      site_based: job.site_based === 'true',
    }));*/

    return Response.json(transformedJobs);
  } catch (error) {
    console.error("Database error:", error);
    return Response.json(
      { 
        error: "Failed to fetch jobs",
        details: {
          message: error.message,
          code: error.code,
          meta: error.meta
        }
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request) {
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
      return Response.json({ error: "Title and job_type are required" }, { status: 400 });
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
      site_based: site_based ? "true" : "false",
      skills: Array.isArray(skills) ? skills.join(",") : "",
      experience: experience?.trim() || "",
      requirements: requirements || "",
      responsibilities: responsibilities || "",
      description: description || "",
      mail_status: 0, // 0 for pending
      post_status: 1, // 1 for active, 0 for inactive
    };

    console.log('Processed job data:', jobData);

    const job = await prisma.job_opprtunities.create({
      data: jobData,
    });
    
    console.log('Job created successfully:', job);
    return Response.json(job, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return Response.json({ 
      error: "Failed to create job", 
      details: error.message 
    }, { status: 500 });
  }
}