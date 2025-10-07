import { useState, useEffect } from 'react';

// 네이버 검색 API 호출
const searchPlaces = async (query, display = 10) => {
  try {
    const response = await fetch('http://localhost:5000/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        display: display
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.success ? data.data : []
  } catch (error) {
    console.error('검색 API 오류:', error)
    throw error
  }
}

// 주소를 좌표로 변환
const geocodeAddress = async (address) => {
  try {
    const response = await fetch('http://localhost:5000/api/geocode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: address
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error('지오코딩 API 오류:', error)
    throw error
  }
}

// 두 점 사이의 거리 계산 (Haversine 공식)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // 지구의 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // km
  return distance;
}

// 상담센터 관련 키워드 필터링 함수
const isCounselingRelated = (title, category, description) => {
  // 상담센터 관련 키워드 (포함되어야 함)
  const counselingKeywords = [
    '상담', '심리', '정신', '치료', '클리닉', '센터', '의원', '병원',
    '마음', '정신건강', '심리상담', '심리치료', '정신과', '정신건강복지',
    '상담센터', '심리상담센터', '심리치료센터', '정신건강복지센터',
    '심리클리닉', '마음상담센터', '정신과의원', '정신건강의학과',
    '우울', '불안', '스트레스', '트라우마', '가족상담', '부부상담',
    '청소년상담', '아동상담', '노인상담', '집단상담', '개인상담'
  ];
  
  // 제외할 키워드 (포함되면 안됨)
  const excludeKeywords = [
    '카페', '커피', '음식점', '식당', '레스토랑', '패스트푸드',
    '가죽', '공방', '수제', '핸드메이드', '공예', '만들기',
    '미용', '헤어', '네일', '피부', '마사지', '스파',
    '헬스', '피트니스', '요가', '필라테스', '운동',
    '학원', '교육', '학습', '과외', '입시', '어학',
    '쇼핑', '마트', '편의점', '백화점', '상점',
    '호텔', '펜션', '모텔', '숙박', '여행',
    '은행', '보험', '금융', '증권', '대출',
    '자동차', '정비', '수리', '세차', '주유',
    '부동산', '중개', '임대', '매매', '분양'
  ];
  
  // 모든 텍스트를 소문자로 변환하여 검색
  const textToCheck = `${title} ${category} ${description}`.toLowerCase();
  
  // 제외 키워드가 포함되어 있으면 false
  for (const excludeKeyword of excludeKeywords) {
    if (textToCheck.includes(excludeKeyword)) {
      return false;
    }
  }
  
  // 상담센터 관련 키워드가 하나라도 포함되어 있으면 true
  for (const counselingKeyword of counselingKeywords) {
    if (textToCheck.includes(counselingKeyword)) {
      return true;
    }
  }
  
  return false;
};

// 좌표를 주소로 변환 (Reverse Geocoding)
const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch('http://localhost:5000/api/reverse-geocode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lat: lat,
        lng: lng
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error('역지오코딩 API 오류:', error)
    throw error
  }
}

