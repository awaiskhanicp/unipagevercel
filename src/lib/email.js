// lib/email.js

/**
 * Helper function to send email via API
 */
// lib/email.js
async function sendEmailViaAPI(emailData) {
  try {
    // Use absolute URL that works in both dev and production
    const baseUrl = process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      : 'http://localhost:3000';

    const apiUrl = `${baseUrl}/api/internal/send-email`;

    console.log('Sending email to API:', apiUrl, emailData);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Email API error:', data);
      return false;
    }

    console.log('Email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Network error sending email:', error);
    return false;
  }
}
/**
 * Send password email to new users
 */
export const sendPasswordEmail = async ({ email, name, password }) => {
  const emailData = {
    to: email,
    subject: 'Your Account Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Our Platform, ${name}!</h2>
        <p>You've successfully signed up using a social provider. Here's your automatically generated password:</p>
        
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="font-weight: bold; margin: 0; font-size: 18px;">${password}</p>
        </div>
        
        <p>You can use this password to log in with your email address.</p>
        <p style="color: #ef4444; font-weight: bold;">For security reasons, we recommend changing this password after your first login.</p>
        
        <p>Best regards,<br/>The Team</p>
      </div>
    `,
  };

  return await sendEmailViaAPI(emailData);
};

/**
 * Send request information email
 */
export const sendRequestInfoEmail = async ({ item, userInfo }) => {
  try {
    console.log('🔍 sendRequestInfoEmail called with item:', item);
    console.log('🔍 Item keys:', Object.keys(item));
    
    let itemType = 'Item';
    let universityEmail = null;
    let universityName = 'Unknown University';
    
    // Determine item type and extract university information
    if (item.university_id || item.university_info || item.university_alternate_email || item.university_name) {
      itemType = 'Course';
      // For courses, use the university details from the enriched data
      universityName = item.university_name || item.university || 'Unknown University';
      universityEmail = item.university_alternate_email || item.university_info?.alternate_email || item.alternate_email;
      console.log('🔍 Detected as Course:', { 
        universityName, 
        universityEmail,
        university_alternate_email: item.university_alternate_email,
        university_info_alternate_email: item.university_info?.alternate_email,
        alternate_email: item.alternate_email
      });
    } else if (item.name && (item.logo || item.banner_image || item.type === 'university' || item.alternate_email)) {
      itemType = 'University';
      universityName = item.name || 'Unknown University';
      // For universities, use alternate_email from the database
      universityEmail = item.alternate_email || item.email || item.contact?.email;
      console.log('🔍 Detected as University:', { universityName, universityEmail });
    } else if (item.title && item.guide_type) {
      itemType = 'Guide';
    } else if (item.title) {
      itemType = 'Article';
    }

    console.log('🔍 Final determination:', { itemType, universityName, universityEmail });

    const itemName = item.name || item.title || 'Unknown';
    const itemId = item.id || 'N/A';
    const itemLocation = item.location || item.city || item.country || item.university_name || '';

    console.log('📧 Email data prepared:', {
      itemType,
      itemName,
      universityName,
      universityEmail,
      userInfo,
      item: {
        id: item.id,
        name: item.name,
        title: item.title,
        type: item.type,
        alternate_email: item.alternate_email
      }
    });

    // Check if university email exists
    if (!universityEmail) {
      console.error('❌ University email not found for:', universityName);
      throw new Error(`University email not found for ${universityName}. Please contact support.`);
    }

    const emailData = {
      to: universityEmail,
      subject: `New Admission Request: ${itemType} - ${itemName}`,
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Admission Request</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
          :root {
              --primary: #0B6D76;
              --secondary: #0f766e;
              --accent: #f59e0b;
              --dark: #1e293b;
              --light: #f8fafc;
          }
          body {
              font-family: 'Space Grotesk', sans-serif;
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              margin: 0;
              padding: 0;
              line-height: 1.6;
          }
          .email-container {
              max-width: 640px;
              margin: 40px auto;
              background: white;
              border-radius: 24px;
              box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .email-header {
              padding: 40px 0;
              text-align: center;
              background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          }
          .logo {
              height: 48px;
              width: auto;
              filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
          }
          .email-body {
              padding: 40px;
              color: var(--dark);
          }
          h1 {
              color: var(--primary);
              font-size: 28px;
              margin-bottom: 20px;
              font-weight: 700;
              line-height: 1.2;
          }
          p {
              font-size: 16px;
              line-height: 1.7;
              color: #475569;
          }
          .request-details {
              background: #f0fdf4;
              border-left: 4px solid var(--primary);
              padding: 20px;
              margin: 20px 0;
              border-radius: 8px;
          }
          .student-info {
              background: #eff6ff;
              border-left: 4px solid var(--secondary);
              padding: 20px;
              margin: 20px 0;
              border-radius: 8px;
          }
          .action-button {
              display: inline-block;
              background: var(--primary);
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 8px;
              margin: 20px 0;
              font-weight: 600;
          }
          .email-footer {
              background: var(--dark);
              padding: 20px;
              text-align: center;
              font-size: 14px;
              color: rgba(255, 255, 255, 0.8);
              border-top: 1px solid rgba(255, 255, 255, 0.1);
          }
          @media (max-width: 640px) {
              .email-body { padding: 32px 24px; }
              h1 { font-size: 24px; }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <img src="https://universitiespagecrm.com/assets/logo-h-new.png" class="logo" alt="Universities Page Logo">
          </div>
          <div class="email-body">
            <h1>🎓 New Admission Request</h1>
            <p>Dear Admissions Team,</p>
            <p>A prospective student has submitted an admission request for your institution through Universities Page.</p>
            
            <div class="request-details">
              <h3 style="color: var(--primary); margin-top: 0;">Request Details:</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li><strong>Institution:</strong> ${universityName}</li>
                <li><strong>Program/Course:</strong> ${itemName}</li>
                <li><strong>Request Type:</strong> Admission Information</li>
                ${itemLocation ? `<li><strong>Location:</strong> ${itemLocation}</li>` : ''}
                <li><strong>Request Date:</strong> ${new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  timeZone: 'Asia/Karachi'
                })}</li>
              </ul>
            </div>

            <div class="student-info">
              <h3 style="color: var(--secondary); margin-top: 0;">Student Information:</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li><strong>Name:</strong> ${userInfo.name}</li>
                <li><strong>Phone:</strong> ${userInfo.phone}</li>
                <li><strong>Email:</strong> ${userInfo.email}</li>
              </ul>
            </div>

            <p><strong>Next Steps:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Please contact the student within 24-48 hours</li>
              <li>Provide detailed information about admission requirements</li>
              <li>Share application deadlines and procedures</li>
              <li>Offer to schedule a consultation if needed</li>
            </ul>

            <p style="margin-top: 20px;">This request was generated through our platform. Please ensure timely follow-up to provide excellent student service.</p>
            
            <p style="margin-top: 32px;">Best Regards,<br>
              <strong>Universities Page Team</strong><br>
              <a href="mailto:support@universitiespage.com" style="color: var(--primary);">support@universitiespage.com</a><br>
              <a href="https://www.universitiespage.com" style="color: var(--primary);">www.universitiespage.com</a>
            </p>
          </div>
          <div class="email-footer">
            <p style="margin: 0;">© ${new Date().getFullYear()} Universities Page. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
      `,
    };

    console.log('📤 Sending email with data:', {
      to: emailData.to,
      subject: emailData.subject,
      itemType,
      itemName,
      universityName
    });

    const result = await sendEmailViaAPI(emailData);
    console.log('📨 Email sending result:', result);
    return result;
  } catch (error) {
    console.error('❌ Error in sendRequestInfoEmail:', error);
    throw error; // Re-throw to handle in the calling function
  }
};

