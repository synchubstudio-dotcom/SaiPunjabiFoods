import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://saipunjabifoods.com';
  const lastModified = new Date();

  const routes = [
    '',
    '/menu',
    '/festivals',
    '/about',
    '/reviews',
    '/contact',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === '/menu' || route === '/festivals' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/menu' ? 0.9 : 0.7,
  }));
}
