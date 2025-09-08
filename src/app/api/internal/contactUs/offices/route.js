import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function GET() {
  try {
    console.log('🔍 Offices API: Starting...');
    
    // Test Prisma client
    console.log('🔍 Offices API: Testing Prisma client...');
    console.log('🔍 Offices API: Prisma client type:', typeof prisma);
    console.log('🔍 Offices API: Prisma client methods:', Object.keys(prisma));
    
    // Test basic database connection
    console.log('🔍 Offices API: Testing database connection...');
    const totalCount = await prisma.contact_us_messages.count();
    console.log('✅ Offices API: Database connection successful. Total messages:', totalCount);
    
    if (totalCount === 0) {
      console.log('⚠️ Offices API: No contact messages found in database');
      return NextResponse.json({
        success: true,
        data: [],
        debug: {
          totalMessages: 0,
          uniqueOffices: 0,
          message: 'No contact messages found in database'
        }
      });
    }
    
    // Get a sample message to see the structure
    console.log('🔍 Offices API: Getting sample message...');
    const sampleMessage = await prisma.contact_us_messages.findFirst({
      select: {
        id: true,
        user_name: true,
        office_location: true
      }
    });
    console.log('✅ Offices API: Sample message:', sampleMessage);
    
    // Simple approach: get all messages and extract unique offices
    console.log('🔍 Offices API: Getting all messages...');
    const allMessages = await prisma.contact_us_messages.findMany({
      select: {
        office_location: true
      }
    });
    
    console.log('🔍 Offices API: All messages fetched:', allMessages.length);
    console.log('🔍 Offices API: Sample office locations:', allMessages.slice(0, 5));
    
    // Extract unique office locations
    const uniqueOffices = new Set();
    allMessages.forEach(msg => {
      if (msg.office_location && msg.office_location.trim() !== '') {
        uniqueOffices.add(msg.office_location);
      }
    });
    
    const officeList = Array.from(uniqueOffices).sort();
    console.log('✅ Offices API: Unique offices found:', officeList);
    
    // Format response
    const formattedOffices = officeList.map((location, index) => ({
      id: index + 1,
      location: location
    }));
    
    console.log('✅ Offices API: Formatted offices:', formattedOffices);
    
    return NextResponse.json({
      success: true,
      data: formattedOffices,
      debug: {
        totalMessages: totalCount,
        uniqueOffices: officeList.length,
        sampleOffices: officeList.slice(0, 3)
      }
    });
    
  } catch (error) {
    console.error("❌ Offices API Error:", error);
    console.error("❌ Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch office locations",
      details: error.message,
      debug: {
        errorName: error.name,
        errorMessage: error.message
      }
    }, { status: 500 });
  }
}