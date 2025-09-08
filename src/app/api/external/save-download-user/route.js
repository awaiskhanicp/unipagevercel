import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, phone, documentId } = body || {};

    if (!name || !email || !phone || !documentId) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const user = await prisma.document_download_users.create({
      data: {
        document_id: Number(documentId),
        name,
        email,
        phone,
        emailSended: 0,
        smsSended: 0,
        not_connected_status: 0,
        unsubscribed: 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Convert BigInt fields to string for safe JSON
    const safe = {
      ...user,
      id: user.id?.toString?.() || user.id,
      document_id: user.document_id?.toString?.() || user.document_id,
    };

    return NextResponse.json({ success: true, data: safe });
  } catch (error) {
    console.error('save-download-user POST error:', error);
    return NextResponse.json({ success: false, message: 'Failed to save download user' }, { status: 500 });
  }
}