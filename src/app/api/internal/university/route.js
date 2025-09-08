// app/api/internal/university/route.js
import { auth } from "../../../../auth";
import slugify from 'slugify';
import { prisma } from '../../../../lib/prisma';

// Helper function to validate JSON fields
const validateJsonField = (field, fieldName) => {
  if (!field || field === '') return { valid: true, value: null };

  // If it's already an object (might happen if sent as FormData)
  if (typeof field === 'object') return { valid: true, value: field };

  try {
    const parsed = JSON.parse(field);
    return { valid: true, value: parsed };
  } catch (e) {
    console.log(`JSON validation failed for ${fieldName}:`, field, e.message);
    return {
      valid: false,
      error: `Invalid ${fieldName} format. Must be valid JSON. Received: ${field}`
    };
  }
};

// Custom JSON stringifier that handles BigInt
const safeJsonStringify = (obj) => {
  return JSON.stringify(obj, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value
  );
};

export async function POST(request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json(
      { error: 'Unauthorized - No valid session found' }, 
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    // Collect all validation errors
    const errors = [];
    if (!data.name) errors.push('University name is required');
    if (!data.country) errors.push('Country is required');

    // Validate JSON fields
    const smQuestionValidation = validateJsonField(data.sm_question, 'sm_question');
    const smAnswerValidation = validateJsonField(data.sm_answer, 'sm_answer');
    const reviewDetailValidation = validateJsonField(data.review_detail, 'review_detail');

    if (!smQuestionValidation.valid) errors.push(smQuestionValidation.error);
    if (!smAnswerValidation.valid) errors.push(smAnswerValidation.error);
    if (!reviewDetailValidation.valid) errors.push(reviewDetailValidation.error);

    // Validate ranking - must be a number if provided
    if (data.ranking && data.ranking.trim() !== '') {
      const rankingNum = parseFloat(data.ranking);
      if (isNaN(rankingNum)) {
        errors.push('Ranking must be a valid number');
      }
    }

    if (errors.length > 0) {
      return Response.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = slugify(data.name, { lower: true, strict: true });

    // Check for existing university
    const existingUniversity = await prisma.university_details.findFirst({
      where: { 
        slug: slug,
        display: true
      },
    });

    if (existingUniversity) {
      return Response.json(
        { error: 'University with this name already exists' }, 
        { status: 400 }
      );
    }

    // Handle numeric fields
    const totalStudents = data.total_students ? parseInt(data.total_students) : null;
    const internationalStudent = data.international_student ? parseInt(data.international_student) : null;

    // Handle ranking - only set if valid
    const rankingValue = data.ranking && !isNaN(parseFloat(data.ranking)) 
      ? parseFloat(data.ranking) 
      : null;

    // Handle boolean fields
    const isPopular = data.popular === 'true';
    const hasScholarship = data.scholarship === 'true';

    // Handle phone number - remove all non-digit characters and convert to string
    const phoneNo = data.phone_no ? data.phone_no.replace(/\D/g, '') : null;

    // Handle image URLs
    const featureImage = data.feature_image_url || data.feature_image || null;
    const logo = data.logo_url || data.logo || null;

    // Create university
    const userId = parseInt(session.user.id);
    const university = await prisma.university_details.create({
      data: {
        name: data.name,
        slug,
        founded_in: data.founded_in || null,
        country: data.country || null,
        city: data.city || null,
        address: data.address || null,
        postcode: data.postcode || null,
        phone_no: phoneNo ? BigInt(phoneNo) : null,
        agency_number: data.agency_number || null,
        total_students: totalStudents,
        international_student: internationalStudent,
        scholarship: hasScholarship,
        about: data.about || '',
        guide: data.guide || '',
        expanse: data.expanse || '',
        languages: data.languages || null,
        accommodation: data.accommodation || '',
        accommodation_detail: data.accommodation_detail || '',
        intake: data.intake || null,
        ranking: rankingValue,
        designation: data.designation || null,
        alternate_email: data.alternate_email || null,
        website: data.website || null,
        popular: isPopular,
        sm_question: JSON.stringify(smQuestionValidation.value),
        sm_answer: JSON.stringify(smAnswerValidation.value),
        review_detail: JSON.stringify(reviewDetailValidation.value),
        user_id: userId,
        feature_image: featureImage,
        logo: logo,
        active: true,
        display: true,
        package: "free"
      },
    });

    // Convert the university object to a plain object and handle BigInt
    const responseData = {
      ...university,
      phone_no: university.phone_no ? university.phone_no.toString() : null
    };

    return new Response(safeJsonStringify(responseData), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error creating university:', error);
    return Response.json(
      { 
        error: 'Internal server error',
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}

// Helper function to validate JSON fields
function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

export async function GET(request) {
  try {
    // First verify database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('🔍 Database connection successful');

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const country = searchParams.get('country') || '';
    const type = searchParams.get('type') || '';
    const scholarship = searchParams.get('scholarship') || '';
    const qualifications = searchParams.get('qualification') || '';

    console.log('🔍 University API called with params:', { page, limit, search, country, scholarship, qualifications });

    // Simple health check - count total universities
    try {
      const totalUniversities = await prisma.university_details.count();
      console.log('🔍 Total universities in database:', totalUniversities);
    } catch (error) {
      console.error('🔍 Error counting universities:', error);
      return Response.json({
        success: false,
        error: 'Database table access failed',
        details: error.message
      }, { status: 500 });
    }

    // If ID is provided, return single university with all details
    if (id) {
      const university = await prisma.university_details.findUnique({
        where: { id: parseInt(id) },
      });

      if (!university) {
        return Response.json(
          { error: 'University not found' },
          { status: 404 }
        );
      }

      // Convert BigInt to string
      const responseData = {
        ...university,
        phone_no: university.phone_no ? university.phone_no.toString() : null,
        agency_number: university.agency_number ? university.agency_number.toString() : null
      };

      return Response.json(responseData);
    }

    // If slug is provided, return university by slug
    if (slug) {
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

      // Convert BigInt to string
      const responseData = {
        ...university,
        phone_no: university.phone_no ? university.phone_no.toString() : null,
        agency_number: university.agency_number ? university.agency_number.toString() : null
      };

      return Response.json(responseData);
    }

    // Build where clause for filtering and pagination
    let whereClause = {
      display: true,
      active: true
    };

    // Add search filter
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { country: { contains: search } },
        { city: { contains: search } }
      ];
    }

    // Add country filter
    if (country && country !== 'Select Country') {
      whereClause.AND = [
        ...(whereClause.AND || []),
        {
          country: { contains: country }
        }
      ];
      console.log('🔍 Country filter applied:', country);
      console.log('🔍 Where clause after country filter:', JSON.stringify(whereClause, null, 2));
    }

    // Add scholarship filter
    if (scholarship && scholarship !== '') {
      console.log('🔍 University API - Scholarship filter value:', scholarship);
      
      if (scholarship === 'With Scholarship') {
        whereClause.AND = [
          ...(whereClause.AND || []),
          { scholarship: true }  // ✅ Use the actual Boolean field from schema
        ];
        console.log('🔍 University API - Added scholarship: true filter');
      } else if (scholarship === 'Without Scholarship') {
        whereClause.AND = [
          ...(whereClause.AND || []),
          { scholarship: false }  // ✅ Use the actual Boolean field from schema
        ];
        console.log('🔍 University API - Added scholarship: false filter');
      } else {
        // For any other value, try to match exactly
        whereClause.AND = [
          ...(whereClause.AND || []),
          { scholarship: scholarship === 'true' || scholarship === '1' }  // Convert string to boolean
        ];
        console.log('🔍 University API - Added scholarship filter with value:', scholarship);
      }
      
      console.log('🔍 University API - Where clause after scholarship filter:', JSON.stringify(whereClause, null, 2));
    }

    // Add qualifications filter (support multiple qualifications)
    if (qualifications && qualifications !== '') {
      // Split qualifications by comma and trim whitespace
      const qualificationList = qualifications.split(',').map(q => q.trim()).filter(q => q);
      
      if (qualificationList.length > 0) {
        console.log('🔍 Qualifications filter applied:', qualificationList);
        
        // Simple approach: Check if university has any courses with matching qualification names
        // This is similar to how we check country - direct field matching
        try {
          // Get universities that have courses with matching qualification names
          const universitiesWithQualifications = await prisma.courses.findMany({
            where: {
              OR: qualificationList.map(qual => ({
                OR: [
                  { qualification: { contains: qual } },
                  { qualification: { contains: qual.toLowerCase() } },
                  { qualification: { contains: qual.toUpperCase() } },
                  { qualification: { contains: qual.charAt(0).toUpperCase() + qual.slice(1).toLowerCase() } }
                ]
              }))
            },
            select: { university_id: true },
            distinct: ['university_id']
          });

          if (universitiesWithQualifications.length > 0) {
            const validUniversityIds = universitiesWithQualifications.map(c => c.university_id);
            
            // Add qualifications filter to where clause
            whereClause.AND = [
              ...(whereClause.AND || []),
              {
                id: {
                  in: validUniversityIds
                }
              }
            ];
            
            console.log('🔍 Universities filtered by qualifications:', {
              selectedQualifications: qualificationList,
              validUniversityIds: validUniversityIds.length,
              matchingUniversities: validUniversityIds
            });
          } else {
            // No matching qualifications found, return empty result
            console.log('🔍 No matching qualifications found, returning empty result');
            whereClause.AND = [
              ...(whereClause.AND || []),
              { id: { in: [] } } // This will return no results
            ];
          }
        } catch (error) {
          console.error('🔍 Error in qualifications filter:', error);
          // If qualifications filter fails, continue without it
          console.log('🔍 Continuing without qualifications filter due to error');
        }
      }
    }

    console.log('🔍 University API - Final where clause:', JSON.stringify(whereClause, null, 2));
    console.log('🔍 University API - Country being searched:', country);
    console.log('🔍 University API - Search term:', search);
    console.log('🔍 University API - Scholarship filter:', scholarship);
    console.log('🔍 University API - Qualifications filter:', qualifications);

    // Debug: Check what scholarship values exist in the database
    if (scholarship && scholarship !== '') {
      try {
        const sampleScholarshipValues = await prisma.university_details.findMany({
          where: {
            scholarship: { not: null }
          },
          select: {
            scholarship: true,
            name: true
          },
          take: 5,
          distinct: ['scholarship']
        });
        
        console.log('🔍 University API - Sample scholarship values in database:', 
          sampleScholarshipValues.map(u => ({ name: u.name, scholarship: u.scholarship }))
        );
      } catch (error) {
        console.log('🔍 University API - Could not fetch sample scholarship values:', error.message);
      }
    }

    // Test query to see what qualifications exist
    if (country && country !== 'Select Country') {
      try {
        const testQualifications = await prisma.courses.findMany({
          select: { qualification: true },
          distinct: ['qualification'],
          take: 10
        });
        console.log('🔍 Available qualifications in database:', testQualifications.map(q => q.qualification).filter(Boolean));
        
        const testCountryMatch = await prisma.university_details.findMany({
          where: { country: { contains: country } },
          select: { id: true, name: true, country: true },
          take: 5
        });
        console.log('🔍 Test country match results:', testCountryMatch);
      } catch (error) {
        console.error('🔍 Error in test country query:', error);
      }
    }

    try {
      // Calculate pagination
      const skip = (page - 1) * limit;

      // Get total count for pagination (after all filters including qualifications)
      const totalCount = await prisma.university_details.count({ where: whereClause });
      console.log('🔍 University API - Total count query successful:', totalCount);

      // Validate page number against filtered results
      const maxPages = Math.ceil(totalCount / limit);
      if (page > maxPages && maxPages > 0) {
        console.log('🔍 University API - Page number exceeds filtered results, redirecting to last page');
        return Response.json({
          success: false,
          error: 'Page number exceeds available results',
          redirectTo: maxPages,
          totalPages: maxPages,
          totalItems: totalCount
        }, { status: 400 });
      }

      // If no results found, return empty response
      if (totalCount === 0) {
        console.log('🔍 University API - No results found with current filters');
        return Response.json({
          success: true,
          data: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: limit,
            hasNextPage: false,
            hasPrevPage: false,
            startItem: 0,
            endItem: 0,
            actualItemsOnPage: 0
          },
          filters: {
            country,
            scholarship,
            qualifications: qualifications ? qualifications.split(',').map(q => q.trim()) : [],
            search
          },
          message: 'No results found with current filters'
        });
      }

      // Get paginated data with only necessary fields
      const universities = await prisma.university_details.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          slug: true,
          country: true,
          city: true,
          logo: true,
          ranking: true,
          scholarship: true,
          popular: true,
          active: true,
          created_at: true,
          // Only essential fields to reduce response size
        },
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
      });
      
      console.log('🔍 Universities query successful:', universities.length, 'universities found');

      // Convert BigInt fields to strings
      const processedUniversities = universities.map(university => ({
        ...university,
        phone_no: university.phone_no ? university.phone_no.toString() : null,
        agency_number: university.agency_number ? university.agency_number.toString() : null
      }));

      // Calculate pagination metadata based on FILTERED results (not original dataset)
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
      
      // Ensure we don't exceed the actual filtered results
      const actualItemsOnPage = processedUniversities.length;
      const startItem = skip + 1;
      const endItem = Math.min(skip + actualItemsOnPage, totalCount);

      console.log('🔍 University API - Pagination details:', {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        actualItemsOnPage,
        startItem,
        endItem,
        hasNextPage,
        hasPrevPage
      });

      return Response.json({
        success: true,
        data: processedUniversities,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
          hasNextPage,
          hasPrevPage,
          startItem,
          endItem,
          actualItemsOnPage
        },
        filters: {
          country,
          scholarship,
          qualifications: qualifications ? qualifications.split(',').map(q => q.trim()) : [],
          search
        }
      });
      
    } catch (error) {
      console.error('🔍 Error in database queries:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        code: error.code,
        meta: error.meta,
        whereClause: JSON.stringify(whereClause, null, 2)
      });
      
      // Return a more specific error response
      return Response.json({
        success: false,
        error: 'Database query failed',
        details: error.message,
        whereClause: whereClause
      }, { status: 500 });
    }

  } catch (error) {
    if (error.code === 'P1001') {
      return Response.json(
        { 
          error: 'Database connection failed',
          details: 'Cannot connect to database server',
          solution: 'Check your database connection string and ensure server is running'
        }, 
        { status: 500 }
      );
    }

    return Response.json(
      { 
        error: 'Internal server error',
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}












// // app/api/internal/university/route.js
// import { auth } from "../../../../auth";
// import slugify from 'slugify';
// import { prisma } from '../../../../lib/prisma';

// // Helper function to validate JSON fields
// const validateJsonField = (field, fieldName) => {
//   if (!field || field === '') return { valid: true, value: null };

//   // If it's already an object (might happen if sent as FormData)
//   if (typeof field === 'object') return { valid: true, value: field };

//   try {
//     const parsed = JSON.parse(field);
//     return { valid: true, value: parsed };
//   } catch (e) {
//     console.log(`JSON validation failed for ${fieldName}:`, field, e.message);
//     return {
//       valid: false,
//       error: `Invalid ${fieldName} format. Must be valid JSON. Received: ${field}`
//     };
//   }
// };

// // Custom JSON stringifier that handles BigInt
// const safeJsonStringify = (obj) => {
//   return JSON.stringify(obj, (key, value) => 
//     typeof value === 'bigint' ? value.toString() : value
//   );
// };

// export async function POST(request) {
//   const session = await auth();

//   if (!session?.user?.id) {
//     return Response.json(
//       { error: 'Unauthorized - No valid session found' }, 
//       { status: 401 }
//     );
//   }

//   try {
//     const formData = await request.formData();
//     const data = Object.fromEntries(formData.entries());

//     // Collect all validation errors
//     const errors = [];
//     if (!data.name) errors.push('University name is required');
//     if (!data.country) errors.push('Country is required');

//     // Validate JSON fields
//     const smQuestionValidation = validateJsonField(data.sm_question, 'sm_question');
//     const smAnswerValidation = validateJsonField(data.sm_answer, 'sm_answer');
//     const reviewDetailValidation = validateJsonField(data.review_detail, 'review_detail');

//     if (!smQuestionValidation.valid) errors.push(smQuestionValidation.error);
//     if (!smAnswerValidation.valid) errors.push(smAnswerValidation.error);
//     if (!reviewDetailValidation.valid) errors.push(reviewDetailValidation.error);

//     // Validate ranking - must be a number if provided
//     if (data.ranking && data.ranking.trim() !== '') {
//       const rankingNum = parseFloat(data.ranking);
//       if (isNaN(rankingNum)) {
//         errors.push('Ranking must be a valid number');
//       }
//     }

//     if (errors.length > 0) {
//       return Response.json(
//         { error: 'Validation failed', details: errors },
//         { status: 400 }
//       );
//     }

//     // Generate slug
//     const slug = slugify(data.name, { lower: true, strict: true });

//     // Check for existing university
//     const existingUniversity = await prisma.university_details.findFirst({
//       where: { 
//         slug: slug,
//         display: true
//       },
//     });

//     if (existingUniversity) {
//       return Response.json(
//         { error: 'University with this name already exists' }, 
//         { status: 400 }
//       );
//     }

//     // Handle numeric fields
//     const totalStudents = data.total_students ? parseInt(data.total_students) : null;
//     const internationalStudent = data.international_student ? parseInt(data.international_student) : null;

//     // Handle ranking - only set if valid
//     const rankingValue = data.ranking && !isNaN(parseFloat(data.ranking)) 
//       ? parseFloat(data.ranking) 
//       : null;

//     // Handle boolean fields
//     const isPopular = data.popular === 'true';
//     const hasScholarship = data.scholarship === 'true';

//     // Handle phone number - remove all non-digit characters and convert to string
//     const phoneNo = data.phone_no ? data.phone_no.replace(/\D/g, '') : null;

//     // Handle image URLs
//     const featureImage = data.feature_image_url || data.feature_image || null;
//     const logo = data.logo_url || data.logo || null;

//     // Create university
//     const userId = parseInt(session.user.id);
//     const university = await prisma.university_details.create({
//       data: {
//         name: data.name,
//         slug,
//         founded_in: data.founded_in || null,
//         country: data.country || null,
//         city: data.city || null,
//         address: data.address || null,
//         postcode: data.postcode || null,
//         phone_no: phoneNo ? BigInt(phoneNo) : null,
//         agency_number: data.agency_number || null,
//         total_students: totalStudents,
//         international_student: internationalStudent,
//         scholarship: hasScholarship,
//         about: data.about || '',
//         guide: data.guide || '',
//         expanse: data.expanse || '',
//         languages: data.languages || null,
//         accommodation: data.accommodation || '',
//         accommodation_detail: data.accommodation_detail || '',
//         intake: data.intake || null,
//         ranking: rankingValue,
//         designation: data.designation || null,
//         alternate_email: data.alternate_email || null,
//         website: data.website || null,
//         popular: isPopular,
//         sm_question: JSON.stringify(smQuestionValidation.value),
//         sm_answer: JSON.stringify(smAnswerValidation.value),
//         review_detail: JSON.stringify(reviewDetailValidation.value),
//         user_id: userId,
//         feature_image: featureImage,
//         logo: logo,
//         active: true,
//         display: true,
//         package: "free"
//       },
//     });

//     // Convert the university object to a plain object and handle BigInt
//     const responseData = {
//       ...university,
//       phone_no: university.phone_no ? university.phone_no.toString() : null
//     };

//     return new Response(safeJsonStringify(responseData), {
//       status: 201,
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     });

