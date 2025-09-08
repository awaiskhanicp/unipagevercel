import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function GET() {
  try {
    // Count all students from the students table
    const count = await prisma.students.count();
    
    console.log('Total students in database:', count);
    
    return NextResponse.json({ 
      success: true, 
      count: count,
      message: `Found ${count} students in database`
    });
  } catch (error) {
    console.error('Error counting students:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to count students',
      message: error.message 
    }, { status: 500 });
  }
}