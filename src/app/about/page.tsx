import type { Metadata } from 'next';
import Link from 'next/link';
import { createMetadata, webApplicationJsonLd } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: '서비스 소개',
  description: '오늘의 픽은 내 주변 맛집을 3초 만에 추천해주는 서비스입니다. 점심 메뉴 고민을 해결해드립니다.',
  path: '/about',
  keywords: ['서비스 소개', '오늘의 픽 소개', '맛집 추천 앱'],
});

export default function AboutPage() {
  const jsonLd = webApplicationJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-8 text-4xl font-bold">오늘의 픽이란?</h1>

        <section className="mb-12">
          <p className="mb-4 text-lg text-gray-700">
            <strong>오늘의 픽</strong>은 내 주변 맛집을 3초 만에 추천해주는 서비스입니다.
          </p>
          <p className="mb-4 text-gray-600">
            점심시간마다 고민되는 &ldquo;오늘 뭐 먹지?&rdquo; 문제를 해결해드립니다.
            현재 위치를 기반으로 가까운 맛집을 랜덤으로 추천받아보세요.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">이렇게 작동합니다</h2>
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 p-6">
              <h3 className="mb-2 text-xl font-semibold">1. 위치 허용</h3>
              <p className="text-gray-600">
                현재 위치를 허용하면 주변 맛집을 자동으로 검색합니다.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-6">
              <h3 className="mb-2 text-xl font-semibold">2. 카테고리 선택</h3>
              <p className="text-gray-600">
                한식, 중식, 일식, 양식 등 원하는 음식 종류를 선택하세요.
                여러 개를 선택할 수도 있습니다.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-6">
              <h3 className="mb-2 text-xl font-semibold">3. 랜덤 추천</h3>
              <p className="text-gray-600">
                버튼 하나로 주변 맛집 중 하나를 랜덤으로 추천받습니다.
                마음에 들지 않으면 다시 뽑을 수 있어요.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">주요 기능</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="mr-2 text-orange-500">✓</span>
              <span>현재 위치 기반 주변 맛집 검색</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-orange-500">✓</span>
              <span>500m ~ 2km 범위 설정 가능</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-orange-500">✓</span>
              <span>8가지 음식 카테고리 지원</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-orange-500">✓</span>
              <span>평점 4.0 이상, 리뷰 50개 이상 맛집만 추천</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-orange-500">✓</span>
              <span>선택 히스토리 자동 저장</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-orange-500">✓</span>
              <span>네이버 지도 연동으로 바로 길찾기</span>
            </li>
          </ul>
        </section>

        <section className="rounded-lg bg-orange-50 p-8">
          <h2 className="mb-4 text-2xl font-bold">지금 바로 시작하세요</h2>
          <p className="mb-6 text-gray-700">
            복잡한 선택의 고민을 덜어드립니다. 오늘의 점심, 오늘의 픽과 함께하세요.
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
          >
            맛집 추천받기
          </Link>
        </section>
      </div>
    </>
  );
}
