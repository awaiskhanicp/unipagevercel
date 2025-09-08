import { prisma } from '../../../../lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// GET - Fetch all guides
export async function GET(req) {
  const { searchParams } = new URL(req.url, `http://${req.headers.get('host') || 'localhost'}`);
  const slug = searchParams.get('slug');

  if (slug) {
    const normalize = (str) => str.toLowerCase().replace(/[-_]+/g, ' ').trim();
    const guides = await prisma.guides.findMany({ orderBy: { created_at: 'desc' } });
    const guide = guides.find(g => normalize(g.title) === normalize(slug));

    if (!guide) {
      return new Response(JSON.stringify({ error: 'Guide not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(guide), { status: 200 });
  }

  try {
    const guides = await prisma.guides.findMany({
      orderBy: { created_at: 'desc' }
    });

    return Response.json(guides);
  } catch (err) {
    console.error("❌ GET API Error:", err);
    return Response.json({ error: "Failed to fetch guides" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    /* -------- 1. read multipart  form -------- */
    const formData = await req.formData();

    // helper to pull a normal field
    const field = (k) => formData.get(k) || null;

    /* -------- 2. handle image upload -------- */
    let imagePath = null;
    const file = formData.get('featuredImage');        // <input name="featuredImage" />
    if (file && file.name) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadsDir, { recursive: true });    // make sure folder exists
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '')}`;
      await writeFile(path.join(uploadsDir, fileName), buffer);
      imagePath = `/uploads/${fileName}`;               // <img src={imagePath} />
    }

    /* -------- 3. insert into DB -------- */
    const newGuide = await prisma.guides.create({
      data: {
        user_id: Number(field('user_id') ?? 1),        // 🔑  adjust auth as needed
        guide_type: field('type'),
        university_id: field('university_id') ? Number(field('university_id')) : null,
        subject_id: field('subject_id') ? Number(field('subject_id')) : null,
        title: field('title'),
        slug: field('slug'),
        sub_title: field('subTitle'),
        sort_order: field('sortOrder') ? Number(field('sortOrder')) : 0,
        description: field('description'),             // HTML string from Summernote
        sm_question: field('schema')                   // we'll store full JSON here
          ? JSON.stringify(JSON.parse(field('schema'))[0]?.question ?? '')
          : null,
        sm_answer: field('schema')
          ? JSON.stringify(JSON.parse(field('schema'))[0]?.answer ?? '')
          : null,
        review_detail: field('reviews') ? field('reviews') : null, // keep JSON
        image: imagePath,
        image_ext: imagePath ? path.extname(imagePath) : null,
        is_active: field('active') === 'true',
        seo: field('metaTags')
          ? JSON.stringify({
              title: field('metaTitle'),
              description: field('metaDescription'),
              keywords: field('metaKeywords'),
            })
          : null,
        is_featured: false,
      },
    });

    return Response.json({ ok: true, data: newGuide }, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ ok: false, message: err.message }, { status: 500 });
  }
}