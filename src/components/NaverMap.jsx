import { useEffect, useRef, useState } from 'react';

const NaverMap = ({ center = { lat: 37.5665, lng: 126.9780 }, selectedLocation = null, onLocationSelect = null }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState('');

  useEffect(() => {
    initializeMap();
  }, []);

  const loadNaverMapScript = (clientId) => {
    return new Promise((resolve, reject) => {
      // 이미 스크립트가 로드되어 있는지 확인
      if (document.querySelector(`script[src*="openapi.map.naver.com"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const initializeMap = async () => {
    try {
      if (!mapRef.current) return;

      const clientId = import.meta.env.VITE_NAVER_CLIENT_ID;
      
      if (!clientId || clientId === 'your_client_id_here') {
        setMapError('네이버 맵 API 키가 설정되지 않았습니다.');
        setMapLoaded(true);
        return;
      }

      // 네이버 지도 API 동적 로드
      if (!window.naver || !window.naver.maps) {
        await loadNaverMapScript(clientId);
      }

      // 네이버 지도 API 로드 대기
      let attempts = 0;
      while (!window.naver || !window.naver.maps) {
        if (attempts > 100) {
          setMapError('네이버 지도 API 로딩 시간이 초과되었습니다.');
          setMapLoaded(true);
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      const map = new window.naver.maps.Map(mapRef.current, {
        center: new window.naver.maps.LatLng(center.lat, center.lng),
        zoom: 15,
        zoomControl: true,
        zoomControlOptions: {
          position: window.naver.maps.Position.TOP_RIGHT,
        },
      });
      
      mapInstance.current = map;
      setMapLoaded(true);
      setMapError('');

      // 지도 클릭 이벤트 추가
      if (onLocationSelect) {
        window.naver.maps.Event.addListener(map, 'click', (e) => {
          const lat = e.coord.lat();
          const lng = e.coord.lng();
          onLocationSelect({ lat, lng });
        });
      }
    } catch (error) {
      console.error('맵 초기화 오류:', error);
      setMapError('네이버 맵을 불러오는 중 오류가 발생했습니다.');
      setMapLoaded(true);
    }
  };

  // 지도 중심 변경
  useEffect(() => {
    if (mapInstance.current && center) {
      mapInstance.current.setCenter(new window.naver.maps.LatLng(center.lat, center.lng));
    }
  }, [center]);

  // 선택된 위치에 마커 표시
  useEffect(() => {
    if (mapInstance.current && selectedLocation && selectedLocation.coords) {
      // 기존 마커들 제거
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // 새 마커 생성
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(selectedLocation.coords.lat, selectedLocation.coords.lng),
        map: mapInstance.current,
        title: selectedLocation.title,
      });

      // 정보창 생성
      const infoWindow = new window.naver.maps.InfoWindow({
        content: `
          <div style="padding: 10px; min-width: 200px;">
            <h3 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">${selectedLocation.title}</h3>
            <p style="margin: 0; font-size: 12px; color: #666;">${selectedLocation.address}</p>
            ${selectedLocation.telephone ? `<p style="margin: 5px 0 0 0; font-size: 12px; color: #007bff;">${selectedLocation.telephone}</p>` : ''}
          </div>
        `
      });

      // 마커 클릭 시 정보창 표시
      window.naver.maps.Event.addListener(marker, 'click', () => {
        infoWindow.open(mapInstance.current, marker);
      });

      markersRef.current.push(marker);
      mapInstance.current.setCenter(new window.naver.maps.LatLng(selectedLocation.coords.lat, selectedLocation.coords.lng));
    }
  }, [selectedLocation]);

  return (
    <div className="relative w-full h-full" style={{ minHeight: '400px' }}>
      <div ref={mapRef} className="w-full h-full" />
      
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">네이버 맵을 불러오는 중...</p>
          </div>
        </div>
      )}
      
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">맵 로드 오류</h3>
              <p className="text-gray-600">{mapError}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NaverMap;
