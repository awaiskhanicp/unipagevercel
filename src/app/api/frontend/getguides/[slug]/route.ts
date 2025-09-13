
import { NextRequest } from 'next/server';
import pool from '../../../../../lib/db/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest, { params }) {
  try {
    const { slug } = params;

    if (!slug) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Slug is required' 
      }), { status: 400 });
    }

    // Check if guides table has any data
    const [totalGuides] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) AS total FROM guides');
    console.log('📊 Total guides in database:', totalGuides[0].total);

    if (totalGuides[0].total === 0) {
      console.log('❌ No guides found in database');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No guides available' 
      }), { status: 404 });
    }

    // First try to find by exact slug match
    let [guideResult] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM guides WHERE slug = ? AND is_active = 1 LIMIT 1', [slug]
    );

    let guide = guideResult[0]; // If found, it will be in the first item of the array

    // If not found by exact slug, try to find by normalized title
    if (!guide) {
      console.log('🔍 Exact slug not found, trying normalized title match...');
      
      const [allGuides] = await pool.query<RowDataPacket[]>('SELECT id, title, slug, is_active FROM guides WHERE is_active = 1');

      console.log('🔍 Available active guides:', allGuides.map(g => ({
        id: g.id,
        title: g.title,
        slug: g.slug,
        is_active: g.is_active
      })));

      // Normalize the slug for comparison
      const normalizeSlug = (str) => str.toLowerCase().replace(/[-_]+/g, ' ').trim();
      const normalizedSlug = normalizeSlug(slug);
      console.log('🔍 Normalized search slug:', normalizedSlug);

      // Try to find the guide by normalized slug or title
      guide = allGuides.find(g => {
        // Check if guide has a slug and it matches
        if (g.slug) {
          const guideSlug = normalizeSlug(g.slug);
          console.log(`🔍 Comparing guide slug "${guideSlug}" with search "${normalizedSlug}"`);
          return guideSlug === normalizedSlug;
        }
        // If no slug, check if title matches
        if (g.title) {
          const guideTitle = normalizeSlug(g.title);
          console.log(`🔍 Comparing guide title "${guideTitle}" with search "${normalizedSlug}"`);
          return guideTitle === normalizedSlug;
        }
        return false;
      });

      if (guide) {
        console.log('✅ Guide found by normalized title/slug match');
      }
    }

    if (!guide) {
      console.log('❌ Guide not found for slug:', slug);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Guide not found' 
      }), { status: 404 });
    }

    console.log('✅ Guide found:', { id: guide.id, title: guide.title, slug: guide.slug });

    return new Response(JSON.stringify({
      success: true,
      data: guide
    }));

  } catch (err) {
    console.error("❌ GET Guide by slug API Error:", err);
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Failed to fetch guide",
      details: err.message 
    }), { status: 500 });
  }
}
