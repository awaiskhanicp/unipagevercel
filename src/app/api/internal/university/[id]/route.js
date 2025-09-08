// app/api/internal/auth/users/[id]/route.js
import { auth } from "../../../../../auth";
import { prisma } from '../../../../../lib/prisma';

export async function GET(request, { params }) {
  
  const { id: slug } = params;
  
  try {
    // Use findFirst instead of findUnique since slug isn't marked as @unique
    const university = await prisma.university_details.findFirst({
      where: { 
        slug: slug,
        display: true,
        active: true
      }
    });

    if (!university) {
      return Response.json(
        { error: 'University not found' }, 
        { status: 404 }
      );
    }

    // Fetch country information if university has a country
    let countryData = null;
    if (university.country) {
      try {
        countryData = await prisma.countries.findFirst({
          where: {
            country: university.country
          },
          select: {
            consultation_fee: true,
            consultation_fee_discount: true,
            currency: true
          }
        });
      } catch (countryError) {
        console.error(`Error fetching country data for ${university.country}:`, countryError);
        countryData = null;
      }
    }

    // Combine university data with country data
    const responseData = {
      ...university,
      country_info: countryData ? {
        consultation_fee: countryData.consultation_fee,
        consultation_fee_discount: countryData.consultation_fee_discount,
        currency: countryData.currency
      } : null
    };

    return Response.json(responseData, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching university:', error);
    return Response.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  
  if (!id || isNaN(parseInt(id))) {
    return Response.json({ error: 'Invalid university ID' }, { status: 400 });
  }
  
  const data = await request.json();

  try {
    // Helper functions for data processing
    const safeParseJson = (value) => {
      if (!value) return null;
      if (typeof value === 'object') return value;
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (e) {
          return value;
        }
      }
      return value;
    };

    const convertArrayToString = (value) => {
      if (Array.isArray(value)) {
        return JSON.stringify(value);
      }
      return value;
    };

    // Process data fields
    const phoneNo = data.phone_no?.trim() ? 
      BigInt(data.phone_no.replace(/\D/g, '')) : null;
    
    const totalStudents = data.total_students ? 
      parseInt(data.total_students) : null;
    
    const internationalStudent = data.international_student ? 
      parseInt(data.international_student) : null;
    
    const rankingValue = data.ranking?.trim() ? 
      parseFloat(data.ranking) : null;
    
    const scholarshipValue = data.scholarship === 'true' || data.scholarship === true;

    // Prepare final data for Prisma
    const finalData = {
      name: data.name,
      founded_in: data.founded_in,
      country: data.country,
      city: data.city,
      address: data.address,
      postcode: data.postcode,
      phone_no: phoneNo,
      agency_number: data.agency_number,
      total_students: totalStudents,
      international_student: internationalStudent,
      scholarship: scholarshipValue,
      about: data.about,
      guide: data.guide,
      expanse: data.expanse,
      languages: data.languages,
      accommodation: data.accommodation,
      accommodation_detail: data.accommodation_detail,
      intake: data.intake,
      ranking: rankingValue,
      designation: data.designation,
      alternate_email: data.alternate_email,
      website: data.website,
      popular: data.popular === 'true' || data.popular === true,
      sm_question: convertArrayToString(safeParseJson(data.sm_question)),
      sm_answer: convertArrayToString(safeParseJson(data.sm_answer)),
      review_detail: convertArrayToString(safeParseJson(data.review_detail)),
      logo: data.logo_url || null,
      feature_image: data.feature_image_url || null,
    };

    const updatedUniversity = await prisma.university_details.update({
      where: { id: parseInt(id) },
      data: finalData,
    });

    return Response.json(updatedUniversity, { status: 200 });
  } catch (error) {
    console.error('Error updating university:', error);
    
    if (error.code === 'P2002') {
      return Response.json({ error: 'University with this name already exists' }, { status: 400 });
    } else if (error.code === 'P2025') {
      return Response.json({ error: 'University not found' }, { status: 404 });
    }
    return Response.json({ 
      error: 'Failed to update university', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  try {
    await prisma.university_details.delete({
      where: { id: parseInt(id) },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting university:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  const data = await request.json();

  try {
    const updatedUniversity = await prisma.university_details.update({
      where: { id: parseInt(id) },
      data: {
        popular: data.popular === 'true' || data.popular === true,
      },
    });
    return Response.json(updatedUniversity, { status: 200 });
  } catch (error) {
    console.error('Error updating university (PATCH):', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}