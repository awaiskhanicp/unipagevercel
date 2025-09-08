import { prisma } from '../../../../../lib/prisma';
import { NextResponse } from 'next/server';
import { sendNotConnectedStatusEmail, sendConsultantAssignedEmail } from '../../../../../lib/email';

function checkAuth(req) {
  const authHeader = req.headers.get('authorization');
  const token = process.env.API_SECRET_TOKEN;
  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== token) {
    return false;
  }
  return true;
}

export async function DELETE(req, { params }) {
  const { id } = await params;

  try {
    await prisma.free_consulations.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ success: false, error: "Delete failed" }, { status: 500 });
  }
}

export async function GET(req, { params }) {
  const { id } = await params;
  try {
    const record = await prisma.free_consulations.findUnique({ where: { id: parseInt(id) } });
    if (!record) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error("GET by ID error:", error);
    return NextResponse.json({ success: false, error: 'Fetch failed' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  if (!checkAuth(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const record = await prisma.free_consulations.findUnique({ 
      where: { id: parseInt(id) } 
    });

    if (!record) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData = { ...body };
    const now = new Date();
    
    // Follow-up change date logic
    if (body.first_followup && record.first_followup !== body.first_followup) {
      updateData.first_followup_change_date = now;
    }
    if (body.second_followup && record.second_followup !== body.second_followup) {
      updateData.second_followup_change_date = now;
    }
    if (body.third_followup && record.third_followup !== body.third_followup) {
      updateData.third_followup_change_date = now;
    }

    // Email trigger flags
    let notConnectedEmailSent = false;
    let assignedEmailSent = false;

    // 1. Not connected status email
    if (body.not_connected_status && !record.not_connected_status) {
      try {
        console.log('Attempting to send not connected email to:', record.email);
        await sendNotConnectedStatusEmail({
          email: record.email,
          name: record.name,
          consularName: body.assign_employee_name || 'Our Consultant',
          genderPrefix: body.assign_employee_gender === 'female' ? 'Ms.' : 'Mr.',
          studentPhone: record.phone_number || '',
          consularPhone: body.assign_employee_phone || 'our support number'
        });
        console.log('✅ Not connected status email sent successfully');
        notConnectedEmailSent = true;
      } catch (emailError) {
        console.error('❌ Failed to send not connected email:', emailError);
      }
    }
    
    // 2. Employee assignment email
    if (body.assign_employee && body.assign_employee !== record.assign_employee) {
      try {
        console.log('Attempting to send assignment email to:', record.email);
        const consultant = await prisma.employees.findUnique({
          where: { id: parseInt(body.assign_employee) }
        });

        const emailData = {
          email: record.email,
          name: record.name,
          consularName: consultant?.name || 'Our Consultant',
          genderPrefix: consultant?.gender === 'female' ? 'Ms.' : 'Mr.',
          genderPrefixTwo: consultant?.gender === 'female' ? 'She' : 'He',
          genderPrefixThree: consultant?.gender === 'female' ? 'her' : 'him',
          studentPhone: record.phone_number || '',
          consularPhone: consultant?.phone || 'our support number'
        };

        console.log('Email data:', emailData);
        
        await sendConsultantAssignedEmail(emailData);
        console.log('✅ Consultant assigned email sent successfully');
        assignedEmailSent = true;
      } catch (emailError) {
        console.error('❌ Failed to send assignment email:', emailError);
      }
    }

    const updated = await prisma.free_consulations.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return NextResponse.json({ 
      success: true, 
      data: updated,
      emailsSent: {
        notConnected: notConnectedEmailSent,
        assigned: assignedEmailSent
      }
    });

  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ 
      success: false, 
      error: 'Update failed',
      details: error.message 
    }, { status: 500 });
  }
}





// import { prisma } from '../../../../../lib/prisma';
// import { NextResponse } from 'next/server';
// import { sendNotConnectedStatusEmail } from '../../../../../lib/email';

// function checkAuth(req) {
//   const authHeader = req.headers.get('authorization');
//   const token = process.env.API_SECRET_TOKEN;
//   if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== token) {
//     return false;
//   }
//   return true;
// }

// export async function DELETE(req, { params }) {
//   const { id } = await params;

//   try {
//     await prisma.free_consulations.delete({
//       where: { id: parseInt(id) },
//     });

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("DELETE error:", error);
//     return NextResponse.json({ success: false, error: "Delete failed" }, { status: 500 });
//   }
// }

// export async function GET(req, { params }) {
//   const { id } = await params; // Await params as required by Next.js
//   try {
//     const record = await prisma.free_consulations.findUnique({ where: { id: parseInt(id) } });
//     if (!record) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
//     return NextResponse.json({ success: true, data: record });
//   } catch (error) {
//     console.error("GET by ID error:", error);
//     return NextResponse.json({ success: false, error: 'Fetch failed' }, { status: 500 });
//   }
// }

// export async function PUT(req, { params }) {
//   if (!checkAuth(req)) {
//     return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
//   }
//   const { id } = await params; // Await params as required by Next.js
//   try {
//     const body = await req.json();
//     // Check if record exists first
//     const record = await prisma.free_consulations.findUnique({ where: { id: parseInt(id) } });
//     if (!record) {
//       return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
//     }

//     // Prepare update data
//     const updateData = { ...body };
//     // Follow-up logic: if value changes (as text), set _change_date to now
//     const now = new Date();
//     if (
//       Object.prototype.hasOwnProperty.call(body, 'first_followup') &&
//       (record.first_followup !== body.first_followup)
//     ) {
//       updateData.first_followup_change_date = now;
//     }
//     if (
//       Object.prototype.hasOwnProperty.call(body, 'second_followup') &&
//       (record.second_followup !== body.second_followup)
//     ) {
//       updateData.second_followup_change_date = now;
//     }
//     if (
//       Object.prototype.hasOwnProperty.call(body, 'third_followup') &&
//       (record.third_followup !== body.third_followup)
//     ) {
//       updateData.third_followup_change_date = now;
//     }

//     const updated = await prisma.free_consulations.update({
//       where: { id: parseInt(id) },
//       data: updateData,
//     });
//     // If not_connected_status is set, trigger email logic (placeholder)
//     if (body.not_connected_status) {
//       // Call your email sending function here
//       await sendNotConnectedStatusEmail({
//         email: record.email,
//         name: record.name,
//         consularName: 'Test Consultant', // or fetch real consultant info
//         genderPrefix: 'Mr.', // or fetch real gender
//         studentPhone: record.phone_number || '',
//         consularPhone: '1234567890' // or fetch real consultant phone
//       });
//       console.log('Email sent for not_connected_status');
//     }
//     return NextResponse.json({ success: true, data: updated });
//   } catch (error) {
//     console.error("PUT error:", error);
//     return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
//   }
// }