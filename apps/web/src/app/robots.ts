import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://saipunjabifoods.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/account',
          '/checkout',
          '/order-confirmation/',
          '/tracking/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
