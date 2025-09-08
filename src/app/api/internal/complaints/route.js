import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';

// GET all complaints
// api/internal/complaints/route.js
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 15;
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    let whereClause = {};

    if (search && search.trim().length >= 2) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { subject: { contains: search } },
        { message: { contains: search } },
      ];
    }

    const [complaints, totalItems] = await Promise.all([
      prisma.complaints.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          subject: true,
          message: true,
          created_at: true,
        },
      }),
      prisma.complaints.count({ where: whereClause }), // ✅ no select, just count
    ]);

    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    return NextResponse.json({
      success: true,
      data: complaints,
      meta: { page, limit, totalItems, totalPages, startIndex: skip, endIndex: skip + complaints.length },
    });
  } catch (error) {
    console.error("❌ GET /complaints error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error", details: error.message }, { status: 500 });
  }
}



export async function POST(req) {
  try {
    const body = await req.json();
    const { name, subject, email, phone, message, location } = body;

    // Validation
    if (!email || !message) {
      return NextResponse.json(
        { success: false, error: 'Email and message are required' },
        { status: 400 }
      );
    }

    // Allowed locations
    const allowedLocations = ['lahore', 'islamabad', 'karachi'];
    if (!location || !allowedLocations.includes(location.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Invalid location. Choose Lahore, Islamabad, or Karachi.' },
        { status: 400 }
      );
    }

    // Insert record
    const record = await prisma.complaints.create({
      data: {
        name,
        subject,
        email,
        phone: phone || null, // optional
        message,
        location: location.toLowerCase(),
      },
    });

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error) {
    console.error('❌ POST /api/internal/complaints error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

