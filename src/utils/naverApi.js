// 네이버 API 관련 유틸리티 함수들

const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = import.meta.env.VITE_NAVER_CLIENT_SECRET;
const NAVER_SEARCH_CLIENT_ID = import.meta.env.VITE_NAVER_SEARCH_CLIENT_ID;
const NAVER_SEARCH_CLIENT_SECRET = import.meta.env.VITE_NAVER_SEARCH_CLIENT_SECRET;
const NAVER_MAP_API_URL = import.meta.env.VITE_NAVER_MAP_API_URL || 'https://oapi.map.naver.com';

// 백엔드 API를 통한 네이버 검색 API 호출
export const searchPlaces = async (query, display = 10) => {
  try {
    const response = await fetch('http://localhost:5000/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, display })
    });

    if (!response.ok) {
      throw new Error(`백엔드 API 오류: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.data && data.data.length > 0) {
      return data.data;
    } else {
      return [];
    }
  } catch (error) {
    console.error('검색 API 오류:', error);
    // 백엔드가 없을 때 더미 데이터 반환
    return getDummyData(query);
  }
};

// 백엔드 API를 통한 주소 좌표 변환
export const geocodeAddress = async (address) => {
  try {
    const response = await fetch('http://localhost:5000/api/geocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address })
    });

    if (!response.ok) {
      throw new Error(`백엔드 지오코딩 API 오류: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('지오코딩 API 오류:', error);
    // 기본 서울 좌표 반환
    return { lat: 37.5665, lng: 126.9780 };
  }
};

// 백엔드가 없을 때 사용할 더미 데이터
const getDummyData = (query) => {
  const dummyData = [
    {
      title: "서울시청 상담센터",
      address: "서울특별시 중구 세종대로 110",
      category: "상담센터",
      description: "서울시에서 운영하는 무료 상담센터입니다.",
      telephone: "02-120",
      link: "https://seoul.go.kr"
    },
    {
      title: "강남구 정신건강복지센터",
      address: "서울특별시 강남구 선릉로 668",
      category: "정신건강복지센터",
      description: "강남구에서 운영하는 정신건강 상담센터입니다.",
      telephone: "02-3423-3600",
      link: "https://gangnam.go.kr"
    },
    {
      title: "마포구 상담센터",
      address: "서울특별시 마포구 월드컵로 200",
      category: "상담센터",
      description: "마포구에서 운영하는 심리상담센터입니다.",
      telephone: "02-3153-5400",
      link: "https://mapo.go.kr"
    },
    {
      title: "용산구 정신건강복지센터",
      address: "서울특별시 용산구 한강대로 405",
      category: "정신건강복지센터",
      description: "용산구에서 운영하는 정신건강 상담센터입니다.",
      telephone: "02-2199-8000",
      link: "https://yongsan.go.kr"
    },
    {
      title: "서초구 상담센터",
      address: "서울특별시 서초구 서초대로 74길 11",
      category: "상담센터",
      description: "서초구에서 운영하는 무료 상담센터입니다.",
      telephone: "02-2155-6000",
      link: "https://seocho.go.kr"
    },
    {
      title: "송파구 정신건강복지센터",
      address: "서울특별시 송파구 중대로 123",
      category: "정신건강복지센터",
      description: "송파구에서 운영하는 정신건강 상담센터입니다.",
      telephone: "02-2147-2000",
      link: "https://songpa.go.kr"
    },
    {
      title: "영등포구 상담센터",
      address: "서울특별시 영등포구 당산로 123",
      category: "상담센터",
      description: "영등포구에서 운영하는 심리상담센터입니다.",
      telephone: "02-2670-3000",
      link: "https://ydp.go.kr"
    },
    {
      title: "동작구 정신건강복지센터",
      address: "서울특별시 동작구 상도로 123",
      category: "정신건강복지센터",
      description: "동작구에서 운영하는 정신건강 상담센터입니다.",
      telephone: "02-820-9000",
      link: "https://dongjak.go.kr"
    }
  ];

  // 검색어에 따라 필터링
  return dummyData.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase())
  );
};
