import { useState, useEffect } from 'react';
import { searchPlaces, geocodeAddress } from '../utils/naverApi';
import NaverMap from './NaverMap';

const CounselingCenterSearch = ({ onLocationSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('상담센터');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // 컴포넌트 마운트 시 자동 검색
  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const searchResults = await searchPlaces(searchTerm, 15);
      
      if (!searchResults || searchResults.length === 0) {
        setResults([]);
        setLoading(false);
        return;
      }
      
      // 검색 결과에 좌표 정보 추가
      const resultsWithCoords = await Promise.all(
        searchResults.map(async (item, index) => {
          try {
            const coords = await geocodeAddress(item.address);
            return {
              id: item.link || `result_${index}`,
              title: item.title.replace(/<[^>]*>/g, ''),
              address: item.address,
              category: item.category,
              description: item.description?.replace(/<[^>]*>/g, ''),
              telephone: item.telephone,
              coords: coords || { lat: 37.5665, lng: 126.9780 }
            };
          } catch (error) {
            return {
              id: item.link || `result_${index}`,
              title: item.title.replace(/<[^>]*>/g, ''),
              address: item.address,
              category: item.category,
              description: item.description?.replace(/<[^>]*>/g, ''),
              telephone: item.telephone,
              coords: { lat: 37.5665, lng: 126.9780 }
            };
          }
        })
      );
      
      setResults(resultsWithCoords);
    } catch (error) {
      console.error('검색 오류:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCurrentLocation = async () => {
    setLocationLoading(true);
    
    try {
      if (navigator.geolocation) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          });
        });

        const { latitude, longitude } = position.coords;
        const newLocation = {
          lat: latitude,
          lng: longitude,
          source: 'GPS'
        };

        setCurrentLocation(newLocation);
        
        if (onLocationSelect) {
          onLocationSelect({
            title: '현재 위치',
            address: 'GPS로 감지된 위치',
            coords: newLocation
          });
        }
      }
    } catch (error) {
      console.warn('GPS 위치 실패:', error);
      alert('현재 위치를 찾을 수 없습니다. 수동으로 검색해주세요.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleLocationClick = (location) => {
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full h-[80vh] flex">
        {/* 검색 사이드바 */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">근처 상담센터 찾기</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="상담센터, 심리상담 등 검색"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 text-sm"
                >
                  {loading ? '검색중...' : '검색'}
                </button>
              </div>
              
              <button
                onClick={handleCurrentLocation}
                disabled={locationLoading}
                className={`w-full px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm ${
                  locationLoading 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {locationLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    위치 찾는 중...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    내 위치 찾기
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* 검색 결과 */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-gray-500 text-sm">검색 중...</p>
                </div>
              </div>
            ) : results.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {results.map((result, index) => (
                  <div
                    key={result.id}
                    onClick={() => handleLocationClick(result)}
                    className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{result.title}</h4>
                        <p className="text-xs text-gray-600 mb-1">{result.address}</p>
                        {result.telephone && (
                          <p className="text-xs text-blue-600 mb-1">{result.telephone}</p>
                        )}
                        {result.description && (
                          <p className="text-xs text-gray-500 mb-1 line-clamp-2">{result.description}</p>
                        )}
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {result.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">검색 결과가 없습니다</p>
                <p className="text-xs mt-1">다른 검색어를 시도해보세요</p>
              </div>
            )}
          </div>
        </div>
        
        {/* 지도 영역 */}
        <div className="flex-1">
          <div className="h-full">
            <NaverMap 
              center={currentLocation || { lat: 37.5665, lng: 126.9780 }}
              selectedLocation={null}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounselingCenterSearch;
