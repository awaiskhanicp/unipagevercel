import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const std = searchParams.get('std');
  const i = searchParams.get('i');
  let student_id = std || i;
  if (!student_id) {
    return NextResponse.json({ error: 'Missing student id' }, { status: 400 });
  }
  const resume = await prisma.resume.findFirst({ where: { student_id } });
  if (!resume) {
    return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
  }
  if (std) {
    // Use link_status as the edit count (string)
    let count = 0;
    if (resume.link_status && !isNaN(Number(resume.link_status))) {
      count = Number(resume.link_status);
    }
    if (count >= 3) {
      return NextResponse.json({ error: 'Edit limit reached' }, { status: 403 });
    }
    await prisma.resume.update({
      where: { id: resume.id },
      data: {
        link_status: String(count + 1),
      },
    });
  }
  // Parse JSON fields
  const parseField = (f) => { try { return JSON.parse(f); } catch { return f; } };
  const result = {
    id: resume.id,
    studentId: resume.student_id,
    fullName: resume.full_name,
    email: resume.email,
    emailStatus: resume.email_status,
    link_status: resume.link_status,
    phoneNumber: resume.phone_number,
    gender: resume.gender,
    dateOfBirth: resume.birth_date,
    nationality: resume.nationality,
    aboutYourself: resume.about_yourself,
    profileImage: resume.profile_image,
    postalCode: resume.postal_code,
    city: resume.city,
    country: resume.country,
    address: resume.address,
    education_details: parseField(resume.education_details),
    experience_details: parseField(resume.experience_details),
    skills: parseField(resume.skills),
    languages: parseField(resume.languages),
    driving_licence: parseField(resume.driving_licence),
    hobbies_and_interest: parseField(resume.hobbies_and_interest),
    awards: parseField(resume.awards),
    projects: parseField(resume.projects),
    motherLanguage: resume.mother_language,
    createdAt: resume.created_at,
    updatedAt: resume.updated_at,
  };
  return NextResponse.json(result);
}