import axios from 'axios';

export async function GET(req) {
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
    const response = await axios.get('https://crm-universitiespage.com/reactapis/api/track-application', {
      headers: {
        Authorization: 'Bearer 2hxSgYy4ho4glBvb5bcPenq8Ld14qqWLNuK0XocgB56TUl2swv',
      },
      params: {
        name,
        passportNumber,
      },
    });

    return Response.json({ success: true, data: response.data });
  } catch (error) {
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
