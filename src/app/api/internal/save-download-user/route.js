import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

function serializeBigInt(obj) {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, phone, documentId } = body;

    if (!name || !email || !phone || !documentId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const user = await prisma.document_download_users.create({
      data: {
        name,
        email,
        phone,
        document_id: BigInt(documentId),
      },
    });

    return NextResponse.json(
      { success: true, message: 'User saved successfully', user: serializeBigInt(user) },
      { status: 200 }
    );
  } catch (error) {
    console.error('Save user error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save user', error: error.message },
      { status: 500 }
    );
  }
}
