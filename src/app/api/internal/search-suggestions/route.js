import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma'; // make sure your prisma client is correctly imported

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'university';
    const country = searchParams.get('country') || '';

    // If query is empty, return top 10 for the selected type
    if (!q.trim()) {
      let results = [];
      if (type === 'university') {
        results = await prisma.university_details.findMany({
          select: { name: true },
          take: 10,
        });
        return NextResponse.json(results.map(item => item.name));
      } else if (type === 'course') {
        results = await prisma.courses.findMany({
          select: { name: true },
          take: 10,
        });
        return NextResponse.json(results.map(item => item.name));
      } else if (type === 'country') {
        results = await prisma.countries.findMany({
          select: { country: true },
          take: 10,
        });
        return NextResponse.json(results.map(item => item.country));
      }
      return NextResponse.json([]);
    }

    // If query is present, filter accordingly
    let results = [];
    if (type === 'university') {
      results = await prisma.university_details.findMany({
        where: {
          name: {
            contains: q,
          },
          ...(country && country !== 'All Country' && {
            country: {
              equals: country,
            },
          }),
        },
        select: { name: true },
        take: 10,
      });
      return NextResponse.json(results.map(item => item.name));
    } else if (type === 'course') {
      results = await prisma.courses.findMany({
        where: {
          name: {
            contains: q,
          },
          ...(country && country !== 'All Country' && {
            country: {
              equals: country,
            },
          }),
        },
        select: { name: true },
        take: 10,
      });
      return NextResponse.json(results.map(item => item.name));
    } else if (type === 'country') {
      results = await prisma.countries.findMany({
        where: {
          country: {
            contains: q,
          },
        },
        select: { country: true },
        take: 10,
      });
      return NextResponse.json(results.map(item => item.country));
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error('[SUGGESTIONS_GET_ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch search suggestions' }, { status: 500 });
  }
}