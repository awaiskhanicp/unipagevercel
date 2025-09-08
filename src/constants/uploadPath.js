export const UPLOAD_PATHS = {
  // Base paths for different types of uploads
  IMAGES: {
    PROFILE: 'uploads/images/profile',
    GALLERY: 'uploads/images/gallery', 
    PRODUCTS: 'uploads/images/products',
    BLOG: 'uploads/images/blog',
    BANNERS: 'uploads/images/banners',
    THUMBNAILS: 'uploads/images/thumbnails',
    GENERAL: 'uploads/images/general'
  },
  
  VISA: {
    COUNTRY: 'uploads/visa/countries',
    BANNER: 'uploads/visa/banners',
    DOCUMENTS: 'uploads/visa/documents'
  },
  
  UNIVERSITY: {
    LOGO: 'uploads/university/logos',
    FEATURE: 'uploads/university/features',
    GALLERY: 'uploads/university/gallery',
    BANNERS: 'uploads/university/banners'
  },
  
  COUNTRIES: {
    FLAGS: 'uploads/countries/flags',
    FEATURES: 'uploads/countries/features'
  },
  
  ARTICLES: {
    FEATURED: 'uploads/articles/featured',
    THUMBNAILS: 'uploads/articles/thumbnails',
    CONTENT: 'uploads/articles/content'
  },
  
  COURSES: {
    FEATURED: 'uploads/courses/featured',
    THUMBNAILS: 'uploads/courses/thumbnails',
    BANNERS: 'uploads/courses/banners',
    MATERIALS: 'uploads/courses/materials'
  },
  
  JOBS: {
    FEATURED: 'uploads/jobs/featured',
    COMPANY_LOGOS: 'uploads/jobs/company-logos',
    BANNERS: 'uploads/jobs/banners'
  },
  
  GUIDES: {
    FEATURED: 'uploads/guides/featured',
    THUMBNAILS: 'uploads/guides/thumbnails',
    CONTENT: 'uploads/guides/content',
    BANNERS: 'uploads/guides/banners'
  },
  
  DOCUMENTS: {
    PDF: 'uploads/documents/pdf',
    REPORTS: 'uploads/documents/reports',
    CERTIFICATES: 'uploads/documents/certificates'
  },
  
  MEDIA: {
    VIDEOS: 'uploads/media/videos',
    AUDIO: 'uploads/media/audio'
  }
};

// Default upload path (you can change this to any path from above)
export const DEFAULT_UPLOAD_PATH = UPLOAD_PATHS.IMAGES.GENERAL;

// Function to get upload path by type
export const getUploadPath = (type = 'general') => {
  const pathMap = {
    'profile': UPLOAD_PATHS.IMAGES.PROFILE,
    'gallery': UPLOAD_PATHS.IMAGES.GALLERY,
    'products': UPLOAD_PATHS.IMAGES.PRODUCTS,
    'blog': UPLOAD_PATHS.IMAGES.BLOG,
    'banners': UPLOAD_PATHS.IMAGES.BANNERS,
    'thumbnails': UPLOAD_PATHS.IMAGES.THUMBNAILS,
    'general': UPLOAD_PATHS.IMAGES.GENERAL,
    // Visa paths
    'visa-country': UPLOAD_PATHS.VISA.COUNTRY,
    'visa-banner': UPLOAD_PATHS.VISA.BANNER,
    'visa-documents': UPLOAD_PATHS.VISA.DOCUMENTS,
    // University paths
    'university-logo': UPLOAD_PATHS.UNIVERSITY.LOGO,
    'university-feature': UPLOAD_PATHS.UNIVERSITY.FEATURE,
    'university-gallery': UPLOAD_PATHS.UNIVERSITY.GALLERY,
    'university-banners': UPLOAD_PATHS.UNIVERSITY.BANNERS,
    // Countries paths
    'countries': UPLOAD_PATHS.COUNTRIES.FEATURES,
    'countries-flags': UPLOAD_PATHS.COUNTRIES.FLAGS,
    // Articles paths
    'articles': UPLOAD_PATHS.ARTICLES.FEATURED,
    'articles-featured': UPLOAD_PATHS.ARTICLES.FEATURED,
    'articles-thumbnails': UPLOAD_PATHS.ARTICLES.THUMBNAILS,
    'articles-content': UPLOAD_PATHS.ARTICLES.CONTENT,
    // Courses paths
    'courses': UPLOAD_PATHS.COURSES.FEATURED,
    'courses-featured': UPLOAD_PATHS.COURSES.FEATURED,
    'courses-thumbnails': UPLOAD_PATHS.COURSES.THUMBNAILS,
    'courses-banners': UPLOAD_PATHS.COURSES.BANNERS,
    'courses-materials': UPLOAD_PATHS.COURSES.MATERIALS,
    // Jobs paths
    'jobs': UPLOAD_PATHS.JOBS.FEATURED,
    'jobs-featured': UPLOAD_PATHS.JOBS.FEATURED,
    'jobs-company-logos': UPLOAD_PATHS.JOBS.COMPANY_LOGOS,
    'jobs-banners': UPLOAD_PATHS.JOBS.BANNERS,
    // Guides paths
    'guides': UPLOAD_PATHS.GUIDES.FEATURED,
    'guides-featured': UPLOAD_PATHS.GUIDES.FEATURED,
    'guides-thumbnails': UPLOAD_PATHS.GUIDES.THUMBNAILS,
    'guides-content': UPLOAD_PATHS.GUIDES.CONTENT,
    'guides-banners': UPLOAD_PATHS.GUIDES.BANNERS,
    // Document paths
    'pdf': UPLOAD_PATHS.DOCUMENTS.PDF,
    'reports': UPLOAD_PATHS.DOCUMENTS.REPORTS,
    'certificates': UPLOAD_PATHS.DOCUMENTS.CERTIFICATES,
    // Media paths
    'videos': UPLOAD_PATHS.MEDIA.VIDEOS,
    'audio': UPLOAD_PATHS.MEDIA.AUDIO
  };
  
  return pathMap[type.toLowerCase()] || DEFAULT_UPLOAD_PATH;
};

// Function to generate full S3 key with path and filename
export const generateS3Key = (uploadType = 'general', filename) => {
  const path = getUploadPath(uploadType);
  const timestamp = Date.now();
  const ext = filename.split('.').pop();
  const baseName = filename.split('.').slice(0, -1).join('.');
  const uniqueFilename = `${baseName}_${timestamp}.${ext}`;
  
  return `${path}/${uniqueFilename}`;
};

// Content file path for tracking uploads
export const CONTENT_FILE_PATH = 'data/uploaded-images.json';