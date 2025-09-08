import { getToken } from "next-auth/jwt"; // Or your own auth system
import { sendRequestInfoEmail } from "../../../../lib/email";

export async function POST(req) {
  try {
    // Try to get token but don't fail hard if NEXTAUTH_SECRET is missing
    let token = null;
    try {
      if (process.env.NEXTAUTH_SECRET) {
        token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      } else {
        // If no secret, try without it (may work in some cases)
        token = await getToken({ req });
      }
    } catch (authError) {
      console.warn('Auth token retrieval failed:', authError?.message || authError);
      token = null;
    }

    const body = await req.json().catch(() => ({}));
    const { item, userInfo: bodyUserInfo } = body || {};

    console.log('🔍 Request-info API received body:', body);
    console.log('🔍 Request-info API received item:', item);
    console.log('🔍 Request-info API received userInfo:', bodyUserInfo);

    if (!item) {
      return Response.json({ 
        success: false, 
        error: 'Missing item payload' 
      }, { status: 400 });
    }

    // If token exists, enforce role restriction; otherwise allow as guest
    if (token && !['student', 'consultant'].includes(token.role)) {
      return Response.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const userInfo = token ? {
      name: token.name || 'Unknown User',
      phone: token.phone || 'Not provided',
      email: token.email || 'No email',
    } : (bodyUserInfo || {
      name: 'Guest User',
      phone: body?.phone || 'Not provided',
      email: body?.email || 'No email',
    });

    console.log('📧 Processing request for:', {
      itemType: item.name ? 'University' : 'Course',
      itemName: item.name || item.title,
      userInfo,
      hasToken: !!token
    });

    const success = await sendRequestInfoEmail({ item, userInfo });

    return Response.json({ 
      success,
      message: success ? 'Request processed successfully' : 'Failed to process request'
    });

  } catch (error) {
    console.error("❌ API Error in /api/request-info:", error);
    
    // Return more specific error messages
    if (error.message.includes('University email not found')) {
      return Response.json({ 
        success: false, 
        error: error.message 
      }, { status: 400 });
    }
    
    return Response.json({ 
      success: false, 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}