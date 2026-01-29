import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createMetadata, itemListJsonLd, breadcrumbJsonLd, getLocationBySlug, getAllLocationSlugs } from '@/lib/seo';
import { CATEGORIES } from '@/lib/utils/constants';

interface LocationPageProps {
  params: Promise<{
    location: string;
  }>;
}

export const revalidate = 3600; // ISR: revalidate every 1 hour

export async function generateStaticParams() {
  const slugs = getAllLocationSlugs();
  return slugs.map((slug) => ({
    location: slug,
  }));
}

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const { location: locationSlug } = await params;
  const location = getLocationBySlug(locationSlug);

  if (!location) {
    return createMetadata({
      title: '페이지를 찾을 수 없습니다',
    });
  }

  return createMetadata({
    title: `${location.name} 맛집 추천`,
    description: `${location.name} 지역의 검증된 맛집을 추천받아보세요. 평점 4.0 이상, 리뷰 50개 이상의 인기 맛집만 엄선했습니다.`,
    path: `/location/${location.slug}`,
    keywords: [
      `${location.name} 맛집`,
      `${location.name} 음식점`,
      `${location.name} 점심`,
      `${location.name} 식당 추천`,
    ],
  });
}

export default async function LocationPage({ params }: LocationPageProps) {
  const { location: locationSlug } = await params;
  const location = getLocationBySlug(locationSlug);

  if (!location) {
    notFound();
  }

  const categoryItems = CATEGORIES.map((cat) => ({
    name: `${location.name} ${cat.label}`,
    url: `/location/${location.slug}/${cat.id}`,
    description: `${location.name} 지역의 ${cat.label} 맛집 추천`,
  }));

  const breadcrumbs = [
    { name: '홈', url: '/' },
    { name: '지역별 맛집', url: '/location' },
    { name: location.name, url: `/location/${location.slug}` },
  ];

  const itemListJson = itemListJsonLd(categoryItems);
  const breadcrumbJson = breadcrumbJsonLd(breadcrumbs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }}
      />
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <header className="mb-12">
          <h1 className="mb-4 text-4xl font-bold">{location.name} 맛집 추천</h1>
          <p className="text-lg text-gray-600">
            {location.name} 지역의 검증된 맛집을 카테고리별로 추천받아보세요.
          </p>
        </header>

        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">카테고리별 맛집</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((category) => (
              <a
                key={category.id}
                href={`/location/${location.slug}/${category.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-orange-500 hover:shadow-md"
              >
                <h3 className="mb-2 text-xl font-semibold">{category.label}</h3>
                <p className="text-sm text-gray-600">
                  {location.name} {category.label} 맛집
                </p>
              </a>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">{location.name} 인기 맛집</h2>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
            <p className="mb-4 text-gray-600">
              {location.name} 지역의 맛집 목록은 곧 업데이트됩니다.
            </p>
            <a
              href="/"
              className="inline-block rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
            >
              지금 랜덤 추천받기
            </a>
          </div>
        </section>

        <section className="rounded-lg bg-orange-50 p-8">
          <h2 className="mb-4 text-2xl font-bold">오늘의 픽 이용하기</h2>
          <p className="mb-4 text-gray-700">
            {location.name} 주변의 맛집을 3초 만에 추천받아보세요.
            위치를 허용하고 원하는 카테고리를 선택하면 바로 추천받을 수 있습니다.
          </p>
          <ul className="mb-6 space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="mr-2 text-orange-500">✓</span>
              <span>평점 4.0 이상 맛집만 추천</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-orange-500">✓</span>
              <span>실시간 네이버 지도 연동</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-orange-500">✓</span>
              <span>카테고리별 맞춤 추천</span>
            </li>
          </ul>
          <a
            href="/"
            className="inline-block rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
          >
            맛집 추천받기
          </a>
        </section>
      </div>
    </>
  );
}
