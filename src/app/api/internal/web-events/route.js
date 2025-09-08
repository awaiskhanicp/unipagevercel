import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

// GET all web events with pagination
export async function GET(req) {
  try {
    const startTime = Date.now();
    console.log('🔍 Web Events API: Starting GET request...');
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 15;
    const search = searchParams.get("search") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    console.log('🔍 Web Events API: Filter params:', { page, limit, search, startDate, endDate });

    const skip = (page - 1) * limit;

    // Build where clause for filters
    const where = {};
    
    // Search filter
    if (search) {
      where.OR = [
        { type: { contains: search } },
        { action_button: { contains: search } },
        { page_hit_name: { contains: search } },
        { whatsapp_button_text: { contains: search } },
      ];
    }
    
    // Date range filter
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) {
        where.created_at.gte = new Date(startDate);
      }
      if (endDate) {
        where.created_at.lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    console.log('🔍 Web Events API: Final where clause:', JSON.stringify(where, null, 2));

    // Get total count
    const totalCount = await prisma.web_events.count({ where });
    console.log('🔍 Web Events API: Total count with filters:', totalCount);

    // Get paginated data
    const events = await prisma.web_events.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalCount / limit);
    const responseTime = Date.now() - startTime;

    console.log('🔍 Web Events API: Response details:', {
      totalCount,
      totalPages,
      eventsReturned: events.length,
      responseTime: `${responseTime}ms`
    });

    return NextResponse.json({
      success: true,
      data: events,
      meta: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("❌ Web Events API Error:", error);
    console.error("❌ Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { success: false, message: "Failed to fetch web events" },
      { status: 500 }
    );
  }
}

// POST new web event
export async function POST(req) {
  try {
    const body = await req.json();
    console.log('🔍 Web Events API: Creating new event with data:', body);
    
    const { type, action_button, page_hit_name, whatsapp_button_text } = body;

    if (!type || !action_button || !page_hit_name || !whatsapp_button_text) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    const newEvent = await prisma.web_events.create({
      data: {
        type,
        action_button,
        page_hit_name,
        whatsapp_button_text,
      },
    });

    console.log('✅ Web Events API: Event created successfully:', newEvent.id);

    return NextResponse.json({
      success: true,
      data: newEvent,
      message: "Web event created successfully",
    });
  } catch (error) {
    console.error("❌ Web Events API Error creating event:", error);
    console.error("❌ Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { success: false, message: "Failed to create web event" },
      { status: 500 }
    );
  }
}