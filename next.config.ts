import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      { // Allow images from example.com used in placeholder data
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/**',
      },
      { // Allow images from The New York Times
        protocol: 'https',
        hostname: 'static01.nyt.com',
        port: '',
        pathname: '/**',
      },
      { // Allow images from The Guardian
        protocol: 'https',
        hostname: 'i.guim.co.uk',
        port: '',
        pathname: '/**',
      },
      { // Allow images from Los Angeles Times
        protocol: 'https',
        hostname: 'ca-times.brightspotcdn.com',
        port: '',
        pathname: '/**',
      },
      { // Allow images from Boston Herald
        protocol: 'https',
        hostname: 'www.bostonherald.com',
        port: '',
        pathname: '/**',
      },
      { // Allow images from News-Herald
        protocol: 'https',
        hostname: 'www.news-herald.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
