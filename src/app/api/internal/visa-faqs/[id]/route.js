import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

// GET - Fetch single FAQ by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: 'Valid FAQ ID is required' },
        { status: 400 }
      );
    }

    const faq = await prisma.visa_faqs.findUnique({
      where: { id: parseInt(id) }
    });

    if (!faq) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: faq
    });

  } catch (error) {
    console.error('Error fetching FAQ:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update FAQ by ID
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
        { error: 'Valid FAQ ID is required' },
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

    // Update FAQ
    const updatedFaq = await prisma.visa_faqs.update({
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
      { message: 'FAQ updated successfully', data: updatedFaq },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE FAQ by ID
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Valid FAQ ID is required' 
        },
        { status: 400 }
      );
    }

    await prisma.visa_faqs.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json(
      { 
        success: true,
        message: 'FAQ deleted successfully' 
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        message: error.code === 'P2025' ? 'FAQ not found' : 'Failed to delete FAQ',
        error: error.message 
      },
      { status: error.code === 'P2025' ? 404 : 500 }
    );
  }
}













// import { NextResponse } from 'next/server';
// import { prisma } from '../../../../../lib/prisma';

// // GET - Fetch single FAQ by ID
// export async function GET(request, { params }) {
//   try {
//     const { id } = params;

//     if (!id || isNaN(id)) {
//       return NextResponse.json(
//         { error: 'Valid FAQ ID is required' },
//         { status: 400 }
//       );
//     }

//     const faq = await prisma.visa_faqs.findUnique({
//       where: { id: parseInt(id) }
//     });

//     if (!faq) {
//       return NextResponse.json(
//         { error: 'FAQ not found' },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       data: faq
//     });

//   } catch (error) {
//     console.error('Error fetching FAQ:', error);
//     return NextResponse.json(
//       { error: 'Internal server error', details: error.message },
//       { status: 500 }
//     );
//   }
// }

// // PUT - Update FAQ by ID
// export async function PUT(request, { params }) {
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
//         { error: 'Valid FAQ ID is required' },
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

//     // Update FAQ
//     const updatedFaq = await prisma.visa_faqs.update({
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
//       { message: 'FAQ updated successfully', data: updatedFaq },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error('Error updating FAQ:', error);
//     return NextResponse.json(
//       { error: 'Internal server error', details: error.message },
//       { status: 500 }
//     );
//   }
// }

// // DELETE FAQ
// export async function DELETE(request) {
//   try {
//     const { id } = await request.json();

//     if (!id) {
//       return NextResponse.json(
//         { 
//           success: false,
//           message: 'FAQ ID is required' 
//         },
//         { status: 400 }
//       );
//     }

//     await prisma.visa_faqs.delete({
//       where: { id: parseInt(id) }
//     });

//     return NextResponse.json(
//       { 
//         success: true,
//         message: 'FAQ deleted successfully' 
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     return NextResponse.json(
//       { 
//         success: false,
//         message: error.code === 'P2025' ? 'FAQ not found' : 'Failed to delete FAQ',
//         error: error.message 
//       },
//       { status: error.code === 'P2025' ? 404 : 500 }
//     );
//   }
// }