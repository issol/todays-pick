export interface Location {
  slug: string;
  name: string;
  lat: number;
  lng: number;
}

export const LOCATIONS: Location[] = [
  { slug: 'gangnam', name: '강남', lat: 37.4979, lng: 127.0276 },
  { slug: 'hongdae', name: '홍대', lat: 37.5563, lng: 126.9236 },
  { slug: 'itaewon', name: '이태원', lat: 37.5340, lng: 126.9948 },
  { slug: 'jongno', name: '종로', lat: 37.5735, lng: 126.9790 },
  { slug: 'myeongdong', name: '명동', lat: 37.5636, lng: 126.9869 },
  { slug: 'sinchon', name: '신촌', lat: 37.5559, lng: 126.9366 },
  { slug: 'konkuk', name: '건대', lat: 37.5404, lng: 127.0688 },
  { slug: 'jamsil', name: '잠실', lat: 37.5133, lng: 127.1028 },
  { slug: 'yeouido', name: '여의도', lat: 37.5219, lng: 126.9245 },
  { slug: 'mapo', name: '마포', lat: 37.5663, lng: 126.9019 },
  { slug: 'seongsu', name: '성수', lat: 37.5443, lng: 127.0557 },
  { slug: 'pangyo', name: '판교', lat: 37.3948, lng: 127.1110 },
  { slug: 'haeundae', name: '해운대', lat: 35.1628, lng: 129.1635 },
  { slug: 'gwanghwamun', name: '광화문', lat: 37.5759, lng: 126.9769 },
  { slug: 'apgujeong', name: '압구정', lat: 37.5274, lng: 127.0286 },
  { slug: 'seomyeon', name: '서면', lat: 35.1577, lng: 129.0598 },
  { slug: 'gangdong', name: '강동', lat: 37.5301, lng: 127.1238 },
  { slug: 'nowon', name: '노원', lat: 37.6542, lng: 127.0568 },
  { slug: 'eunpyeong', name: '은평', lat: 37.6176, lng: 126.9227 },
  { slug: 'seongbuk', name: '성북', lat: 37.5894, lng: 127.0167 },
  { slug: 'songpa', name: '송파', lat: 37.5145, lng: 127.1060 },
  { slug: 'gwanak', name: '관악', lat: 37.4783, lng: 126.9516 },
  { slug: 'seocho', name: '서초', lat: 37.4837, lng: 127.0324 },
  { slug: 'yongsan', name: '용산', lat: 37.5326, lng: 126.9905 },
  { slug: 'dongdaemun', name: '동대문', lat: 37.5744, lng: 127.0396 },
  { slug: 'jung', name: '중구', lat: 37.5636, lng: 126.9972 },
  { slug: 'gangbuk', name: '강북', lat: 37.6396, lng: 127.0256 },
  { slug: 'dobong', name: '도봉', lat: 37.6688, lng: 127.0471 },
  { slug: 'suyeong', name: '수영', lat: 35.1447, lng: 129.1133 },
  { slug: 'busanjin', name: '부산진', lat: 35.1628, lng: 129.0533 },
  { slug: 'dongrae', name: '동래', lat: 35.2047, lng: 129.0787 },
  { slug: 'geumjeong', name: '금정', lat: 35.2429, lng: 129.0927 },
  { slug: 'saha', name: '사하', lat: 35.1042, lng: 128.9743 },
  { slug: 'sasang', name: '사상', lat: 35.1495, lng: 128.9910 },
  { slug: 'yeonje', name: '연제', lat: 35.1765, lng: 129.0817 },
  { slug: 'seo', name: '서구', lat: 35.0978, lng: 129.0242 },
  { slug: 'jungang', name: '중앙동', lat: 35.1068, lng: 129.0331 },
  { slug: 'daehakro', name: '대학로', lat: 37.5820, lng: 127.0012 },
  { slug: 'euljiro', name: '을지로', lat: 37.5665, lng: 126.9910 },
  { slug: 'ttukseom', name: '뚝섬', lat: 37.5471, lng: 127.0471 },
  { slug: 'hapjeong', name: '합정', lat: 37.5493, lng: 126.9139 },
  { slug: 'sangsu', name: '상수', lat: 37.5478, lng: 126.9225 },
  { slug: 'mangwon', name: '망원', lat: 37.5558, lng: 126.9105 },
  { slug: 'yangjae', name: '양재', lat: 37.4844, lng: 127.0344 },
  { slug: 'sadang', name: '사당', lat: 37.4767, lng: 126.9813 },
  { slug: 'sindorim', name: '신도림', lat: 37.5088, lng: 126.8910 },
  { slug: 'daechi', name: '대치', lat: 37.4945, lng: 127.0617 },
  { slug: 'dogok', name: '도곡', lat: 37.4911, lng: 127.0514 },
  { slug: 'gaepo', name: '개포', lat: 37.4844, lng: 127.0613 },
  { slug: 'banpo', name: '반포', lat: 37.5036, lng: 127.0046 },
];

export function getLocationBySlug(slug: string): Location | undefined {
  return LOCATIONS.find((loc) => loc.slug === slug);
}

export function getTopLocations(count: number = 10): Location[] {
  return LOCATIONS.slice(0, count);
}

export function getAllLocationSlugs(): string[] {
  return LOCATIONS.map((loc) => loc.slug);
}
