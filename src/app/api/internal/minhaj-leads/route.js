import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      full_name,
      roll_number,
      department,
      email,
      last_education,
      country,
      city,
      interested_country,
      apply_for,
      whatsapp_number,
    } = body;

    const newLead = await prisma.minhaj_university_leads.create({
      data: {
        full_name,
        roll_number,
        department,
        email,
        last_education,
        country,
        city,
        interested_country,
        apply_for,
        whatsapp_number,
      },
    });

    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}