const SearchResults = ({ searchTerm, onLocationSelect, onResultsChange, currentLocation, autoSearchTriggered }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('unknown'); // 'real', 'demo', 'error'

  useEffect(() => {
    console.log('🔄 SearchResults useEffect 실행:', { searchTerm, currentLocation, autoSearchTriggered });
    
    if (searchTerm || autoSearchTriggered) {
      setLoading(true);
      
      // 실제 네이버 검색 API 사용
      const performSearch = async () => {
        try {
          console.log('🔍 검색 시작:', searchTerm);
          console.log('📍 현재 위치 (검색 시):', currentLocation);
          
          // 현재 위치가 있으면 주소로 변환 후 지역 기반 검색
          let searchQuery = searchTerm;
          if (currentLocation && currentLocation.lat && currentLocation.lng) {
            try {
              console.log('📍 현재 위치를 주소로 변환 중...');
              const addressData = await reverseGeocode(currentLocation.lat, currentLocation.lng);
              if (addressData && addressData.address) {
                // 구/동 단위로 검색 (예: "강남구 심리상담센터")
                const area2 = addressData.area2 || '';
                const area3 = addressData.area3 || '';
                // 자동 검색일 때는 상담센터 키워드 추가
                if (!searchTerm) {
                  const locationQuery = area3 ? `${area3} 심리상담센터` : `${area2} 심리상담센터`;
                  searchQuery = locationQuery;
                } else {
                  const locationQuery = area3 ? `${area3} ${searchTerm}` : `${area2} ${searchTerm}`;
                  searchQuery = locationQuery;
                }
                console.log('🏘️ 지역 기반 검색 쿼리:', searchQuery);
              } else {
                console.log('⚠️ 주소 변환 실패, 일반 검색 수행');
              }
            } catch (error) {
              console.error('❌ 주소 변환 오류:', error);
              console.log('⚠️ 일반 검색으로 대체');
            }
          }
          
          // 1단계: 네이버 검색 API 호출
          const searchResults = await searchPlaces(searchQuery, 30);
          console.log('📋 검색 결과:', searchResults);
          
          if (!searchResults || searchResults.length === 0) {
            console.log('❌ 검색 결과 없음');
            setResults([]);
            setLoading(false);
            return;
          }

          // 1.5단계: 프론트엔드에서 추가 필터링
          console.log('🔍 필터링 전 검색 결과 상세:', searchResults.map(r => ({
            title: r.title,
            category: r.category,
            description: r.description,
            address: r.address,
            is_counseling_related: r.is_counseling_related
          })));
          
          const filteredResults = searchResults.filter(result => {
            const isRelated = isCounselingRelated(result.title, result.category, result.description);
            console.log(`🔍 "${result.title}" 프론트엔드 필터링 결과:`, isRelated, `(백엔드: ${result.is_counseling_related})`);
            return isRelated;
          });
          console.log('🔍 필터링된 검색 결과:', filteredResults);
          
          // 2단계: 검색 결과에 좌표 정보 추가
          console.log('🗺️ 좌표 정보 추가 중...');
          const resultsWithCoords = await Promise.all(
            filteredResults.map(async (item, index) => {
              try {
                console.log(`📍 ${index + 1}/${filteredResults.length} 좌표 변환 중:`, item.title);
                
                // 주소로 좌표 변환
                const coords = await geocodeAddress(item.address);
                
                if (coords) {
                  console.log(`✅ 좌표 변환 성공:`, coords);
                  return {
                    id: item.link || `result_${index}`,
                    title: item.title.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'"), // HTML 태그 및 엔티티 제거
                    address: item.address,
                    category: item.category,
                    description: item.description?.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
                    coords: coords
                  };
                } else {
                  console.log(`❌ 좌표 변환 실패:`, item.address);
                  // 좌표 변환 실패 시 기본 좌표 사용
                  return {
                    id: item.link || `result_${index}`,
                    title: item.title.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
                    address: item.address,
                    category: item.category,
                    description: item.description?.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
                    coords: { lat: 37.5665, lng: 126.9780 } // 기본 좌표
                  };
                }
              } catch (error) {
                console.error(`❌ ${index + 1}번째 결과 처리 오류:`, error);
                return {
                  id: item.link || `result_${index}`,
                  title: item.title.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
                  address: item.address,
                  category: item.category,
                  description: item.description?.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
                  coords: { lat: 37.5665, lng: 126.9780 } // 기본 좌표
                };
              }
            })
          );
          
          console.log('🎉 최종 검색 결과:', resultsWithCoords);
          // 현재 위치가 있을 때 5km 이내 필터링
          let finalResults = resultsWithCoords;
          if (currentLocation) {
            finalResults = resultsWithCoords.filter(result => {
              if (!result.coords) return false;
              
              // 두 점 사이의 거리 계산 (Haversine 공식)
              const distance = calculateDistance(
                currentLocation.lat, currentLocation.lng,
                result.coords.lat, result.coords.lng
              );
              
              return distance <= 5; // 5km 이내
            });
          }

          setResults(finalResults);
          setApiStatus('real');
          
          // 상위 컴포넌트에 결과 전달
          if (onResultsChange) {
            onResultsChange(finalResults);
          }
          
        } catch (error) {
          console.error('❌ 검색 API 오류:', error);
          
          // API 오류 발생 시 더미 데이터 표시
          console.log('🔄 더미 데이터로 대체');
          const dummyResults = [
            {
              id: 1,
              title: `${searchTerm} 검색결과 1 (데모)`,
              address: '서울특별시 강남구 테헤란로 123',
              category: '음식점',
              description: '실제 API 연동을 위한 데모 데이터입니다. API 키 설정 후 실제 검색 결과를 확인할 수 있습니다.',
              coords: { lat: 37.5665, lng: 126.9780 }
            },
            {
              id: 2,
              title: `${searchTerm} 검색결과 2 (데모)`,
              address: '서울특별시 강남구 테헤란로 456',
              category: '카페',
              description: '실제 API 연동을 위한 데모 데이터입니다. API 키 설정 후 실제 검색 결과를 확인할 수 있습니다.',
              coords: { lat: 37.5665, lng: 126.9780 }
            },
            {
              id: 3,
              title: `${searchTerm} 검색결과 3 (데모)`,
              address: '서울특별시 강남구 테헤란로 789',
              category: '쇼핑',
              description: '실제 API 연동을 위한 데모 데이터입니다. API 키 설정 후 실제 검색 결과를 확인할 수 있습니다.',
              coords: { lat: 37.5665, lng: 126.9780 }
            }
          ];
          setResults(dummyResults);
          setApiStatus('demo');
          
          // 상위 컴포넌트에 더미 결과 전달
          if (onResultsChange) {
            onResultsChange(dummyResults);
          }
        } finally {
          setLoading(false);
        }
      };
      
      performSearch();
    } else if (autoSearchTriggered) {
      // 자동 검색 트리거가 있을 때 상담센터 자동 검색
      const searchCounselingCenters = async () => {
        console.log('🏥 상담센터 자동 검색 시작');
        console.log('📍 현재 위치 (자동 검색 시):', currentLocation);
        setLoading(true);
        try {
          const counselingQueries = [
            '심리상담센터',
            '심리치료센터',
            '상담센터',
            '정신과의원',
            '심리클리닉',
            '마음상담센터'
          ];

          const allResults = [];
          
          // 현재 위치가 있으면 주소로 변환
          let locationPrefix = '';
          if (currentLocation && currentLocation.lat && currentLocation.lng) {
            try {
              console.log('📍 상담센터 검색을 위한 주소 변환 중...');
              const addressData = await reverseGeocode(currentLocation.lat, currentLocation.lng);
              if (addressData && addressData.address) {
                const area2 = addressData.area2 || '';
                const area3 = addressData.area3 || '';
                locationPrefix = area3 ? `${area3} ` : `${area2} `;
                console.log('🏘️ 지역 접두사:', locationPrefix);
              }
            } catch (error) {
              console.error('❌ 주소 변환 오류:', error);
            }
          }

          for (const query of counselingQueries) {
            try {
              // 지역 접두사와 함께 검색
              const searchQuery = locationPrefix ? `${locationPrefix}${query}` : query;
              console.log('🔍 상담센터 검색:', searchQuery);
              const searchData = await searchPlaces(searchQuery, 15);
              
              if (searchData && searchData.length > 0) {
                console.log(`✅ ${query} 검색 결과 ${searchData.length}개 발견`);
                allResults.push(...searchData);
              } else {
                console.log(`❌ ${query} 검색 결과 없음`);
              }
            } catch (error) {
              console.error(`${query} 검색 오류:`, error);
            }
          }

          // 중복 제거 및 상담센터 관련 필터링
          const uniqueResults = allResults.filter((place, index, self) => 
            index === self.findIndex(p => p.title === place.title)
          );

          // 상담센터 관련 키워드로 추가 필터링
          const counselingResults = uniqueResults.filter(result => {
            return isCounselingRelated(result.title, result.category, result.description);
          });

          const resultsWithCoords = await Promise.all(
            counselingResults.slice(0, 20).map(async (item, index) => {
              try {
                const coords = await geocodeAddress(item.address);
                return {
                  id: item.link || `counseling_${index}`,
                  title: item.title.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
                  address: item.address,
                  category: item.category,
                  description: item.description?.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
                  coords: coords || { lat: 37.5665, lng: 126.9780 }
                };
              } catch (error) {
                console.error(`상담센터 ${index + 1} 좌표 변환 실패:`, error);
                return {
                  id: item.link || `counseling_${index}`,
                  title: item.title.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
                  address: item.address,
                  category: item.category,
                  description: item.description?.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
                  coords: { lat: 37.5665, lng: 126.9780 }
                };
              }
            })
          );

          // 현재 위치가 있을 때 5km 이내 필터링
          let finalFilteredResults = resultsWithCoords;
          if (currentLocation) {
            finalFilteredResults = resultsWithCoords.filter(result => {
              if (!result.coords) return false;
              
              // 두 점 사이의 거리 계산 (Haversine 공식)
              const distance = calculateDistance(
                currentLocation.lat, currentLocation.lng,
                result.coords.lat, result.coords.lng
              );
              
              return distance <= 5; // 5km 이내
            });
          }

          setResults(finalFilteredResults);
          setApiStatus('real');
          
          if (onResultsChange) {
            onResultsChange(finalFilteredResults);
          }
        } catch (error) {
          console.error('상담센터 검색 오류:', error);
          setResults([]);
          setApiStatus('error');
        } finally {
          setLoading(false);
        }
      };

      searchCounselingCenters();
    }
  }, [searchTerm, currentLocation, autoSearchTriggered]);

  const handleResultClick = (result) => {
    onLocationSelect(result);
  };

  if (!searchTerm && !autoSearchTriggered && !loading) {
    return (
      <div className="w-full h-full rounded-lg p-4" style={{ backgroundColor: '#F9FAF9' }}>
        <p className="text-center" style={{ color: '#111827' }}>상담센터를 검색하고 있습니다...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-full bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#CEF4E7' }}>
        <div className="p-4 border-b" style={{ borderColor: '#CEF4E7' }}>
          <h3 className="font-semibold" style={{ color: '#111827' }}>검색결과</h3>
          <p className="text-sm" style={{ color: '#111827' }}>"{searchTerm}" 검색 중...</p>
        </div>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#30E8AB' }}></div>
            <p style={{ color: '#111827' }}>검색 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#CEF4E7' }}>
      <div className="p-4 border-b" style={{ borderColor: '#CEF4E7' }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold" style={{ color: '#111827' }}>검색결과</h3>
            <p className="text-sm" style={{ color: '#111827' }}>
              {autoSearchTriggered && !searchTerm
                ? `근처 심리상담센터 (5km 이내 ${results.length}개)`
                : currentLocation 
                  ? `"${searchTerm}"에 대한 근처 심리상담센터 (5km 이내 ${results.length}개)`
                  : `"${searchTerm}"에 대한 ${results.length}개 결과`
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            {apiStatus === 'real' && (
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#30E8AB' }}></span>
            )}
            {apiStatus === 'demo' && (
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#CEF4E7' }}></span>
            )}
          </div>
        </div>
      </div>
      <div className="overflow-y-auto h-full">
        {results.length > 0 ? (
          <div className="divide-y" style={{ borderColor: '#CEF4E7' }}>
            {results.map((result, index) => (
              <div
                key={result.id}
                onClick={() => handleResultClick(result)}
                className="p-4 cursor-pointer transition-colors border-l-4 border-transparent hover:border-opacity-50"
                style={{ 
                  backgroundColor: '#F9FAF9',
                  borderLeftColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#CEF4E7';
                  e.currentTarget.style.borderLeftColor = '#30E8AB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#F9FAF9';
                  e.currentTarget.style.borderLeftColor = 'transparent';
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#CEF4E7', color: '#111827' }}>
                        {index + 1}
                      </span>
                      <h4 className="font-medium" style={{ color: '#111827' }}>{result.title}</h4>
                    </div>
                    
                    <p className="text-sm mb-2" style={{ color: '#111827' }}>{result.address}</p>
                    
                    {result.description && (
                      <p className="text-xs mb-2 line-clamp-2" style={{ color: '#111827' }}>
                        {result.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-2 py-1 text-xs rounded" style={{ backgroundColor: '#CEF4E7', color: '#111827' }}>
                        {result.category}
                      </span>
                      
                      {currentLocation && result.coords && (
                        <span className="inline-block px-2 py-1 text-xs rounded" style={{ backgroundColor: '#30E8AB', color: 'white' }}>
                          {calculateDistance(
                            currentLocation.lat, currentLocation.lng,
                            result.coords.lat, result.coords.lng
                          ).toFixed(1)}km
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-2" style={{ color: '#30E8AB' }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center" style={{ color: '#111827' }}>
            <div className="text-4xl mb-2">🔍</div>
            <p>
              {autoSearchTriggered && !searchTerm
                ? '근처에 심리상담센터가 없습니다'
                : currentLocation 
                  ? '근처에 심리상담센터가 없습니다' 
                  : '검색 결과가 없습니다'
              }
            </p>
            <p className="text-sm mt-1">
              {autoSearchTriggered && !searchTerm
                ? '5km 이내에 심리상담센터를 찾을 수 없습니다. 더 넓은 범위로 검색해보세요.'
                : currentLocation 
                  ? '5km 이내에 심리상담센터를 찾을 수 없습니다. 더 넓은 범위로 검색해보세요.' 
                  : '다른 검색어를 시도해보세요'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
