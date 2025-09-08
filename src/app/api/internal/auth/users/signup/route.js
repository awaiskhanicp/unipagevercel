import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import {prisma} from '../../../../../../lib/prisma';

export async function POST(req) {
  try {
    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('Database connection successful');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { message: 'Database connection failed. Please try again later.' },
        { status: 500 }
      );
    }
    
    // Log request details for debugging
    const contentType = req.headers.get('content-type');
    const userAgent = req.headers.get('user-agent');
    console.log('Signup request received:');
    console.log('Content-Type:', contentType);
    console.log('User-Agent:', userAgent);
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    
    let body = {};
    
    // Check content type and handle accordingly
    if (contentType && contentType.includes('application/json')) {
      // Handle JSON request
      console.log('Processing as JSON request');
      body = await req.json();
    } else if (contentType && contentType.includes('multipart/form-data')) {
      // Handle FormData request
      console.log('Processing as FormData request');
      const formData = await req.formData();
      for (let [key, value] of formData.entries()) {
        body[key] = value;
      }
    } else if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
      // Handle URL-encoded form data
      console.log('Processing as URL-encoded form data');
      const text = await req.text();
      const params = new URLSearchParams(text);
      for (let [key, value] of params.entries()) {
        body[key] = value;
      }
    } else {
      // Try to parse as JSON first, fallback to FormData
      console.log('Content-Type not recognized, trying JSON first, then FormData');
      try {
        body = await req.json();
        console.log('Successfully parsed as JSON');
      } catch (jsonError) {
        console.log('JSON parsing failed, trying FormData');
        try {
          const formData = await req.formData();
          for (let [key, value] of formData.entries()) {
            body[key] = value;
          }
          console.log('Successfully parsed as FormData');
        } catch (formDataError) {
          console.error('Both JSON and FormData parsing failed');
          console.error('JSON error:', jsonError.message);
          console.error('FormData error:', formDataError.message);
          return NextResponse.json(
            { message: 'Invalid request format. Please send JSON or FormData.' },
            { status: 400 }
          );
        }
      }
    }
    
    console.log('Signup request body:', body);
    
    // Validate that we have a body
    if (!body || Object.keys(body).length === 0) {
      console.error('Empty or invalid request body received');
      return NextResponse.json(
        { message: 'Request body is required and cannot be empty.' },
        { status: 400 }
      );
    }
    
    const {
      first_name,
      last_name,
      phone,
      email,
      password,
      confirm_password,
      nationality,
      program_type,
      gender,
      user_type,
      city,
      country,
      postal,
      user_group,
      dob,
      address,
      active,
      profile_image,
    } = body;

    // For admin registration, set user_type to 'admin'
    const finalUserType = user_type || 'admin';

    // Validate required fields based on user type
    if (finalUserType === 'admin') {
      // Admin validation - only basic fields required
      if (!first_name || !last_name || !email || !password) {
        return NextResponse.json(
          { message: 'First name, last name, email, and password are required for admin users.' },
          { status: 400 }
        );
      }
      
      // Check password confirmation for admin
      if (password !== confirm_password) {
        return NextResponse.json(
          { message: 'Password and confirm password do not match.' },
          { status: 400 }
        );
      }
      
      // Check password length for admin
      if (password.length < 6) {
        return NextResponse.json(
          { message: 'Password must be at least 6 characters long.' },
          { status: 400 }
        );
      }
    } else {
      // Student/Consultant validation - all fields required
      if (
        !first_name ||
        !last_name ||
        !phone ||
        !email ||
        !password ||
        !nationality ||
        !program_type ||
        !gender
      ) {
        return NextResponse.json(
          { message: 'All required fields must be filled for student/consultant users.' },
          { status: 400 }
        );
      }
    }

    // Check for existing user
    const existingUser = await prisma.users.findFirst({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered.' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with different data based on user type
    const userData = {
      first_name,
      last_name,
      email,
      password: hashedPassword,
      user_type: finalUserType,
      is_verified: false,
      is_active: active === 'true' || active === true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Add additional fields for non-admin users
    if (finalUserType !== 'admin') {
      userData.phone = phone;
      userData.country = nationality || country; // mapping nationality to country field
      userData.brief = program_type;  // storing program_type in brief field
    } else {
      // Add admin-specific fields
      if (phone) userData.phone = phone;
      if (city) userData.city = city;
      if (country) userData.country = country;
      if (postal) userData.postal = postal;
      if (dob) userData.dob = dob; // Keep as string since database expects String
      if (address) userData.address = address;
    }

    const newUser = await prisma.users.create({
      data: userData,
    });

    console.log('User created successfully:', { id: newUser.id, email: newUser.email, user_type: newUser.user_type });
    console.log('Final user type for notification:', finalUserType);
    
    // Create notification for new user signup
    try {
      if (finalUserType === 'student' || finalUserType === 'consultant') {
        console.log('🔔 Creating notification for user type:', finalUserType);
        
        // Check if notifications table exists and has data
        try {
          const notificationCount = await prisma.notifications.count();
          console.log('📊 Current notifications in database:', notificationCount);
        } catch (countError) {
          console.error('❌ Error counting notifications:', countError);
        }
        
        // Create notification data with proper field mapping
        const notificationData = {
          type: 'account',
          name: `${first_name} ${last_name}`,
          email: email,
          is_read: 0, // Use 0 for false (Int type in database)
          meta: `New ${finalUserType} registered: ${email}`,
          created_at: new Date(),
          updated_at: new Date(),
        };

        console.log('📝 Notification data to create:', notificationData);

        // Try to create the notification
        const createdNotification = await prisma.notifications.create({
          data: notificationData,
        });
        
        console.log('✅ Notification created successfully:', createdNotification);
        
        // Verify the notification was created
        const verifyNotification = await prisma.notifications.findFirst({
          where: { id: createdNotification.id }
        });
        
        if (verifyNotification) {
          console.log('✅ Verification successful - notification found:', verifyNotification);
        } else {
          console.error('❌ Verification failed - notification not found after creation');
        }
        
        // Also check total count after creation
        const newCount = await prisma.notifications.count();
        console.log('📊 Total notifications after creation:', newCount);
        
        // Test: Try to fetch the notification we just created
        const testFetch = await prisma.notifications.findMany({
          where: {
            email: email,
            type: 'account'
          },
          orderBy: {
            created_at: 'desc'
          },
          take: 1
        });
        console.log('🔍 Test fetch result:', testFetch);
        
      } else {
        console.log('⚠️ No notification created - user type is:', finalUserType);
      }
    } catch (notificationError) {
      console.error('❌ Failed to create notification:', notificationError);
      console.error('❌ Notification error details:', {
        message: notificationError.message,
        code: notificationError.code,
        meta: notificationError.meta,
        stack: notificationError.stack
      });
      
      // Try to get more details about the error
      if (notificationError.code === 'P2002') {
        console.error('❌ Duplicate key error - notification might already exist');
      } else if (notificationError.code === 'P2003') {
        console.error('❌ Foreign key constraint error');
      } else if (notificationError.code === 'P2000') {
        console.error('❌ Value too long for column');
      }
      
      // Don't fail the signup if notification creation fails
    }
    
    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful! Please login.',
        user: { id: newUser.id, email: newUser.email, user_type: newUser.user_type },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Server error. Please try again later.',
        error: error.message 
      },
      { status: 500 }
    );
  }
}















