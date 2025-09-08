import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function GET() {
  try {
    // Count all consultants from the consultants table
    const count = await prisma.consultants.count();
    
    console.log('Total consultants in database:', count);
    
    return NextResponse.json({ 
      success: true, 
      count: count,
      message: `Found ${count} consultants in database`
    });
  } catch (error) {
    console.error('Error counting consultants:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to count consultants',
      message: error.message 
    }, { status: 500 });
  }
}