//   } catch (error) {
//     console.error('Error creating university:', error);
//     return Response.json(
//       { 
//         error: 'Internal server error',
//         details: error.message 
//       }, 
//       { status: 500 }
//     );
//   }
// }

// // Helper function to validate JSON fields
// function isValidJSON(str) {
//   try {
//     JSON.parse(str);
//     return true;
//   } catch (e) {
//     return false;
//   }
// }

// export async function GET(request) {
//   try {
//     // First verify database connection
//     await prisma.$queryRaw`SELECT 1`;
//     console.log('🔍 Database connection successful');

//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get('id');
//     const slug = searchParams.get('slug');
//     const page = parseInt(searchParams.get('page')) || 1;
//     const limit = parseInt(searchParams.get('limit')) || 10;
//     const search = searchParams.get('search') || '';
//     const country = searchParams.get('country') || '';
//     const type = searchParams.get('type') || '';
//     const scholarship = searchParams.get('scholarship') || '';
//     const qualifications = searchParams.get('qualification') || '';

//     console.log('🔍 University API called with params:', { page, limit, search, country, scholarship, qualifications });

//     // Simple health check - count total universities
//     try {
//       const totalUniversities = await prisma.university_details.count();
//       console.log('🔍 Total universities in database:', totalUniversities);
//     } catch (error) {
//       console.error('🔍 Error counting universities:', error);
//       return Response.json({
//         success: false,
//         error: 'Database table access failed',
//         details: error.message
//       }, { status: 500 });
//     }

