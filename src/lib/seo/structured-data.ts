import { getSiteUrl, getSiteName } from './metadata';

export function webApplicationJsonLd(): object {
  const siteUrl = getSiteUrl();
  const siteName = getSiteName();

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: siteName,
    url: siteUrl,
    description: '내 주변 맛집을 3초 만에 추천받아보세요. 오늘 점심 메뉴 고민 끝!',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
      bestRating: '5',
      worstRating: '1',
    },
    inLanguage: 'ko-KR',
  };
}

interface FAQ {
  question: string;
  answer: string;
}

export function faqPageJsonLd(faqs: FAQ[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

interface ListItem {
  name: string;
  url: string;
  description?: string;
}

export function itemListJsonLd(items: ListItem[]): object {
  const siteUrl = getSiteUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}`,
      ...(item.description && { description: item.description }),
    })),
  };
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]): object {
  const siteUrl = getSiteUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}`,
    })),
  };
}

export function localBusinessJsonLd(restaurant: {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  reviewCount?: number;
  phone?: string;
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurant.name,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'KR',
      streetAddress: restaurant.address,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
    },
    ...(restaurant.rating && restaurant.reviewCount && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: restaurant.rating,
        reviewCount: restaurant.reviewCount,
        bestRating: '5',
        worstRating: '1',
      },
    }),
    ...(restaurant.phone && { telephone: restaurant.phone }),
    servesCuisine: 'Korean',
  };
}
