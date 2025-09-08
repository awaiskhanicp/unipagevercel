import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';


export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, phone_number, start_date, resume, job_id } = body;

    if (!name || !email || !job_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newApply = await prisma.job_applies.create({
      data: {
        name,
        email,
        phone_number,
        start_date: start_date ? new Date(start_date) : undefined,
        resume,
        job_id: Number(job_id),
      },
    });

    return NextResponse.json(newApply, { status: 201 });
  } catch (error) {
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

export async function GET() {
  try {
    const applications = await prisma.job_applies.findMany({
      orderBy: { created_at: 'desc' },
    });
    return NextResponse.json(applications);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch applications', details: error.message },
      { status: 500 }
    );
  }
}