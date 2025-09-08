import { prisma } from '../../../../../lib/prisma';
import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, message: 'Invalid application ID' },
        { status: 400 }
      );
    }

    // Get the application to find the resume file path
    const application = await prisma.job_applies.findUnique({
      where: { id: parseInt(id) },
      select: { resume: true }
    });

    if (!application) {
      return NextResponse.json(
        { success: false, message: 'Application not found' },
        { status: 404 }
      );
    }

    // Delete the application from database
    await prisma.job_applies.delete({
      where: { id: parseInt(id) }
    });

    // Delete the resume file if it exists
    if (application.resume) {
      try {
        const filePath = path.join(process.cwd(), 'public', application.resume);
        await unlink(filePath);
      } catch (fileError) {
        console.warn('Could not delete resume file:', fileError);
        // Don't fail the request if file deletion fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Job application deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting job application:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete application',
        details: error.message 
      },
      { status: 500 }
    );
  }
}