// import { NextResponse } from 'next/server';
// import { prisma } from '../../../../../../lib/prisma';
// import bcrypt from 'bcryptjs';

// export async function POST(req) {
//   try {
//     const data = await req.json();
//     const {
//       email,
//       password,
//       confirm_password,
//       first_name,
//       last_name,
//       phone,
//       user_type, // 'student', 'consultant', or 'admin'
//       nationality,
//       program_type,
//       gender,
//       company_name,
//       number_of_employees,
//       state,
//       city,
//       address,
//       designation,
//       comment
//     } = data;

//     if (password !== confirm_password) {
//       return NextResponse.json(
//         { message: 'Passwords do not match.' }, 
//         { status: 400 }
//       );
//     }

//     if (password.length < 6) {
//       return NextResponse.json(
//         { message: 'Password must be at least 6 characters.' }, 
//         { status: 400 }
//       );
//     }

//     const existingUser = await prisma.users.findUnique({
//       where: { email },
//     });

//     if (existingUser) {
//       return NextResponse.json(
//         { message: 'Email already exists.' }, 
//         { status: 409 }
//       );
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create user in Users table
//     const user = await prisma.users.create({
//       data: {
//         email,
//         password: hashedPassword,
//         first_name,
//         last_name,
//         phone,
//         user_type,
//         city: city || '',
//         country: nationality || '',
//         is_active: true,
//       },
//     });

//     // Create role-specific record
//     if (user_type === 'student') {
//       await prisma.students.create({
//         data: {
//           user_id: user.id,
//           name: `${first_name} ${last_name}`,
//           nationality,
//           city: city || '',
//           gender,
//           prefered_program: program_type,
//         },
//       });
//     } else if (user_type === 'consultant') {
//       await prisma.consultants.create({
//         data: {
//           user_id: user.id,
//           name: `${first_name} ${last_name}`,
//           company_name,
//           employeeno: number_of_employees,
//           nationality,
//           state,
//           city,
//           address,
//           designation,
//           email,
//           phone,
//           comment: comment || '',
//         },
//       });
//     }

//     return NextResponse.json({
//       success: true,
//       message: 'Registration successful.',
//       user: {
//         id: user.id,
//         email: user.email,
//         user_type: user.user_type,
//       },
//     }, { status: 201 });

//   } catch (error) {
//     console.error('POST /api/users/signup error:', error);
//     return NextResponse.json(
//       { 
//         message: 'Internal Server Error',
//         error: error.message 
//       }, 
//       { status: 500 }
//     );
//   }
// }