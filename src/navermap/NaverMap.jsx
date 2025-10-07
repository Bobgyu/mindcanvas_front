import { useEffect, useRef, useState } from 'react';

// 네이버 맵 API 스크립트 로딩 함수
const loadNaverMapScript = (clientId) => {
  return new Promise((resolve, reject) => {
    // 이미 로드된 경우
    if (window.naver && window.naver.maps) {
      resolve();
      return;
    }

    // 이미 스크립트가 로딩 중인 경우
    if (document.querySelector(`script[src*="naver"]`)) {
      const checkLoaded = () => {
        if (window.naver && window.naver.maps) {
          resolve();
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    // 스크립트 생성 및 로딩
    const script = document.createElement('script');
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    script.async = true;
    
    script.onload = () => {
      console.log('✅ 네이버 맵 API 스크립트 로드 완료');
      resolve();
    };
    
    script.onerror = () => {
      console.error('❌ 네이버 맵 API 스크립트 로드 실패');
      window.naverMapError = true;
      reject(new Error('네이버 맵 API 스크립트 로드 실패'));
    };
    
    document.head.appendChild(script);
  });
};

const NaverMap = ({ center = { lat: 37.5665, lng: 126.9780 }, selectedLocation = null, currentLocation = null, searchResults = [] }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState('');

  useEffect(() => {
    initializeMap();
  }, []);

  // 현재 위치가 변경될 때 마커 업데이트
  useEffect(() => {
    if (currentLocation && mapInstance.current && window.naver && window.naver.maps) {
      // 기존 현재 위치 마커 제거
      markersRef.current = markersRef.current.filter(marker => marker.title !== '현재 위치');
      
      // 새로운 현재 위치 마커 추가
      addCurrentLocationMarker(currentLocation);
      
      // 지도 중심을 현재 위치로 부드럽게 이동
      mapInstance.current.panTo(new window.naver.maps.LatLng(currentLocation.lat, currentLocation.lng));
    }
  }, [currentLocation]);

  // 현재 위치 마커 추가 함수
  const addCurrentLocationMarker = (location) => {
    if (!mapInstance.current || !window.naver || !window.naver.maps) return;

    const currentMarker = new window.naver.maps.Marker({
      position: new window.naver.maps.LatLng(location.lat, location.lng),
      map: mapInstance.current,
      icon: {
        content: `
          <div style="
            width: 20px;
            height: 20px;
            background: #4285f4;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 8px;
              height: 8px;
              background: white;
              border-radius: 50%;
            "></div>
          </div>
        `,
        size: new window.naver.maps.Size(20, 20),
        anchor: new window.naver.maps.Point(10, 10)
      },
      title: '현재 위치'
    });

    // 현재 위치 정보창
    const currentInfoWindow = new window.naver.maps.InfoWindow({
      content: `
        <div style="padding: 8px; text-align: center;">
          <div style="font-weight: bold; color: #4285f4; margin-bottom: 4px;">📍 현재 위치</div>
          <div style="font-size: 12px; color: #666;">
            위도: ${location.lat.toFixed(6)}<br>
            경도: ${location.lng.toFixed(6)}
          </div>
        </div>
      `
    });

    // 현재 위치 마커 클릭 시 정보창 표시
    window.naver.maps.Event.addListener(currentMarker, 'click', () => {
      currentInfoWindow.open(mapInstance.current, currentMarker);
    });

    markersRef.current.push(currentMarker);
  };

  const initializeMap = async () => {
    try {
      if (!mapRef.current) return;

      // 환경 변수 확인 및 디버깅
      const clientId = import.meta.env.VITE_NAVER_CLIENT_ID;
      console.log('=== 환경 변수 디버깅 ===');
      console.log('import.meta.env:', import.meta.env);
      console.log('VITE_NAVER_CLIENT_ID:', import.meta.env.VITE_NAVER_CLIENT_ID);
      console.log('사용할 Client ID:', clientId);
      console.log('모든 VITE_ 변수:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
      console.log('========================');
      
      if (!clientId || clientId === 'your_client_id_here') {
        setMapError(`네이버 맵 API 키가 설정되지 않았습니다. 
        현재 값: ${clientId || 'undefined'}
        .env 파일을 확인하고 앱을 재시작해주세요.`);
        setMapLoaded(true);
        return;
      }

      // 네이버 맵 API 스크립트 로딩
      console.log('🗺️ 네이버 맵 API 스크립트 로딩 시작...');
      await loadNaverMapScript(clientId);
      console.log('✅ 네이버 맵 API 스크립트 로딩 완료');

      const mapOptions = {
        center: new window.naver.maps.LatLng(center.lat, center.lng),
        zoom: 14,
        zoomControl: true,
        zoomControlOptions: {
          position: window.naver.maps.Position.TOP_RIGHT,
        },
        mapDataControl: false,
        scaleControl: false,
        logoControl: false,
        mapTypeControl: false,
        mapTypeId: window.naver.maps.MapTypeId.NORMAL
      };

      const map = new window.naver.maps.Map(mapRef.current, mapOptions);
      
      mapInstance.current = map;
      
      // 현재 위치 마커 추가
      if (currentLocation) {
        addCurrentLocationMarker(currentLocation);
      }
      
      setMapLoaded(true);
      setMapError('');
    } catch (error) {
      console.error('맵 초기화 오류:', error);
      setMapError('네이버 맵을 불러오는 중 오류가 발생했습니다. API 키를 확인해주세요.');
      setMapLoaded(true);
    }
  };

  // 지도 중심 변경
  useEffect(() => {
    if (mapInstance.current && center) {
      mapInstance.current.setCenter(new window.naver.maps.LatLng(center.lat, center.lng));
    }
  }, [center]);

  // 검색 결과 마커들 표시
  useEffect(() => {
    if (mapInstance.current && searchResults && searchResults.length > 0) {
      // 기존 검색 결과 마커들 제거 (현재 위치 마커는 유지)
      markersRef.current = markersRef.current.filter(marker => marker.title === '현재 위치');
      
      // 검색 결과 마커들 추가
      searchResults.forEach((result, index) => {
        if (result.coords) {
          addSearchResultMarker(result, index);
        }
      });
    }
  }, [searchResults]);

  // 검색 결과 마커 추가 함수
  const addSearchResultMarker = (result, index) => {
    if (!mapInstance.current || !window.naver || !window.naver.maps) return;

    const marker = new window.naver.maps.Marker({
      position: new window.naver.maps.LatLng(result.coords.lat, result.coords.lng),
      map: mapInstance.current,
      icon: {
        content: `
          <div style="
            width: 30px;
            height: 30px;
            background: #ff6b6b;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
            font-size: 12px;
          ">
            ${index + 1}
          </div>
        `,
        size: new window.naver.maps.Size(30, 30),
        anchor: new window.naver.maps.Point(15, 15)
      },
      title: result.title
    });

    // 정보창 생성
    const infoWindow = new window.naver.maps.InfoWindow({
      content: `
        <div style="padding: 12px; min-width: 250px; max-width: 300px;">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <div style="
              width: 20px;
              height: 20px;
              background: #ff6b6b;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 10px;
              font-weight: bold;
              margin-right: 8px;
            ">${index + 1}</div>
            <h3 style="margin: 0; font-size: 14px; font-weight: bold; color: #333;">${result.title}</h3>
          </div>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #666; line-height: 1.4;">${result.address}</p>
          ${result.category ? `<span style="display: inline-block; margin-bottom: 4px; padding: 2px 6px; background: #e3f2fd; color: #1976d2; border-radius: 3px; font-size: 11px;">${result.category}</span>` : ''}
          ${result.description ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #888; line-height: 1.3;">${result.description}</p>` : ''}
        </div>
      `
    });

    // 마커 클릭 시 정보창 표시
    window.naver.maps.Event.addListener(marker, 'click', () => {
      infoWindow.open(mapInstance.current, marker);
    });

    markersRef.current.push(marker);
  };

  // 선택된 위치에 마커 표시 (단일 선택용)
  useEffect(() => {
    if (mapInstance.current && selectedLocation && selectedLocation.coords) {
      // 기존 선택 마커들 제거 (현재 위치와 검색 결과 마커는 유지)
      markersRef.current = markersRef.current.filter(marker => 
        marker.title === '현재 위치' || marker.title !== selectedLocation.title
      );

      // 새 선택 마커 생성
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(selectedLocation.coords.lat, selectedLocation.coords.lng),
        map: mapInstance.current,
        icon: {
          content: `
            <div style="
              width: 25px;
              height: 25px;
              background: #4285f4;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: 8px;
                height: 8px;
                background: white;
                border-radius: 50%;
              "></div>
            </div>
          `,
          size: new window.naver.maps.Size(25, 25),
          anchor: new window.naver.maps.Point(12.5, 12.5)
        },
        title: selectedLocation.title,
      });

      // 정보창 생성
      const infoWindow = new window.naver.maps.InfoWindow({
        content: `
          <div style="padding: 10px; min-width: 200px;">
            <h3 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">${selectedLocation.title}</h3>
            <p style="margin: 0; font-size: 12px; color: #666;">${selectedLocation.address}</p>
            ${selectedLocation.category ? `<span style="display: inline-block; margin-top: 5px; padding: 2px 6px; background: #e3f2fd; color: #1976d2; border-radius: 3px; font-size: 11px;">${selectedLocation.category}</span>` : ''}
          </div>
        `
      });

      // 마커 클릭 시 정보창 표시
      window.naver.maps.Event.addListener(marker, 'click', () => {
        infoWindow.open(mapInstance.current, marker);
      });

      markersRef.current.push(marker);

      // 지도 중심을 마커 위치로 부드럽게 이동
      mapInstance.current.panTo(new window.naver.maps.LatLng(selectedLocation.coords.lat, selectedLocation.coords.lng));
    }
  }, [selectedLocation]);

  return (
    <div className="relative w-full h-full" style={{ minHeight: '800px', height: '800px' }}>
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{ minHeight: '800px', height: '800px' }}
      />
      
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: '#F9FAF9' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#30E8AB' }}></div>
            <p style={{ color: '#111827' }}>네이버 맵을 불러오는 중...</p>
          </div>
        </div>
      )}
      
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center p-4" style={{ backgroundColor: '#F9FAF9' }}>
          <div className="rounded-lg shadow-lg p-6 max-w-md w-full" style={{ backgroundColor: 'white' }}>
            <div className="text-center">
              <div className="text-4xl mb-4" style={{ color: '#30E8AB' }}>⚠️</div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#111827' }}>맵 로드 오류</h3>
              <p className="mb-4" style={{ color: '#111827' }}>{mapError}</p>
              
              <div className="text-left text-sm" style={{ color: '#111827' }}>
                <h4 className="font-semibold mb-2">해결 방법:</h4>
                <ol className="list-decimal list-inside space-y-1">
                  <li><strong>올바른 API 키 확인:</strong> Maps &gt; Application에서 지도 전용 API 키를 사용해야 합니다</li>
                  <li><strong>AI NAVER API 키 사용 금지:</strong> AI 서비스용 키로는 지도가 작동하지 않습니다</li>
                  <li><strong>환경 변수 확인:</strong> .env.local 파일에 올바른 API 키가 설정되었는지 확인</li>
                  <li><strong>웹 서비스 URL 등록:</strong> 네이버 클라우드 플랫폼에서 http://localhost:3000이 등록되어 있는지 확인</li>
                  <li><strong>React 앱 재시작:</strong> .env.local 파일 생성/수정 후 앱 재시작 필수</li>
                  <li><strong>브라우저 캐시 삭제:</strong> 개발자 도구에서 하드 리프레시 (Ctrl+Shift+R)</li>
                </ol>
                
                <div className="mt-4 p-3 rounded border" style={{ backgroundColor: '#CEF4E7', borderColor: '#30E8AB' }}>
                  <h5 className="font-semibold mb-1" style={{ color: '#111827' }}>현재 API 정보:</h5>
                  <p style={{ color: '#111827' }}><strong>Client ID:</strong> {import.meta.env.VITE_NAVER_CLIENT_ID || '설정되지 않음'}</p>
                  <p style={{ color: '#111827' }}><strong>웹 서비스 URL:</strong> http://localhost:3000 ✅ (등록됨)</p>
                  <p style={{ color: '#111827' }}><strong>Application:</strong> CodlabApp</p>
                </div>
                
                <div className="mt-3 p-3 rounded border" style={{ backgroundColor: '#F9FAF9', borderColor: '#CEF4E7' }}>
                  <h5 className="font-semibold mb-1" style={{ color: '#111827' }}>✅ 확인된 설정:</h5>
                  <p style={{ color: '#111827' }}>• Client ID: 환경변수에서 로드됨</p>
                  <p style={{ color: '#111827' }}>• 웹 서비스 URL: http://localhost:3000 등록됨</p>
                  <p style={{ color: '#111827' }}>• Application: CodlabApp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {mapLoaded && !mapError && (
        <div className="absolute top-4 left-4 px-3 py-2 rounded text-sm" style={{ backgroundColor: '#CEF4E7', borderColor: '#30E8AB', color: '#111827' }}>
          ✅ 네이버 맵 로드 성공
        </div>
      )}
    </div>
  );
};

export default NaverMap;