// Helper function to format Karachi time
function formatKarachiTime(date = new Date()) {
  return date.toLocaleString('en-PK', {
    timeZone: 'Asia/Karachi',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Send assignment email to consultant
 */
export async function sendAssignmentEmailToConsultant(consultantEmail, studentData) {
  const emailData = {
    to: consultantEmail,
    subject: `New Student Assigned: ${studentData.name}`,
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Student Assignment</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        :root {
            --primary: #6366f1;
            --secondary: #ec4899;
            --accent: #f59e0b;
            --dark: #1e293b;
            --light: #f8fafc;
        }
        body {
            font-family: 'Space Grotesk', sans-serif;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            margin: 0;
            padding: 0;
            line-height: 1.6;
        }
        .email-container {
            max-width: 640px;
            margin: 40px auto;
            background: white;
            border-radius: 24px;
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .email-header {
            padding: 40px 0;
            text-align: center;
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
        }
        .logo {
            height: 48px;
            width: auto;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }
        .email-body {
            padding: 40px;
            color: var(--dark);
        }
        h1 {
            color: var(--dark);
            font-size: 32px;
            margin-bottom: 28px;
            font-weight: 800;
            line-height: 1.2;
        }
        p {
            font-size: 17px;
            line-height: 1.7;
            color: #475569;
        }
        .student-info {
            background: #f9fafb;
            border-left: 4px solid var(--primary);
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
        }
        .important-notes {
            background: #f0fdf4;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .email-footer {
            background: var(--dark);
            padding: 32px;
            text-align: center;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.8);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        @media (max-width: 640px) {
            .email-body { padding: 32px 24px; }
            h1 { font-size: 28px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <img src="https://crm-universitiespage.com/reactapis/public/uploads/logo-h-new.png" class="logo" alt="Universities Page Logo">
        </div>
        <div class="email-body">
          <h1>New Student Assignment</h1>
          <p>Assalam-o-Alaikum,</p>
          <p>You have been assigned a new student consultation:</p>
          <div class="student-info">
            <p><strong>Student Name:</strong> ${studentData.name}</p>
            <p><strong>Phone:</strong> ${studentData.phone}</p>
            <p><strong>Email:</strong> ${studentData.email}</p>
            <p><strong>Interest:</strong> ${studentData.interest}</p>
            <p><strong>Assigned Date:</strong> ${formatKarachiTime(new Date(studentData.assignedDate))}</p>
          </div>
          <p style="font-weight: bold;">Please contact the student within 24 hours.</p>
          <div class="important-notes">
            <p style="color: #166534; font-weight: bold;">Important Notes:</p>
            <ul style="margin-top: 5px;">
              <li>Update the follow-up status after contacting</li>
              <li>Mark as completed when consultation is finished</li>
            </ul>
          </div>
          <p style="margin-top: 32px;">Best Regards,<br>
            Universities Page
            <br>
            www.Universitiespage.com
          </p>
        </div>
        <div class="email-footer">
          <p style="margin: 0;">© ${new Date().getFullYear()} Universities Page.</p>
        </div>
      </div>
    </body>
    </html>
    `,
  };

  return await sendEmailViaAPI(emailData);
}

/**
 * Send consultant assigned email to student
 */
export async function sendConsultantAssignedEmail(studentEmail, consultantName, assignedDate) {
  const emailData = {
    to: studentEmail,
    subject: 'Your Education Consultant Has Been Assigned',
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Consultant Assigned</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        :root {
            --primary: #6366f1;
            --secondary: #ec4899;
            --accent: #f59e0b;
            --dark: #1e293b;
            --light: #f8fafc;
        }
        body {
            font-family: 'Space Grotesk', sans-serif;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            margin: 0;
            padding: 0;
            line-height: 1.6;
        }
        .email-container {
            max-width: 640px;
            margin: 40px auto;
            background: white;
            border-radius: 24px;
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .email-header {
            padding: 40px 0;
            text-align: center;
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
        }
        .logo {
            height: 48px;
            width: auto;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }
        .email-body {
            padding: 40px;
            color: var(--dark);
        }
        h1 {
            color: var(--dark);
            font-size: 32px;
            margin-bottom: 28px;
            font-weight: 800;
            line-height: 1.2;
        }
        p {
            font-size: 17px;
            line-height: 1.7;
            color: #475569;
        }
        .consultant-info {
            background: #f9fafb;
            border-left: 4px solid var(--primary);
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
        }
        .expectations {
            background: #eff6ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .email-footer {
            background: var(--dark);
            padding: 32px;
            text-align: center;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.8);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        @media (max-width: 640px) {
            .email-body { padding: 32px 24px; }
            h1 { font-size: 28px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <img src="https://crm-universitiespage.com/reactapis/public/uploads/logo-h-new.png" class="logo" alt="Universities Page Logo">
        </div>
        <div class="email-body">
          <h1>Consultant Assigned</h1>
          <p>Dear Student,</p>
          <p>We're pleased to inform you that your education consultant has been assigned:</p>
          <div class="consultant-info">
            <p><strong>Consultant Name:</strong> ${consultantName}</p>
            <p><strong>Assigned Date:</strong> ${formatKarachiTime(new Date(assignedDate))}</p>
          </div>
          <p>Your consultant will contact you shortly to discuss your educational needs.</p>
          <div class="expectations">
            <p style="color: #1e40af; font-weight: bold;">What to expect:</p>
            <ul style="margin-top: 5px;">
              <li>Initial contact within 24 hours</li>
              <li>Personalized guidance for your education path</li>
              <li>Assistance with university applications</li>
            </ul>
          </div>
          <p style="margin-top: 32px;">Best Regards,<br>
            Universities Page
            <br>
            www.Universitiespage.com
          </p>
        </div>
        <div class="email-footer">
          <p style="margin: 0;">© ${new Date().getFullYear()} Universities Page.</p>
        </div>
      </div>
    </body>
    </html>
    `,
  };

  return await sendEmailViaAPI(emailData);
}

/**
 * Send not connected status email
 */
export async function sendNotConnectedStatusEmail({ 
  email, 
  name, 
  consularName, 
  genderPrefix, 
  studentPhone, 
  consularPhone 
}) {
  const current_time = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Karachi',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const emailData = {
    to: email,
    subject: `We couldn't reach you - Universities Page`,
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Not Connected Mail</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        :root {
            --primary: #6366f1;
            --secondary: #ec4899;
            --accent: #f59e0b;
            --dark: #1e293b;
            --light: #f8fafc;
        }
        body {
            font-family: 'Space Grotesk', sans-serif;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            margin: 0;
            padding: 0;
            line-height: 1.6;
        }
        .email-container {
            max-width: 640px;
            margin: 40px auto;
            background: white;
            border-radius: 24px;
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .email-header {
            padding: 40px 0;
            text-align: center;
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
        }
        .logo {
            height: 48px;
            width: auto;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }
        .email-body {
            padding: 40px;
            color: var(--dark);
        }
        h1 {
            color: var(--dark);
            font-size: 32px;
            margin-bottom: 28px;
            font-weight: 800;
            line-height: 1.2;
        }
        p {
            font-size: 17px;
            line-height: 1.7;
            color: #475569;
        }
        .email-footer {
            background: var(--dark);
            padding: 32px;
            text-align: center;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.8);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        @media (max-width: 640px) {
            .email-body { padding: 32px 24px; }
            h1 { font-size: 28px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <img src="https://crm-universitiespage.com/reactapis/public/uploads/logo-h-new.png" class="logo" alt="Universities Page Logo">
        </div>
        <div class="email-body">
          <p>Dear <strong style="color: var(--primary);">${name}</strong>,</p>
          <p>Our dedicated counselor, ${genderPrefix} ${consularName}, attempted to reach you at your provided phone
          number, ${studentPhone} at ${current_time}, but was unable to connect</p>
          <p>Please feel free to contact your counselor directly at <strong>${consularPhone}</strong> during office hours. If we do not
          hear from you, your free assessment window will be closed in 2 days.</p>
          <p>Thank you for your understanding.</p>
          <p style="margin-top: 32px;">Best Regards,<br>
            Universities Page
            <br>
            <br>
            www.Universitiespage.com
          </p>
        </div>
        <div class="email-footer">
          <p style="margin: 0;">© ${new Date().getFullYear()} Universities Page.</p>
        </div>
      </div>
    </body>
    </html>
    `,
  };

  return await sendEmailViaAPI(emailData);
}













// import { Resend } from 'resend'; // Or your preferred email service

// const resend = new Resend(process.env.RESEND_API_KEY);

// export const sendPasswordEmail = async ({ email, name, password }) => {
//   try {
//     const { data, error } = await resend.emails.send({
//       from: 'Acme <onboarding@resend.dev>',
//       to: email,
//       subject: 'Your Account Password',
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <h2 style="color: #2563eb;">Welcome to Our Platform, ${name}!</h2>
//           <p>You've successfully signed up using a social provider. Here's your automatically generated password:</p>
          
//           <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
//             <p style="font-weight: bold; margin: 0; font-size: 18px;">${password}</p>
//           </div>
          
//           <p>You can use this password to log in with your email address.</p>
//           <p style="color: #ef4444; font-weight: bold;">For security reasons, we recommend changing this password after your first login.</p>
          
//           <p>Best regards,<br/>The Team</p>
//         </div>
//       `,
//     });

//     if (error) {
//       console.error('Error sending email:', error);
//       return false;
//     }

//     return true;
//   } catch (error) {
//     console.error('Error in sendPasswordEmail:', error);
//     return false;
//   }
// };

// export const sendRequestInfoEmail = async ({ item, userInfo }) => {
//   try {
//     let itemType = 'Item';
//     if (item.name && item.logo) itemType = 'University';
//     else if (item.name && item.university_id) itemType = 'Course';
//     else if (item.title && item.guide_type) itemType = 'Guide';
//     else if (item.title) itemType = 'Article';

//     const itemName = item.name || item.title || 'Unknown';
//     const itemId = item.id || 'N/A';
//     const itemLocation = item.location || item.university_name || '';

//     const html = `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>Request Information Mail</title>
//       <style>
//         @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
//         :root {
//             --primary: #6366f1;
//             --secondary: #ec4899;
//             --accent: #f59e0b;
//             --dark: #1e293b;
//             --light: #f8fafc;
//         }
//         body {
//             font-family: 'Space Grotesk', sans-serif;
//             background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
//             margin: 0;
//             padding: 0;
//             line-height: 1.6;
//         }
//         .email-container {
//             max-width: 640px;
//             margin: 40px auto;
//             background: white;
//             border-radius: 24px;
//             box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
//             overflow: hidden;
//             border: 1px solid rgba(255, 255, 255, 0.2);
//         }
//         .email-header {
//             padding: 40px 0;
//             text-align: center;
//             background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
//         }
//         .logo {
//             height: 48px;
//             width: auto;
//             filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
//         }
//         .email-body {
//             padding: 40px;
//             color: var(--dark);
//         }
//         h1 {
//             color: var(--dark);
//             font-size: 28px;
//             margin-bottom: 20px;
//             font-weight: 700;
//             line-height: 1.2;
//         }
//         p {
//             font-size: 16px;
//             line-height: 1.7;
//             color: #475569;
//         }
//         .email-footer {
//             background: var(--dark);
//             padding: 20px;
//             text-align: center;
//             font-size: 14px;
//             color: rgba(255, 255, 255, 0.8);
//             border-top: 1px solid rgba(255, 255, 255, 0.1);
//         }
//         @media (max-width: 640px) {
//             .email-body { padding: 32px 24px; }
//             h1 { font-size: 24px; }
//         }
//       </style>
//     </head>
//     <body>
//       <div class="email-container">
//         <div class="email-header">
//           <img src="https://universitiespagecrm.com/assets/logo-h-new.png" class="logo" alt="Universities Page Logo">
//         </div>
//         <div class="email-body">
//           <h1>New Request Information</h1>
//           <p>A user has requested more information for the following <strong style="color: var(--primary);">${itemType}</strong>:</p>
//           <ul>
//             <li><strong>Type:</strong> ${itemType}</li>
//             <li><strong>Name/Title:</strong> ${itemName}</li>
//             <li><strong>ID:</strong> ${itemId}</li>
//             ${itemLocation ? <li><strong>Location/University:</strong> ${itemLocation}</li> : ''}
//           </ul>
//           <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
//           <p><strong>User Details:</strong></p>
//           <ul>
//             <li><strong>Name:</strong> ${userInfo.name}</li>
//             <li><strong>Phone:</strong> ${userInfo.phone}</li>
//             <li><strong>Email:</strong> ${userInfo.email}</li>
//           </ul>
//           <p style="margin-top: 20px;">Please follow up with the user as needed.</p>
//           <p style="margin-top: 32px;">Best Regards,<br>Universities Page<br><br>www.Universitiespage.com</p>
//         </div>
//         <div class="email-footer">
//           <p style="margin: 0;">© ${new Date().getFullYear()} Universities Page.</p>
//         </div>
//       </div>
//     </body>
//     </html>
//     `;

//     const { error } = await resend.emails.send({
//       from: 'University Info <onboarding@resend.dev>',
//       to: 'muhammad.bilal0729@gmail.com',
//       subject: Request `Information: ${itemType} - ${itemName}`,
//       html,
//     });

//     if (error) {
//       console.error('❌ Error sending email:', error);
//       return false;
//     }
//     return true;
//   } catch (error) {
//     console.error('❌ Error in sendRequestInfoEmail:', error);
//     return false;
//   }
// };




// //free consulation all emails

// function formatKarachiTime(date = new Date()) {
//   return date.toLocaleString('en-PK', {
//     timeZone: 'Asia/Karachi',
//     weekday: 'long',
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit',
//     second: '2-digit'
//   });
// }


// export async function sendAssignmentEmailToConsultant(consultantEmail, studentData) {
//   try {
//     const { error } = await resend.emails.send({
//       from: 'Student Assignments <assignments@universitiespage.com>',
//       to: consultantEmail,
//       subject: `New Student Assigned: ${studentData.name}`,
//       html: `
// <!DOCTYPE html>
// <html lang="en">

// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>New Student Assignment</title>
//     <style>
//         @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

//         :root {
//             --primary: #6366f1;
//             --secondary: #ec4899;
//             --accent: #f59e0b;
//             --dark: #1e293b;
//             --light: #f8fafc;
//         }

//         body {
//             font-family: 'Space Grotesk', sans-serif;
//             background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
//             margin: 0;
//             padding: 0;
//             line-height: 1.6;
//         }

//         .email-container {
//             max-width: 640px;
//             margin: 40px auto;
//             background: white;
//             border-radius: 24px;
//             box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
//             overflow: hidden;
//             border: 1px solid rgba(255, 255, 255, 0.2);
//         }

//         .email-header {
//             padding: 40px 0;
//             text-align: center;
//             background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
//         }

//         .logo {
//             height: 48px;
//             width: auto;
//             filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
//         }

//         .email-body {
//             padding: 40px;
//             color: var(--dark);
//         }

//         h1 {
//             color: var(--dark);
//             font-size: 32px;
//             margin-bottom: 28px;
//             font-weight: 800;
//             line-height: 1.2;
//         }

//         p {
//             font-size: 17px;
//             line-height: 1.7;
//             color: #475569;
//         }

//         .student-info {
//             background: #f9fafb;
//             border-left: 4px solid var(--primary);
//             padding: 20px;
//             margin: 20px 0;
//             border-radius: 8px;
//         }

//         .important-notes {
//             background: #f0fdf4;
//             padding: 20px;
//             border-radius: 8px;
//             margin: 20px 0;
//         }

//         .email-footer {
//             background: var(--dark);
//             padding: 32px;
//             text-align: center;
//             font-size: 14px;
//             color: rgba(255, 255, 255, 0.8);
//             border-top: 1px solid rgba(255, 255, 255, 0.1);
//         }

//         @media (max-width: 640px) {
//             .email-body {
//                 padding: 32px 24px;
//             }

//             h1 {
//                 font-size: 28px;
//             }
//         }
//     </style>
// </head>

// <body>
//     <div class="email-container">
//         <div class="email-header">
//             <img src="https://crm-universitiespage.com/reactapis/public/uploads/logo-h-new.png" class="logo" alt="Universities Page Logo">
//         </div>

//         <div class="email-body">
//             <h1>New Student Assignment</h1>
            
//             <p>Assalam-o-Alaikum,</p>
//             <p>You have been assigned a new student consultation:</p>
            
//             <div class="student-info">
//                 <p><strong>Student Name:</strong> ${studentData.name}</p>
//                 <p><strong>Phone:</strong> ${studentData.phone}</p>
//                 <p><strong>Email:</strong> ${studentData.email}</p>
//                 <p><strong>Interest:</strong> ${studentData.interest}</p>
//                 <p><strong>Assigned Date:</strong> ${formatKarachiTime(new Date(studentData.assignedDate))}</p>
//             </div>
            
//             <p style="font-weight: bold;">Please contact the student within 24 hours.</p>
            
//             <div class="important-notes">
//                 <p style="color: #166534; font-weight: bold;">Important Notes:</p>
//                 <ul style="margin-top: 5px;">
//                     <li>Update the follow-up status after contacting</li>
//                     <li>Mark as completed when consultation is finished</li>
//                 </ul>
//             </div>
            
//             <p style="margin-top: 32px;">Best Regards,<br>
//                 Universities Page
//                 <br>
//                 www.Universitiespage.com
//             </p>
//         </div>

//         <div class="email-footer">
//             <p style="margin: 0;">© ${new Date().getFullYear()} Universities Page.</p>
//         </div>
//     </div>
// </body>
// </html>
//       `,
//     });

//     if (error) throw error;
//     return true;
//   } catch (error) {
//     console.error('Error sending assignment email:', error);
//     return false;
//   }
// }

// export async function sendConsultantAssignedEmail(studentEmail, consultantName, assignedDate) {
//   try {
//     const { error } = await resend.emails.send({
//       from: 'Consultant Support <support@universitiespage.com>',
//       to: studentEmail,
//       subject: 'Your Education Consultant Has Been Assigned',
//       html: `
// <!DOCTYPE html>
// <html lang="en">

// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Consultant Assigned</title>
//     <style>
//         @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

//         :root {
//             --primary: #6366f1;
//             --secondary: #ec4899;
//             --accent: #f59e0b;
//             --dark: #1e293b;
//             --light: #f8fafc;
//         }

//         body {
//             font-family: 'Space Grotesk', sans-serif;
//             background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
//             margin: 0;
//             padding: 0;
//             line-height: 1.6;
//         }

//         .email-container {
//             max-width: 640px;
//             margin: 40px auto;
//             background: white;
//             border-radius: 24px;
//             box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
//             overflow: hidden;
//             border: 1px solid rgba(255, 255, 255, 0.2);
//         }

//         .email-header {
//             padding: 40px 0;
//             text-align: center;
//             background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
//         }

//         .logo {
//             height: 48px;
//             width: auto;
//             filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
//         }

//         .email-body {
//             padding: 40px;
//             color: var(--dark);
//         }

//         h1 {
//             color: var(--dark);
//             font-size: 32px;
//             margin-bottom: 28px;
//             font-weight: 800;
//             line-height: 1.2;
//         }

//         p {
//             font-size: 17px;
//             line-height: 1.7;
//             color: #475569;
//         }

//         .consultant-info {
//             background: #f9fafb;
//             border-left: 4px solid var(--primary);
//             padding: 20px;
//             margin: 20px 0;
//             border-radius: 8px;
//         }

//         .expectations {
//             background: #eff6ff;
//             padding: 20px;
//             border-radius: 8px;
//             margin: 20px 0;
//         }

//         .email-footer {
//             background: var(--dark);
//             padding: 32px;
//             text-align: center;
//             font-size: 14px;
//             color: rgba(255, 255, 255, 0.8);
//             border-top: 1px solid rgba(255, 255, 255, 0.1);
//         }

//         @media (max-width: 640px) {
//             .email-body {
//                 padding: 32px 24px;
//             }

//             h1 {
//                 font-size: 28px;
//             }
//         }
//     </style>
// </head>

// <body>
//     <div class="email-container">
//         <div class="email-header">
//             <img src="https://crm-universitiespage.com/reactapis/public/uploads/logo-h-new.png" class="logo" alt="Universities Page Logo">
//         </div>

//         <div class="email-body">
//             <h1>Consultant Assigned</h1>
            
//             <p>Dear Student,</p>
//             <p>We're pleased to inform you that your education consultant has been assigned:</p>
            
//             <div class="consultant-info">
//                 <p><strong>Consultant Name:</strong> ${consultantName}</p>
//                 <p><strong>Assigned Date:</strong> ${formatKarachiTime(new Date(assignedDate))}</p>
//             </div>
            
//             <p>Your consultant will contact you shortly to discuss your educational needs.</p>
            
//             <div class="expectations">
//                 <p style="color: #1e40af; font-weight: bold;">What to expect:</p>
//                 <ul style="margin-top: 5px;">
//                     <li>Initial contact within 24 hours</li>
//                     <li>Personalized guidance for your education path</li>
//                     <li>Assistance with university applications</li>
//                 </ul>
//             </div>
            
//             <p style="margin-top: 32px;">Best Regards,<br>
//                 Universities Page
//                 <br>
//                 www.Universitiespage.com
//             </p>
//         </div>

//         <div class="email-footer">
//             <p style="margin: 0;">© ${new Date().getFullYear()} Universities Page.</p>
//         </div>
//     </div>
// </body>
// </html>
//       `,
//     });

//     if (error) throw error;
//     return true;
//   } catch (error) {
//     console.error('Error sending consultant assigned email:', error);
//     return false;
//   }
// }

// export async function sendNotConnectedStatusEmail({ 
//   email, 
//   name, 
//   consularName, 
//   genderPrefix, 
//   studentPhone, 
//   consularPhone 
// }) {
//   try {
//     const current_time = new Date().toLocaleString('en-US', {
//       timeZone: 'Asia/Karachi',
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true
//     });

//     const { error } = await resend.emails.send({
//       from: 'Support Team <support@universitiespage.com>',
//       to: email,
//       subject: `We couldn't reach you - Universities Page`,
//       html: `
// <!DOCTYPE html>
// <html lang="en">

// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Not Connected Mail</title>
//     <style>
//         @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

//         :root {
//             --primary: #6366f1;
//             --secondary: #ec4899;
//             --accent: #f59e0b;
//             --dark: #1e293b;
//             --light: #f8fafc;
//         }

//         body {
//             font-family: 'Space Grotesk', sans-serif;
//             background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
//             margin: 0;
//             padding: 0;
//             line-height: 1.6;
//         }

//         .email-container {
//             max-width: 640px;
//             margin: 40px auto;
//             background: white;
//             border-radius: 24px;
//             box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
//             overflow: hidden;
//             border: 1px solid rgba(255, 255, 255, 0.2);
//         }

//         .email-header {
//             padding: 40px 0;
//             text-align: center;
//             background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
//         }

//         .logo {
//             height: 48px;
//             width: auto;
//             filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
//         }

//         .email-body {
//             padding: 40px;
//             color: var(--dark);
//         }

//         h1 {
//             color: var(--dark);
//             font-size: 32px;
//             margin-bottom: 28px;
//             font-weight: 800;
//             line-height: 1.2;
//         }

//         p {
//             font-size: 17px;
//             line-height: 1.7;
//             color: #475569;
//         }

//         .email-footer {
//             background: var(--dark);
//             padding: 32px;
//             text-align: center;
//             font-size: 14px;
//             color: rgba(255, 255, 255, 0.8);
//             border-top: 1px solid rgba(255, 255, 255, 0.1);
//         }

//         @media (max-width: 640px) {
//             .email-body {
//                 padding: 32px 24px;
//             }

//             h1 {
//                 font-size: 28px;
//             }
//         }
//     </style>
// </head>

// <body>
//     <div class="email-container">
//         <div class="email-header">
//             <img src="https://crm-universitiespage.com/reactapis/public/uploads/logo-h-new.png" class="logo" alt="Universities Page Logo">
//         </div>

//         <div class="email-body">

//                <p>Dear <strong style="color: var(--primary);">${name}</strong>,</p>

//                 <p> Our dedicated counselor, ${genderPrefix} ${consularName}, attempted to reach you at your provided phone
//         number, ${studentPhone} at ${current_time}, but was unable to connect</p>

//           <p>Please feel free to contact your counselor directly at <strong>${consularPhone} </strong>during office hours. If we do not
//         hear from you, your free assessment window will be closed in 2 days..</p>

//         <p>
//             Thank you for your understanding.
//         </p>

//             <p style="margin-top: 32px;">Best Regards,<br>
//                 Universities Page
//                 <br>
//                 <br>
//                 www.Universitiespage.com
//                 </p>
//         </div>

//         <div class="email-footer">
//             <p style="margin: 0;">© ${new Date().getFullYear()} Universities Page.</p>
//         </div>
//     </div>
// </body>

// </html>
//       `,
//     });

//     if (error) throw error;
//     return true;
//   } catch (error) {
//     console.error('Error sending not connected status email:', error);
//     return false;
//   }
// }

