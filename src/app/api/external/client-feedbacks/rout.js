import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';

function checkAuth(req) {
  const authHeader = req.headers.get('authorization');
  const token = process.env.API_SECRET_TOKEN;
  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== token) {
    return false;
  }
  return true;
}

// GET all client feedbacks with filtering, pagination, and search
export async function GET(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const search = searchParams.get('search') || '';
    const consultant_id = searchParams.get('consultant_id');
    const from_date = searchParams.get('from_date');
    const to_date = searchParams.get('to_date');

    const where = {};
    if (search) {
      where.OR = [
        { full_name: { contains: search } },
        { contact_number: { contains: search } },
      ];
    }
    if (consultant_id) where.consultant_id = Number(consultant_id);
    if (from_date || to_date) {
      where.created_at = {};
      if (from_date) {
        const d = new Date(from_date);
        if (!isNaN(d)) where.created_at.gte = d;
      }
      if (to_date) {
        const d = new Date(to_date);
        if (!isNaN(d)) where.created_at.lte = d;
      }
    }
    const orderBy = [
      { created_at: 'desc' },
    ];
    const [total, records] = await Promise.all([
      prisma.client_feedbacks.count({ where }),
      prisma.client_feedbacks.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      })
    ]);
    return NextResponse.json({ success: true, data: records, total, page, pageSize });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch feedbacks', message: process.env.NODE_ENV === 'development' ? error.message : null }, { status: 500 });
  }
}

// POST create new client feedback
export async function POST(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    // Basic validation
    if (!body.full_name || !body.contact_number || !body.consultant_id || !body.rating) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    // Validate all numeric fields
    const requiredNumericFields = [
      body.behaviour_satis_level,
      body.timely_response,
      body.call_response,
      body.knowledge,
      body.likelihood,
      body.customer_experience,
      body.rating,
      body.average_rating,
      body.consultant_id
    ];
    if (requiredNumericFields.some(v => typeof v !== 'number' || isNaN(v) || v === 0)) {
      return NextResponse.json({ success: false, error: 'All experience and rating fields are required and must be valid numbers.' }, { status: 400 });
    }
    // Create new feedback
    const feedback = await prisma.client_feedbacks.create({
      data: {
        full_name: body.full_name,
        contact_number: body.contact_number,
        consultant_id: Number(body.consultant_id),
        rating: Number(body.rating),
        average_rating: Number(body.average_rating),
        behaviour_satis_level: Number(body.behaviour_satis_level),
        timely_response: Number(body.timely_response),
        call_response: Number(body.call_response),
        knowledge: Number(body.knowledge),
        likelihood: Number(body.likelihood),
        customer_experience: Number(body.customer_experience),
        first_followup: body.suggestion || null,
      },
    });
    return NextResponse.json({ success: true, data: feedback }, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit feedback', message: process.env.NODE_ENV === 'development' ? error.message : null }, { status: 500 });
  }
}