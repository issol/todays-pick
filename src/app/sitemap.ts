import type { MetadataRoute } from 'next';
import { LOCATIONS, getTopLocations } from '@/lib/seo';
import { CATEGORIES } from '@/lib/utils/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://todayspick.kr';
  const currentDate = new Date();

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Add all location pages
  LOCATIONS.forEach((location) => {
    routes.push({
      url: `${baseUrl}/location/${location.slug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  });

  // Add all category pages
  CATEGORIES.forEach((category) => {
    routes.push({
      url: `${baseUrl}/category/${category.id}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  });

  // Add top 10 locations × all categories combo pages
  const topLocations = getTopLocations(10);
  topLocations.forEach((location) => {
    CATEGORIES.forEach((category) => {
      routes.push({
        url: `${baseUrl}/location/${location.slug}/${category.id}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.5,
      });
    });
  });

  return routes;
}
