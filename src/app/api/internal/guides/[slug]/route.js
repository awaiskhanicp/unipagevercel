import { prisma } from '../../../../../lib/prisma';

// GET - Fetch guide by slug
export async function GET(request, { params }) {
    // console.log('aaaaaaaaaaaaaaaaaaa'); return 'false';
  try {
    const { slug } = params;
    
    if (!slug) {
      return Response.json({ 
        success: false, 
        error: 'Slug is required' 
      }, { status: 400 });
    }

    // console.log('🔍 Fetching guide by sluggggggggggggggggggggggggg:', slug);

    // Check if guides table has any data
    const totalGuides = await prisma.guides.count();
    console.log('📊 Total guides in database:', totalGuides);
    
    if (totalGuides === 0) {
      console.log('❌ No guides found in database');
      return Response.json({ 
        success: false, 
        error: 'No guides available' 
      }, { status: 404 });
    }

    // First try to find by exact slug match
    let guide = await prisma.guides.findFirst({
      where: { 
        slug: slug,
        is_active: 1 // Only active guides
      }
    });

    // If not found by exact slug, try to find by normalized title
    if (!guide) {
      console.log('🔍 Exact slug not found, trying normalized title match...');
      
      const allGuides = await prisma.guides.findMany({
        where: { is_active: 1 }
      });
      
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
      return Response.json({ 
        success: false, 
        error: 'Guide not found' 
      }, { status: 404 });
    }

    console.log('✅ Guide found:', { id: guide.id, title: guide.title, slug: guide.slug });

    return Response.json({
      success: true,
      data: guide
    });

  } catch (err) {
    console.error("❌ GET Guide by slug API Error:", err);
    return Response.json({ 
      success: false, 
      error: "Failed to fetch guide",
      details: err.message 
    }, { status: 500 });
  }
}