//     // If ID is provided, return single university with all details
//     if (id) {
//       const university = await prisma.university_details.findUnique({
//         where: { id: parseInt(id) },
//       });

//       if (!university) {
//         return Response.json(
//           { error: 'University not found' },
//           { status: 404 }
//         );
//       }

//       // Convert BigInt to string
//       const responseData = {
//         ...university,
//         phone_no: university.phone_no ? university.phone_no.toString() : null,
//         agency_number: university.agency_number ? university.agency_number.toString() : null
//       };

//       return Response.json(responseData);
//     }

//     // If slug is provided, return university by slug
//     if (slug) {
//       const university = await prisma.university_details.findFirst({
//         where: { 
//           slug: slug,
//           display: true,
//           active: true
//         }
//       });

//       if (!university) {
//         return Response.json(
//           { error: 'University not found' },
//           { status: 404 }
//         );
//       }

//       // Convert BigInt to string
//       const responseData = {
//         ...university,
//         phone_no: university.phone_no ? university.phone_no.toString() : null,
//         agency_number: university.agency_number ? university.agency_number.toString() : null
//       };

//       return Response.json(responseData);
//     }

//     // Build where clause for filtering and pagination
//     let whereClause = {
//       display: true,
//       active: true
//     };

//     // Add search filter
//     if (search) {
//       whereClause.OR = [
//         { name: { contains: search } },
//         { country: { contains: search } },
//         { city: { contains: search } }
//       ];
//     }

