// src/app/main/guides/[slug]/page.jsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Container from '../../../../app/components/atoms/Container';
import Heading from '../../../../app/components/atoms/Heading';
import { FaFacebook, FaLinkedin, FaTwitter, FaWhatsapp } from 'react-icons/fa';

// This function runs on the server to generate metadata
export async function generateMetadata({ params }) {
  const { slug } = params;
  
  try {
    // Fetch guide data on the server using relative path
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/internal/guides/${encodeURIComponent(slug)}`, {
      cache: 'force-cache' // Use cached data for metadata
    });
    
    if (!response.ok) {
      return {
        title: 'Guide Not Found - University Portal',
        description: 'The requested guide could not be found.'
      };
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      return {
        title: 'Guide Not Found - University Portal',
        description: 'The requested guide could not be found.'
      };
    }
    
    const guide = result.data;
    let seoData = {};
    
    // Parse SEO data
    if (guide.seo) {
      try {
        seoData = typeof guide.seo === 'string' ? JSON.parse(guide.seo) : guide.seo;
      } catch (e) {
        console.error('Error parsing SEO data:', e);
      }
    }
    
    // Determine if we should show meta tags
    const showMeta = seoData.show_meta !== 'off';
    
    return {
      title: showMeta && seoData.meta_title ? seoData.meta_title : guide.title,
      description: showMeta && seoData.meta_description ? seoData.meta_description : (guide.short_description || guide.title),
      keywords: showMeta && seoData.meta_keywords ? seoData.meta_keywords : '',
      openGraph: {
        title: showMeta && seoData.meta_title ? seoData.meta_title : guide.title,
        description: showMeta && seoData.meta_description ? seoData.meta_description : (guide.short_description || guide.title),
        images: [guide.image || '/assets/placeholder-guide.png'],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: showMeta && seoData.meta_title ? seoData.meta_title : guide.title,
        description: showMeta && seoData.meta_description ? seoData.meta_description : (guide.short_description || guide.title),
        images: [guide.image || '/assets/placeholder-guide.png'],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'University Guides - University Portal',
      description: 'Comprehensive guides for students seeking education opportunities'
    };
  }
}

// This function runs on the server to fetch data
async function getGuideData(slug) {
  try {
    // Use relative path for API call
    const response = await fetch(`http://localhost:3000/api/internal/guides/${encodeURIComponent(slug)}`, {
      cache: 'no-store' // Don't cache for individual page data
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return { notFound: true };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      return { notFound: true };
    }
    
    return { guide: result.data };
  } catch (error) {
    console.error('Error fetching guide:', error);
    return { notFound: true };
  }
}

async function getRelatedGuides(currentGuideId) {
  try {
    const response = await fetch(`http://localhost:3000/api/internal/guides`, {
      cache: 'force-cache' // Cache related guides
    });
    
    if (!response.ok) {
      return [];
    }
    
    const result = await response.json();
    const items = Array.isArray(result) ? result : (result.data || []);
    
    // Filter out current guide and get first 3
    return items.filter(g => g.id !== currentGuideId).slice(0, 3);
  } catch (error) {
    console.error('Error fetching related guides:', error);
    return [];
  }
}

export default async function GuideDetailPage({ params }) {
  const { slug } = params;
  const { guide, notFound } = await getGuideData(slug);
  
  if (notFound) {
    notFound();
  }
  
  const relatedGuides = await getRelatedGuides(guide.id);
  
  // Prepare share URLs
  const currentUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/guides/${slug}`;
  const shareTitle = encodeURIComponent(guide.title);

  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${shareTitle}&url=${encodeURIComponent(currentUrl)}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${shareTitle} ${encodeURIComponent(currentUrl)}`;
  
  return (
    <Container>
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <Heading level={1} className="mb-6">
            {guide.title}
          </Heading>
          
          <div className="flex justify-center items-center gap-4 mb-8">
            <a 
              href={facebookShareUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-teal-600 w-10 h-10 rounded-full flex justify-center items-center text-white hover:bg-teal-700 transition-colors"
              aria-label="Share on Facebook"
            >
              <FaFacebook />
            </a>
            <a 
              href={twitterShareUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-teal-600 w-10 h-10 rounded-full flex justify-center items-center text-white hover:bg-teal-700 transition-colors"
              aria-label="Share on Twitter"
            >
              <FaTwitter />
            </a>
            <a 
              href={linkedinShareUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-teal-600 w-10 h-10 rounded-full flex justify-center items-center text-white hover:bg-teal-700 transition-colors"
              aria-label="Share on LinkedIn"
            >
              <FaLinkedin />
            </a>
            <a 
              href={whatsappShareUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-teal-600 w-10 h-10 rounded-full flex justify-center items-center text-white hover:bg-teal-700 transition-colors"
              aria-label="Share on WhatsApp"
            >
              <FaWhatsapp />
            </a>
          </div>
        </div>

        {guide.image && (
          <div className="w-full mb-8">
            <Image
              src={guide.image}
              alt={guide.title}
              width={800}
              height={450}
              className="w-full h-auto object-cover rounded-lg shadow-lg"
              priority
            />
          </div>
        )}

        <div className="prose max-w-none mx-auto text-gray-700">
          {guide.description ? (
            <div dangerouslySetInnerHTML={{ __html: guide.description }} />
          ) : (
            <p className="text-center text-gray-500">No description available for this guide.</p>
          )}
        </div>
      </div>

      {/* Related Guides */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="text-center mb-8">
          <Heading level={3}>You might be interested in <span className="text-teal-700">Guides</span></Heading>
        </div>
        {relatedGuides.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedGuides.map((g) => (
              <Link 
                key={g.id} 
                href={`/guides/${g.slug?.toLowerCase?.().replace(/\s+/g, '-').replace(/-+/g, '-') || g.slug}`} 
                className="block"
              >
                <div className="bg-[#eef6f7] rounded-[24px] p-4 h-full hover:shadow-lg transition">
                  <div className="mb-3 min-h-[56px] flex items-center">
                    <Heading level={5}>{g.title}</Heading>
                  </div>
                  <div className="w-full overflow-hidden rounded-lg">
                    <Image
                      src={g.image || '/assets/placeholder-guide.png'}
                      alt={g.title}
                      width={552}
                      height={300}
                      className="object-cover w-full h-[220px]"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">No related guides found.</div>
        )}
      </div>
    </Container>
  );
}