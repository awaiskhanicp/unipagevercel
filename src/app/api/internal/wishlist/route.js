import { NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { prisma } from '../../../../lib/prisma';

export async function GET(req) {
  // Get wishlist for logged-in user
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Changed from findUnique to findFirst
  const user = await prisma.users.findFirst({ 
    where: { email: session.user.email } 
  });

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const wishlist = await prisma.wishlist.findMany({
    where: { user_id: user.id },
    include: { course: true, university: true }
  });

  return NextResponse.json({ wishlist });
}

export async function POST(req) {
  // Add to wishlist
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Changed from findUnique to findFirst
  const user = await prisma.users.findFirst({ 
    where: { email: session.user.email } 
  });

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { course_id, university_id } = await req.json();
  if (!course_id && !university_id) {
    return NextResponse.json({ error: 'Missing course_id or university_id' }, { status: 400 });
  }

  // Prevent duplicate
  const exists = await prisma.wishlist.findFirst({
    where: { 
      user_id: user.id, 
      course_id: course_id || null, 
      university_id: university_id || null 
    }
  });

  if (exists) return NextResponse.json({ success: true, wishlist: exists });

  const wishlist = await prisma.wishlist.create({
    data: {
      user_id: user.id,
      course_id: course_id || null,
      university_id: university_id || null
    }
  });

  return NextResponse.json({ success: true, wishlist });
}

export async function DELETE(req) {
  // Remove from wishlist
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Changed from findUnique to findFirst
  const user = await prisma.users.findFirst({ 
    where: { email: session.user.email } 
  });

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { course_id, university_id } = await req.json();
  if (!course_id && !university_id) {
    return NextResponse.json({ error: 'Missing course_id or university_id' }, { status: 400 });
  }

  await prisma.wishlist.deleteMany({
    where: {
      user_id: user.id,
      course_id: course_id || null,
      university_id: university_id || null
    }
  });

  return NextResponse.json({ success: true });
}

export async function PUT(req) {
  // Sync localStorage wishlist to DB on login
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Changed from findUnique to findFirst
  const user = await prisma.users.findFirst({ 
    where: { email: session.user.email } 
  });

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { items } = await req.json();
  if (!Array.isArray(items)) {
    return NextResponse.json({ error: 'Invalid items' }, { status: 400 });
  }

  // Add all items (skip duplicates)
  for (const item of items) {
    const exists = await prisma.wishlist.findFirst({
      where: {
        user_id: user.id,
        course_id: item.course_id || null,
        university_id: item.university_id || null
      }
    });

    if (!exists) {
      await prisma.wishlist.create({
        data: {
          user_id: user.id,
          course_id: item.course_id || null,
          university_id: item.university_id || null
        }
      });
    }
  }

  return NextResponse.json({ success: true });
}