//     // Add country filter
//     if (country && country !== 'Select Country') {
//       whereClause.AND = [
//         ...(whereClause.AND || []),
//         {
//           country: { contains: country }
//         }
//       ];
//       console.log('🔍 Country filter applied:', country);
//       console.log('🔍 Where clause after country filter:', JSON.stringify(whereClause, null, 2));
//     }

//     // Add scholarship filter
//     if (scholarship && scholarship !== '') {
//       console.log('🔍 University API - Scholarship filter value:', scholarship);
      
//       if (scholarship === 'With Scholarship') {
//         whereClause.AND = [
//           ...(whereClause.AND || []),
//           { scholarship: true }  // ✅ Use the actual Boolean field from schema
//         ];
//         console.log('🔍 University API - Added scholarship: true filter');
//       } else if (scholarship === 'Without Scholarship') {
//         whereClause.AND = [
//           ...(whereClause.AND || []),
//           { scholarship: false }  // ✅ Use the actual Boolean field from schema
//         ];
//         console.log('🔍 University API - Added scholarship: false filter');
//       } else {
//         // For any other value, try to match exactly
//         whereClause.AND = [
//           ...(whereClause.AND || []),
//           { scholarship: scholarship === 'true' || scholarship === '1' }  // Convert string to boolean
//         ];
//         console.log('🔍 University API - Added scholarship filter with value:', scholarship);
//       }
      
