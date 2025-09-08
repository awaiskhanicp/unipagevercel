import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(req) {
  try {
    const data = await req.json();
    console.log('Received data:', data);
    
    // Map form fields to model fields
    const {
      fullName,
      email,
      phoneNumber,
      gender,
      dateOfBirth,
      nationality,
      aboutYourself,
      profileImage,
      postalCode,
      city,
      country,
      address,
      educations,
      experiences,
      skills,
      languages,
      drivingLicenses,
      hobbies,
      awards,
      projects
    } = data;

    console.log('Required fields check:', {
      fullName: !!fullName,
      email: !!email,
      phoneNumber: !!phoneNumber,
      gender: !!gender,
      dateOfBirth: !!dateOfBirth,
      nationality: !!nationality,
      city: !!city,
      country: !!country,
      address: !!address
    });

    // Validate required fields
    if (!fullName || !email || !phoneNumber || !gender || !dateOfBirth || !nationality || !city || !country || !address) {
      const missingFields = [];
      if (!fullName) missingFields.push('fullName');
      if (!email) missingFields.push('email');
      if (!phoneNumber) missingFields.push('phoneNumber');
      if (!gender) missingFields.push('gender');
      if (!dateOfBirth) missingFields.push('dateOfBirth');
      if (!nationality) missingFields.push('nationality');
      if (!city) missingFields.push('city');
      if (!country) missingFields.push('country');
      if (!address) missingFields.push('address');
      
      console.log('Missing fields:', missingFields);
      return NextResponse.json({ 
        success: false, 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    // Validate gender enum values and convert to proper case
    const validGenders = ['Male', 'Female', 'Other'];
    const normalizedGender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
    console.log('Gender validation:', { 
      received: gender, 
      normalized: normalizedGender,
      valid: validGenders, 
      isValid: validGenders.includes(normalizedGender) 
    });
    
    if (!validGenders.includes(normalizedGender)) {
      return NextResponse.json({ success: false, error: 'Invalid gender value. Must be Male, Female, or Other.' }, { status: 400 });
    }

    // Validate date format
    console.log('Date validation:', { received: dateOfBirth, isValid: !isNaN(new Date(dateOfBirth).getTime()) });
    if (!dateOfBirth || isNaN(new Date(dateOfBirth).getTime())) {
      return NextResponse.json({ success: false, error: 'Invalid date of birth format.' }, { status: 400 });
    }

    // Save to database
    const resume = await prisma.resumes.create({
      data: {
        student_id: 'test-student', // Dummy value for now
        full_name: fullName,
        email,
        phone_number: phoneNumber,
        gender: normalizedGender, // Use the exact enum value
        birth_date: new Date(dateOfBirth),
        nationality,
        about_yourself: aboutYourself,
        profile_image: profileImage,
        postal_code: postalCode,
        city,
        country,
        address,
        education_details: educations ? JSON.stringify(educations) : undefined,
        experience_details: experiences ? JSON.stringify(experiences) : undefined,
        skills: skills ? JSON.stringify(skills) : undefined,
        languages: languages ? JSON.stringify(languages) : undefined,
        driving_licence: drivingLicenses ? JSON.stringify(drivingLicenses) : undefined,
        hobbies_and_interest: hobbies ? JSON.stringify(hobbies) : undefined,
        awards: awards ? JSON.stringify(awards) : undefined,
        projects: projects ? JSON.stringify(projects) : undefined,
      },
    });

    return NextResponse.json({ success: true, resume });
  } catch (error) {
    console.error('Resume creation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}