import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// Global daily upload limit for all users combined
const GLOBAL_DAILY_LIMIT = 3;

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow
    
    // Count CV analyses created today
    const todayUploads = await prisma.cv_analysis.count({
      where: {
        created_at: {
          gte: today,
          lt: tomorrow
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      todayUploads,
      dailyLimit: GLOBAL_DAILY_LIMIT,
      remainingUploads: Math.max(0, GLOBAL_DAILY_LIMIT - todayUploads),
      canUpload: todayUploads < GLOBAL_DAILY_LIMIT
    });
  } catch (error) {
    console.error('Error checking daily upload limits:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check upload limits'
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Count today's uploads
    const todayUploads = await prisma.cv_analysis.count({
      where: {
        created_at: {
          gte: today,
          lt: tomorrow
        }
      }
    });
    
    // Check if limit reached
    if (todayUploads >= GLOBAL_DAILY_LIMIT) {
      return NextResponse.json({
        success: false,
        error: `Daily global upload limit of ${GLOBAL_DAILY_LIMIT} resumes reached. Please try again tomorrow.`,
        todayUploads,
        dailyLimit: GLOBAL_DAILY_LIMIT
      }, { status: 429 }); // Too Many Requests
    }
    
    return NextResponse.json({
      success: true,
      message: 'Upload allowed',
      todayUploads,
      dailyLimit: GLOBAL_DAILY_LIMIT,
      remainingUploads: GLOBAL_DAILY_LIMIT - todayUploads
    });
  } catch (error) {
    console.error('Error checking upload permission:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check upload permission'
    }, { status: 500 });
  }
}