//       console.log('🔍 University API - Where clause after scholarship filter:', JSON.stringify(whereClause, null, 2));
//     }

//     // Add qualifications filter (support multiple qualifications)
//     if (qualifications && qualifications !== '') {
//       // Split qualifications by comma and trim whitespace
//       const qualificationList = qualifications.split(',').map(q => q.trim()).filter(q => q);
      
//       if (qualificationList.length > 0) {
//         console.log('🔍 Qualifications filter applied:', qualificationList);
        
//         // Simple approach: Check if university has any courses with matching qualification names
//         // This is similar to how we check country - direct field matching
//         try {
//           // Get universities that have courses with matching qualification names
//           const universitiesWithQualifications = await prisma.courses.findMany({
//             where: {
//               OR: qualificationList.map(qual => ({
//                 qualification: { contains: qual }
//               }))
//             },
//             select: { university_id: true },
//             distinct: ['university_id']
//           });

//           if (universitiesWithQualifications.length > 0) {
//             const validUniversityIds = universitiesWithQualifications.map(c => c.university_id);
            
//             // Add qualifications filter to where clause
//             whereClause.AND = [
//               ...(whereClause.AND || []),
//               {
//                 id: {
//                   in: validUniversityIds
//                 }
//               }
//             ];
            
//             console.log('🔍 Universities filtered by qualifications:', {
//               selectedQualifications: qualificationList,
//               validUniversityIds: validUniversityIds.length,
//               matchingUniversities: validUniversityIds
//             });
//           } else {
//             // No matching qualifications found, return empty result
//             console.log('🔍 No matching qualifications found, returning empty result');
//             whereClause.AND = [
//               ...(whereClause.AND || []),
//               { id: { in: [] } } // This will return no results
//             ];
//           }
//         } catch (error) {
//           console.error('🔍 Error in qualifications filter:', error);
//           // If qualifications filter fails, continue without it
//           console.log('🔍 Continuing without qualifications filter due to error');
//         }
//       }
//     }

