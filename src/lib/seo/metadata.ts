import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://todayspick.kr';
const SITE_NAME = '오늘의 픽';
const DEFAULT_TITLE = '오늘의 픽 - 점심 메뉴 추천, 3초 랜덤 맛집';
const DEFAULT_DESCRIPTION = '내 주변 맛집을 3초 만에 추천받아보세요. 오늘 점심 메뉴 고민 끝!';

interface CreateMetadataParams {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string[];
  image?: string;
}

export function createMetadata({
  title,
  description,
  path = '',
  keywords = [],
  image = '/og-image.png',
}: CreateMetadataParams = {}): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const fullDescription = description || DEFAULT_DESCRIPTION;
  const fullUrl = `${SITE_URL}${path}`;
  const fullImageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  const defaultKeywords = [
    '맛집',
    '점심',
    '메뉴 추천',
    '랜덤 추천',
    '음식점',
    '식당',
    '오늘의 픽',
  ];

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: [...defaultKeywords, ...keywords],
    authors: [{ name: 'Today\'s Pick' }],
    creator: 'Today\'s Pick',
    publisher: 'Today\'s Pick',
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url: fullUrl,
      siteName: SITE_NAME,
      locale: 'ko_KR',
      type: 'website',
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [fullImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export function getSiteUrl(): string {
  return SITE_URL;
}

export function getSiteName(): string {
  return SITE_NAME;
}
