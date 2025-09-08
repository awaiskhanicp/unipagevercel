import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

// GET - Fetch single visa requirement by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: 'Valid requirement ID is required' },
        { status: 400 }
      );
    }

    const requirement = await prisma.visa_requirements.findUnique({
      where: { id: parseInt(id) }
    });

    if (!requirement) {
      return NextResponse.json(
        { error: 'Requirement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: requirement
    });

  } catch (error) {
    console.error('Error fetching requirement:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update visa requirement by ID
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const {
      visa_country_id,
      visa_type_id,
      title,
      description,
      visa_country_name,
      visa_type_name
    } = await request.json();

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: 'Valid requirement ID is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!visa_country_id || !visa_type_id || !title || !description) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    // Update visa requirement
    const updatedRequirement = await prisma.visa_requirements.update({
      where: { id: parseInt(id) },
      data: {
        visa_country_id: parseInt(visa_country_id),
        visa_type_id: parseInt(visa_type_id),
        title,
        description,
        visa_country_name,
        visa_type_name,
        updated_at: new Date()
      }
    });

    return NextResponse.json(
      { message: 'Visa requirement updated successfully', data: updatedRequirement },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating visa requirement:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove visa requirement by ID
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Valid requirement ID is required' 
        },
        { status: 400 }
      );
    }

    await prisma.visa_requirements.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json(
      { 
        success: true,
        message: 'Visa requirement deleted successfully' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting visa requirement:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.code === 'P2025' ? 'Requirement not found' : 'Internal server error',
        details: error.message 
      },
      { status: error.code === 'P2025' ? 404 : 500 }
    );
  }
}










// import { NextResponse } from 'next/server';
// import { prisma } from '../../../../../lib/prisma';

// // GET - Fetch single visa requirement by ID
// export async function GET(request, context) {
//   const params = await context.params;
//   try {
//     const { id } = params;

//     if (!id || isNaN(id)) {
//       return NextResponse.json(
//         { error: 'Valid requirement ID is required' },
//         { status: 400 }
//       );
//     }

//     const requirement = await prisma.visa_requirements.findUnique({
//       where: { id: parseInt(id) }
//     });

//     if (!requirement) {
//       return NextResponse.json(
//         { error: 'Requirement not found' },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       data: requirement
//     });

//   } catch (error) {
//     console.error('Error fetching requirement:', error);
//     return NextResponse.json(
//       { error: 'Internal server error', details: error.message },
//       { status: 500 }
//     );
//   }
// }

// // PUT - Update visa requirement by ID
// export async function PUT(request, context) {
//   const params = await context.params;
//   try {
//     const { id } = params;
//     const {
//       visa_country_id,
//       visa_type_id,
//       title,
//       description,
//       visa_country_name,
//       visa_type_name
//     } = await request.json();

//     if (!id || isNaN(id)) {
//       return NextResponse.json(
//         { error: 'Valid requirement ID is required' },
//         { status: 400 }
//       );
//     }

//     // Validate required fields
//     if (!visa_country_id || !visa_type_id || !title || !description) {
//       return NextResponse.json(
//         { error: 'Required fields are missing' },
//         { status: 400 }
//       );
//     }

//     // Update visa requirement
//     const updatedRequirement = await prisma.visa_requirements.update({
//       where: { id: parseInt(id) },
//       data: {
//         visa_country_id: parseInt(visa_country_id),
//         visa_type_id: parseInt(visa_type_id),
//         title,
//         description,
//         visa_country_name,
//         visa_type_name,
//         updated_at: new Date()
//       }
//     });

//     return NextResponse.json(
//       { message: 'Visa requirement updated successfully', data: updatedRequirement },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error('Error updating visa requirement:', error);
//     return NextResponse.json(
//       { error: 'Internal server error', details: error.message },
//       { status: 500 }
//     );
//   }
// }

// // DELETE - Remove visa requirement
// export async function DELETE(request, context) {
//   const params = await context.params;
//   try {
//     const { id } = params;

//     if (!id || isNaN(id)) {
//       return NextResponse.json(
//         { 
//           success: false,
//           error: 'Requirement ID is required' 
//         },
//         { status: 400 }
//       );
//     }

//     await prisma.visa_requirements.delete({
//       where: { id: parseInt(id) }
//     });

//     return NextResponse.json(
//       { 
//         success: true,
//         message: 'Visa requirement deleted successfully' 
//       },
//       { status: 200 }
//     );

//   } catch (error) {
//     console.error('Error deleting visa requirement:', error);
//     return NextResponse.json(
//       { 
//         success: false,
//         error: error.code === 'P2025' ? 'Requirement not found' : 'Internal server error',
//         details: error.message 
//       },
//       { status: error.code === 'P2025' ? 404 : 500 }
//     );
//   }
// }