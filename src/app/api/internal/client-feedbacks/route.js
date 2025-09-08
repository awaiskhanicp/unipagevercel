import { prisma } from '../../../../lib/prisma';

export async function POST(req) {
  try {
    const data = await req.json();
    // Destructure and validate required fields
    const {
      full_name,
      contact_number,
      consultant_id,
      rating,
      average_rating,
      behaviour_satis_level,
      timely_response,
      call_response,
      knowledge,
      likelihood,
      customer_experience,
      suggestion
    } = data;

    if (!full_name || !contact_number || !consultant_id || !rating) {
      return Response.json({ ok: false, message: 'Missing required fields' }, { status: 400 });
    }

    // Validate all numeric fields
    const requiredNumericFields = [
      behaviour_satis_level,
      timely_response,
      call_response,
      knowledge,
      likelihood,
      customer_experience,
      rating,
      average_rating,
      consultant_id
    ];
    if (requiredNumericFields.some(v => typeof v !== 'number' || isNaN(v) || v === 0)) {
      return Response.json({ ok: false, message: 'All experience and rating fields are required and must be valid numbers.' }, { status: 400 });
    }

    const feedback = await prisma.client_feedbacks.create({
      data: {
        full_name,
        contact_number,
        consultant_id: Number(consultant_id),
        rating: Number(rating),
        average_rating: Number(average_rating),
        behaviour_satis_level: Number(behaviour_satis_level),
        timely_response: Number(timely_response),
        call_response: Number(call_response),
        knowledge: Number(knowledge),
        likelihood: Number(likelihood),
        customer_experience: Number(customer_experience),
        first_followup: suggestion || null,
      },
    });

    return Response.json({ ok: true, message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    console.error('Feedback API error:', error);
    return Response.json({ ok: false, message: 'Failed to submit feedback' }, { status: 500 });
  }
}