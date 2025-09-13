import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import pool from '../../../../../lib/db/db';
import { ResultSetHeader } from 'mysql2';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Helper function to get form fields
    const field = (name: string): FormDataEntryValue | null => formData.get(name) || null;

    const name = field('name');
    const email = field('email');
    const phone_number = field('phone_number');
    const start_date = field('start_date');
    const job_id = field('job_id');
    const resumeFile = field('resume');

    if (!name || !email || !job_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let startDateString = null;
    if (start_date && typeof start_date === 'string') {
    const dateObj = new Date(start_date);
    if (isNaN(dateObj.getTime())) {
        return NextResponse.json({ error: 'Invalid start_date' }, { status: 400 });
    }
    // Store as string because Prisma schema expects String for start_date
    startDateString = dateObj.toISOString();
    } else {
    return NextResponse.json({ error: 'start_date must be a valid string' }, { status: 400 });
    }

    // Handle resume file upload
    let resumePath = null;
    if (resumeFile && resumeFile instanceof File) { // Check if resumeFile is an instance of File
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
    } else {
    return NextResponse.json({ error: 'No file uploaded or invalid file' }, { status: 400 });
    }


    const query = `
      INSERT INTO job_applies (name, email, phone_number, start_date, resume, job_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [name, email, phone_number, startDateString, resumePath, job_id];

    const [result] = await pool.query<ResultSetHeader>(query, values)

    if(result.affectedRows === 0) {
      return NextResponse.json({ error: 'Failed to Submit Application' }, { status: 500 });
    }

    return NextResponse.json({message: "Application submitted successfully"}, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });

  }
}