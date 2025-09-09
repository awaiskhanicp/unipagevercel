import axios from 'axios';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');
  const passportNumber = searchParams.get('passportNumber');

  if (!name || !passportNumber) {
    return Response.json(
      { success: false, message: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(
      'https://crm-universitiespage.com/reactapis/api/track-application',
      {
        headers: {
          Authorization: `Bearer ${process.env.CRM_API_KEY}`,
        },
        params: { name, passportNumber },
      }
    );

    return Response.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error('API error:', error?.response?.data || error.message);
    return Response.json(
      {
        success: false,
        error: error?.response?.data || 'Something went wrong',
      },
      { status: 500 }
    );
  }
}