//     console.log('🔍 University API - Final where clause:', JSON.stringify(whereClause, null, 2));
//     console.log('🔍 University API - Country being searched:', country);
//     console.log('🔍 University API - Search term:', search);
//     console.log('🔍 University API - Scholarship filter:', scholarship);
//     console.log('🔍 University API - Qualifications filter:', qualifications);

//     // Debug: Check what scholarship values exist in the database
//     if (scholarship && scholarship !== '') {
//       try {
//         const sampleScholarshipValues = await prisma.university_details.findMany({
//           where: {
//             scholarship: { not: null }
//           },
//           select: {
//             scholarship: true,
//             name: true
//           },
//           take: 5,
//           distinct: ['scholarship']
//         });
        
//         console.log('🔍 University API - Sample scholarship values in database:', 
//           sampleScholarshipValues.map(u => ({ name: u.name, scholarship: u.scholarship }))
//         );
//       } catch (error) {
//         console.log('🔍 University API - Could not fetch sample scholarship values:', error.message);
//       }
//     }

//     // Test query to see what qualifications exist
//     if (country && country !== 'Select Country') {
//       try {
//         const testQualifications = await prisma.courses.findMany({
//           select: { qualification: true },
//           distinct: ['qualification'],
//           take: 10
//         });
//         console.log('🔍 Available qualifications in database:', testQualifications.map(q => q.qualification).filter(Boolean));
        
