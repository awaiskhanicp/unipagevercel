/** @type {import('next').NextConfig} */
const nextConfig = {
 
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/assets/**',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        pathname: '/**',
      },
    ],
     domains: [
      'unipage-website.s3.eu-north-1.amazonaws.com',
      'universitiespage.com', // filemanager domain
      'cdn.example.com',      // agar koi extra CDN use hota hai
      'mybucket.s3.amazonaws.com' // agar AWS S3 bucket alag hai
    ],
  },
};

module.exports = nextConfig;
