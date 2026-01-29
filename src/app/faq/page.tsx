import type { Metadata } from 'next';
import Link from 'next/link';
import { createMetadata, faqPageJsonLd } from '@/lib/seo';

const faqs = [
  {
    question: '오늘의 픽은 무료인가요?',
    answer: '네, 완전 무료입니다. 별도의 회원가입이나 결제 없이 누구나 사용할 수 있습니다.',
  },
  {
    question: '위치 정보를 왜 필요로 하나요?',
    answer: '현재 위치를 기반으로 주변 맛집을 검색하기 위해 필요합니다. 위치 정보는 서버에 저장되지 않으며, 맛집 검색 용도로만 사용됩니다.',
  },
  {
    question: '추천되는 맛집은 어떤 기준으로 선정되나요?',
    answer: '네이버 지도 데이터를 기반으로 평점 4.0 이상, 리뷰 50개 이상인 맛집만 추천합니다. 품질이 검증된 음식점만 엄선하여 제공합니다.',
  },
  {
    question: '검색 반경을 조절할 수 있나요?',
    answer: '네, 500m, 1km, 2km 중 선택할 수 있습니다. 설정 메뉴에서 원하는 반경을 선택하세요.',
  },
  {
    question: '여러 카테고리를 동시에 선택할 수 있나요?',
    answer: '네, 여러 카테고리를 동시에 선택할 수 있습니다. 선택한 모든 카테고리에서 랜덤으로 맛집이 추천됩니다.',
  },
  {
    question: '추천받은 맛집이 마음에 들지 않으면 어떻게 하나요?',
    answer: '다시 뽑기 버튼을 눌러 새로운 맛집을 추천받을 수 있습니다. 원하는 맛집이 나올 때까지 계속 시도해보세요.',
  },
  {
    question: '선택 히스토리는 어디서 확인하나요?',
    answer: '화면 상단의 히스토리 아이콘을 클릭하면 최근 추천받은 맛집 목록을 확인할 수 있습니다.',
  },
  {
    question: '모바일에서도 사용할 수 있나요?',
    answer: '네, 모바일에 최적화되어 있습니다. 스마트폰 브라우저에서 접속하시면 편리하게 사용하실 수 있습니다.',
  },
  {
    question: '앱으로 다운로드할 수 있나요?',
    answer: '별도의 앱은 없지만, 모바일 브라우저에서 "홈 화면에 추가" 기능을 사용하면 앱처럼 사용할 수 있습니다.',
  },
  {
    question: '특정 맛집을 제외하고 추천받을 수 있나요?',
    answer: '현재는 제외 기능이 없지만, 마음에 들지 않는 맛집은 다시 뽑기로 건너뛸 수 있습니다. 향후 업데이트에서 제외 기능을 추가할 예정입니다.',
  },
  {
    question: '서울 외 지역에서도 사용할 수 있나요?',
    answer: '네, 전국 어디서나 사용 가능합니다. 네이버 지도에 등록된 맛집이 있는 지역이라면 어디서든 추천받을 수 있습니다.',
  },
  {
    question: '맛집 정보가 정확하지 않은 경우 어떻게 하나요?',
    answer: '맛집 정보는 네이버 지도 API를 통해 실시간으로 가져옵니다. 정보 오류는 네이버 지도에서 직접 수정하시거나, 저희에게 문의해주세요.',
  },
  {
    question: '영업시간이나 휴무일 정보도 제공되나요?',
    answer: '네, 맛집 상세 정보에서 영업시간과 메뉴 정보를 확인할 수 있습니다. 다만 실시간 정보는 네이버 지도에서 직접 확인하시는 것을 권장합니다.',
  },
];

export const metadata: Metadata = createMetadata({
  title: '자주 묻는 질문',
  description: '오늘의 픽 서비스 이용에 관한 자주 묻는 질문과 답변을 확인하세요.',
  path: '/faq',
  keywords: ['FAQ', '자주 묻는 질문', '이용 방법', '서비스 안내'],
});

export default function FAQPage() {
  const jsonLd = faqPageJsonLd(faqs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-8 text-4xl font-bold">자주 묻는 질문</h1>
        <p className="mb-12 text-lg text-gray-600">
          오늘의 픽 이용에 궁금한 점을 해결해드립니다.
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group rounded-lg border border-gray-200 bg-white"
            >
              <summary className="flex cursor-pointer items-center justify-between p-6 font-semibold text-gray-900 transition-colors hover:bg-gray-50">
                <span>{faq.question}</span>
                <span className="ml-4 text-gray-500 transition-transform group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <div className="border-t border-gray-200 bg-gray-50 p-6 text-gray-700">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>

        <section className="mt-12 rounded-lg bg-orange-50 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold">더 궁금한 점이 있으신가요?</h2>
          <p className="mb-6 text-gray-700">
            추가 문의사항이 있으시면 언제든지 연락주세요.
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