//         const testCountryMatch = await prisma.university_details.findMany({
//           where: { country: { contains: country } },
//           select: { id: true, name: true, country: true },
//           take: 5
//         });
//         console.log('🔍 Test country match results:', testCountryMatch);
//       } catch (error) {
//         console.error('🔍 Error in test country query:', error);
//       }
//     }

//     try {
//       // Calculate pagination
//       const skip = (page - 1) * limit;

//       // Get total count for pagination (after all filters including qualifications)
//       const totalCount = await prisma.university_details.count({ where: whereClause });
//       console.log('🔍 University API - Total count query successful:', totalCount);

//       // Validate page number against filtered results
//       const maxPages = Math.ceil(totalCount / limit);
//       if (page > maxPages && maxPages > 0) {
//         console.log('🔍 University API - Page number exceeds filtered results, redirecting to last page');
//         return Response.json({
//           success: false,
//           error: 'Page number exceeds available results',
//           redirectTo: maxPages,
//           totalPages: maxPages,
//           totalItems: totalCount
//         }, { status: 400 });
//       }

//       // If no results found, return empty response
//       if (totalCount === 0) {
//         console.log('🔍 University API - No results found with current filters');
//         return Response.json({
//           success: true,
//           data: [],
//           pagination: {
//             currentPage: 1,
//             totalPages: 0,
//             totalItems: 0,
//             itemsPerPage: limit,
//             hasNextPage: false,
//             hasPrevPage: false,
//             startItem: 0,
//             endItem: 0,
//             actualItemsOnPage: 0
//           },
//           filters: {
//             country,
//             scholarship,
//             qualifications: qualifications ? qualifications.split(',').map(q => q.trim()) : [],
//             search
//           },
//           message: 'No results found with current filters'
//         });
//       }

