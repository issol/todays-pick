import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createMetadata, breadcrumbJsonLd, getTopLocations } from '@/lib/seo';
import { CATEGORIES } from '@/lib/utils/constants';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export const revalidate = 3600; // ISR: revalidate every 1 hour

export async function generateStaticParams() {
  return CATEGORIES.map((category) => ({
    category: category.id,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: categoryId } = await params;
  const category = CATEGORIES.find((cat) => cat.id === categoryId);

  if (!category) {
    return createMetadata({
      title: '페이지를 찾을 수 없습니다',
    });
  }

  return createMetadata({
    title: `${category.label} 맛집 추천`,
    description: `전국 ${category.label} 맛집을 추천받아보세요. 평점 4.0 이상, 리뷰 50개 이상의 인기 ${category.label} 맛집만 엄선했습니다.`,
    path: `/category/${category.id}`,
    keywords: [
      `${category.label} 맛집`,
      `${category.label} 추천`,
      `${category.label} 음식점`,
      `${category.label} 식당`,
    ],
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categoryId } = await params;
  const category = CATEGORIES.find((cat) => cat.id === categoryId);

  if (!category) {
    notFound();
  }

  const topLocations = getTopLocations(10);

  const breadcrumbs = [
    { name: '홈', url: '/' },
    { name: '카테고리별 맛집', url: '/category' },
    { name: category.label, url: `/category/${category.id}` },
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
          <h1 className="mb-4 text-4xl font-bold">{category.label} 맛집 추천</h1>
          <p className="text-lg text-gray-600">
            전국 {category.label} 맛집을 지역별로 추천받아보세요.
          </p>
        </header>

        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">주요 지역별 {category.label} 맛집</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topLocations.map((location) => (
              <a
                key={location.slug}
                href={`/location/${location.slug}/${category.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-orange-500 hover:shadow-md"
              >
                <h3 className="mb-2 text-xl font-semibold">
                  {location.name} {category.label}
                </h3>
                <p className="text-sm text-gray-600">
                  {location.name} 지역의 {category.label} 맛집 추천
                </p>
              </a>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">{category.label} 맛집 특징</h2>
          <div className="rounded-lg border border-gray-200 bg-white p-8">
            <p className="mb-4 text-gray-700">
              오늘의 픽에서 추천하는 {category.label} 맛집은 다음 기준을 충족합니다.
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="mr-2 text-orange-500">✓</span>
                <span>평점 4.0 이상 고품질 맛집</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-orange-500">✓</span>
                <span>리뷰 50개 이상 검증된 맛집</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-orange-500">✓</span>
                <span>실시간 네이버 지도 연동</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-orange-500">✓</span>
                <span>현재 위치 기반 가까운 맛집 우선</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="rounded-lg bg-orange-50 p-8">
          <h2 className="mb-4 text-2xl font-bold">지금 바로 {category.label} 추천받기</h2>
          <p className="mb-6 text-gray-700">
            내 주변의 {category.label} 맛집을 3초 만에 추천받아보세요.
            위치를 허용하고 {category.label} 카테고리를 선택하면 바로 추천됩니다.
          </p>
          <a
            href="/"
            className="inline-block rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
          >
            {category.label} 맛집 추천받기
          </a>
        </section>
      </div>
    </>
  );
}
