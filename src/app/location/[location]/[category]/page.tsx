import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createMetadata, breadcrumbJsonLd, getLocationBySlug, getTopLocations } from '@/lib/seo';
import { CATEGORIES } from '@/lib/utils/constants';

interface LocationCategoryPageProps {
  params: Promise<{
    location: string;
    category: string;
  }>;
}

export const revalidate = 3600; // ISR: revalidate every 1 hour

export async function generateStaticParams() {
  const topLocations = getTopLocations(10);
  const params: { location: string; category: string }[] = [];

  topLocations.forEach((location) => {
    CATEGORIES.forEach((category) => {
      params.push({
        location: location.slug,
        category: category.id,
      });
    });
  });

  return params;
}

export async function generateMetadata({ params }: LocationCategoryPageProps): Promise<Metadata> {
  const { location: locationSlug, category: categoryId } = await params;
  const location = getLocationBySlug(locationSlug);
  const category = CATEGORIES.find((cat) => cat.id === categoryId);

  if (!location || !category) {
    return createMetadata({
      title: '페이지를 찾을 수 없습니다',
    });
  }

  return createMetadata({
    title: `${location.name} ${category.label} 맛집 추천`,
    description: `${location.name} 지역의 ${category.label} 맛집을 추천받아보세요. 평점 4.0 이상, 리뷰 50개 이상의 검증된 ${category.label} 맛집만 엄선했습니다.`,
    path: `/location/${location.slug}/${category.id}`,
    keywords: [
      `${location.name} ${category.label}`,
      `${location.name} ${category.label} 맛집`,
      `${location.name} ${category.label} 추천`,
      `${location.name} ${category.label} 음식점`,
    ],
  });
}

export default async function LocationCategoryPage({ params }: LocationCategoryPageProps) {
  const { location: locationSlug, category: categoryId } = await params;
  const location = getLocationBySlug(locationSlug);
  const category = CATEGORIES.find((cat) => cat.id === categoryId);

  if (!location || !category) {
    notFound();
  }

  const breadcrumbs = [
    { name: '홈', url: '/' },
    { name: '지역별 맛집', url: '/location' },
    { name: location.name, url: `/location/${location.slug}` },
    { name: category.label, url: `/location/${location.slug}/${category.id}` },
  ];

  const breadcrumbJson = breadcrumbJsonLd(breadcrumbs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }}
      />
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <header className="mb-12">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <a href="/" className="hover:text-orange-500">홈</a>
            <span>/</span>
            <a href={`/location/${location.slug}`} className="hover:text-orange-500">
              {location.name}
            </a>
            <span>/</span>
            <span className="text-gray-900">{category.label}</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold">
            {location.name} {category.label} 맛집 추천
          </h1>
          <p className="text-lg text-gray-600">
            {location.name} 지역의 검증된 {category.label} 맛집을 추천받아보세요.
          </p>
        </header>

        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">
            {location.name} {category.label} 추천 기준
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-3 text-xl font-semibold">품질 보증</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2 text-orange-500">✓</span>
                  <span>평점 4.0 이상</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-orange-500">✓</span>
                  <span>리뷰 50개 이상</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-orange-500">✓</span>
                  <span>네이버 지도 검증</span>
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-3 text-xl font-semibold">편리한 이용</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2 text-orange-500">✓</span>
                  <span>현재 위치 기반 추천</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-orange-500">✓</span>
                  <span>3초 만에 랜덤 선택</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-orange-500">✓</span>
                  <span>네이버 지도 길찾기 연동</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">
            {location.name} 다른 {category.label} 맛집
          </h2>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
            <p className="mb-4 text-gray-600">
              {location.name} {category.label} 맛집 목록은 곧 업데이트됩니다.
            </p>
            <a
              href="/"
              className="inline-block rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
            >
              지금 랜덤 추천받기
            </a>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">{location.name} 다른 카테고리</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.filter((cat) => cat.id !== category.id)
              .slice(0, 7)
              .map((cat) => (
                <a
                  key={cat.id}
                  href={`/location/${location.slug}/${cat.id}`}
                  className="block rounded-lg border border-gray-200 bg-white p-4 text-center transition-all hover:border-orange-500 hover:shadow-md"
                >
                  <h3 className="font-semibold">{cat.label}</h3>
                </a>
              ))}
          </div>
        </section>

        <section className="rounded-lg bg-orange-50 p-8">
          <h2 className="mb-4 text-2xl font-bold">
            오늘의 점심은 {location.name} {category.label}
          </h2>
          <p className="mb-6 text-gray-700">
            {location.name} 주변의 {category.label} 맛집을 3초 만에 추천받아보세요.
            위치를 허용하고 원하는 카테고리를 선택하면 바로 추천받을 수 있습니다.
          </p>
          <a
            href="/"
            className="inline-block rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
          >
            {location.name} {category.label} 추천받기
          </a>
        </section>
      </div>
    </>
  );
}