//       // Get paginated data with only necessary fields
//       const universities = await prisma.university_details.findMany({
//         where: whereClause,
//         select: {
//           id: true,
//           name: true,
//           slug: true,
//           country: true,
//           city: true,
//           logo: true,
//           ranking: true,
//           scholarship: true,
//           popular: true,
//           active: true,
//           created_at: true,
//           // Only essential fields to reduce response size
//         },
//         skip,
//         take: limit,
//         orderBy: {
//           created_at: 'desc',
//         },
//       });
      
//       console.log('🔍 Universities query successful:', universities.length, 'universities found');

//       // Convert BigInt fields to strings
//       const processedUniversities = universities.map(university => ({
//         ...university,
//         phone_no: university.phone_no ? university.phone_no.toString() : null,
//         agency_number: university.agency_number ? university.agency_number.toString() : null
//       }));

//       // Calculate pagination metadata based on FILTERED results (not original dataset)
//       const totalPages = Math.ceil(totalCount / limit);
//       const hasNextPage = page < totalPages;
//       const hasPrevPage = page > 1;
      
//       // Ensure we don't exceed the actual filtered results
//       const actualItemsOnPage = processedUniversities.length;
//       const startItem = skip + 1;
//       const endItem = Math.min(skip + actualItemsOnPage, totalCount);

//       console.log('🔍 University API - Pagination details:', {
//         currentPage: page,
//         totalPages,
//         totalItems: totalCount,
//         itemsPerPage: limit,
//         actualItemsOnPage,
//         startItem,
//         endItem,
//         hasNextPage,
//         hasPrevPage
//       });

//       return Response.json({
//         success: true,
//         data: processedUniversities,
//         pagination: {
//           currentPage: page,
//           totalPages,
//           totalItems: totalCount,
//           itemsPerPage: limit,
//           hasNextPage,
//           hasPrevPage,
//           startItem,
//           endItem,
//           actualItemsOnPage
//         },
//         filters: {
//           country,
//           scholarship,
//           qualifications: qualifications ? qualifications.split(',').map(q => q.trim()) : [],
//           search
//         }
//       });
      
//     } catch (error) {
//       console.error('🔍 Error in database queries:', error);
//       console.error('🔍 Error details:', {
//         message: error.message,
//         code: error.code,
//         meta: error.meta,
//         whereClause: JSON.stringify(whereClause, null, 2)
//       });
      
//       // Return a more specific error response
//       return Response.json({
//         success: false,
//         error: 'Database query failed',
//         details: error.message,
//         whereClause: whereClause
//       }, { status: 500 });
//     }

//   } catch (error) {
//     if (error.code === 'P1001') {
//       return Response.json(
//         { 
//           error: 'Database connection failed',
//           details: 'Cannot connect to database server',
//           solution: 'Check your database connection string and ensure server is running'
//         }, 
//         { status: 500 }
//       );
//     }

//     return Response.json(
//       { 
//         error: 'Internal server error',
//         details: error.message 
//       }, 
//       { status: 500 }
//     );
//   }
// }