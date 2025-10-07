import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NaverMap from '../navermap/NaverMap'
import SearchBar from '../navermap/SearchBar'
import SearchResults from '../navermap/SearchResults'

const CounselingCenterPage = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.9780 }) // 서울 중심
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [autoSearchTriggered, setAutoSearchTriggered] = useState(false)

  // 현재 위치 가져오기
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('이 브라우저에서는 위치 서비스를 지원하지 않습니다.')
      return
    }

    console.log('📍 현재 위치 요청 시작...')
    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        console.log('✅ 현재 위치 획득 성공:', { lat, lng })
        setCurrentLocation({ lat, lng })
        setMapCenter({ lat, lng })
        setIsLoading(false)
        
        // 현재 위치 확인 후 자동으로 상담센터 검색 실행
        console.log('🔍 현재 위치 확인 완료, 상담센터 자동 검색 시작...')
        setAutoSearchTriggered(true)
      },
      (error) => {
        console.error('❌ 위치 가져오기 오류:', error)
        alert('위치를 가져올 수 없습니다. 기본 위치(서울)를 사용합니다.')
        setIsLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }

  // 자동 상담센터 검색 실행
  const handleAutoSearch = () => {
    console.log('🔍 자동 상담센터 검색 실행')
    setSearchQuery('') // 빈 검색어로 상담센터 자동 검색
    setAutoSearchTriggered(true)
  }

  // 네이버 검색 API 호출
  const searchPlaces = async (query) => {
    try {
      const response = await fetch('http://localhost:5000/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          display: 10
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
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
      return data
    } catch (error) {
      console.error('지오코딩 API 오류:', error)
      throw error
    }
  }

  // 페이지 로드 시 현재 위치 가져오기
  useEffect(() => {
    getCurrentLocation()
  }, [])

  // 검색어 변경 시 자동 검색
  useEffect(() => {
    if (searchQuery.trim()) {
      // SearchResults 컴포넌트에서 자동으로 검색을 수행하므로
      // 여기서는 추가 작업이 필요하지 않습니다
    }
  }, [searchQuery])


  // 위치 선택
  const handleLocationSelect = (location) => {
    setSelectedLocation(location)
    if (location.coords) {
      setMapCenter({
        lat: location.coords.lat,
        lng: location.coords.lng
      })
    }
  }

  // 검색 결과 변경 처리
  const handleResultsChange = (results) => {
    setSearchResults(results)
    
    // 현재 위치가 있으면 현재 위치를 우선으로 하고, 없을 때만 첫 번째 결과로 이동
    if (currentLocation) {
      // 현재 위치가 있으면 지도 중심을 현재 위치로 유지
      setMapCenter({
        lat: currentLocation.lat,
        lng: currentLocation.lng
      })
    } else if (results.length > 0 && results[0].coords) {
      // 현재 위치가 없을 때만 첫 번째 결과로 맵 중심 이동
      setMapCenter({
        lat: results[0].coords.lat,
        lng: results[0].coords.lng
      })
    }
  }


  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F9FAF9',
      padding: '20px',
      paddingBottom: '40px',
      height: 'auto'
    }}>
      {/* 헤더 */}
      <div style={{
        backgroundColor: '#CEF4E7',
        borderRadius: '15px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: '0 0 5px 0', color: '#111827', fontSize: '24px' }}>
            근처 심리상담센터 찾기
          </h1>
          <p style={{ margin: '0', color: '#111827', fontSize: '14px' }}>
            근처 심리상담센터를 검색하고 위치를 확인할 수 있습니다.
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '10px 20px',
            backgroundColor: 'rgb(39, 192, 141)',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          <img src="/src/imgdata/icon/backarrow.png" alt="뒤로가기" style={{ width: '16px', height: '16px' }} />
        </button>
      </div>

      {/* 검색 바 */}
      <div style={{
        backgroundColor: '#CEF4E7',
        borderRadius: '15px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <SearchBar
          onSearch={setSearchQuery}
          onCurrentLocation={getCurrentLocation}
          locationLoading={isLoading}
          onAutoSearch={handleAutoSearch}
        />
      </div>

      {/* 메인 컨텐츠 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        minHeight: '800px',
        height: 'auto'
      }}>
        {/* 검색 결과 리스트 */}
        <div style={{
          width: '100%',
          backgroundColor: '#CEF4E7',
          borderRadius: '15px',
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          overflowY: 'auto',
          maxHeight: '400px'
        }}>
          <SearchResults
            searchTerm={searchQuery}
            onLocationSelect={handleLocationSelect}
            onResultsChange={handleResultsChange}
            currentLocation={currentLocation}
            autoSearchTriggered={autoSearchTriggered}
          />
        </div>

        {/* 지도 */}
        <div style={{
          width: '100%',
          backgroundColor: '#CEF4E7',
          borderRadius: '15px',
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          position: 'relative',
          minHeight: '800px'
        }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#111827' }}>
                {currentLocation 
                  ? `지도 (5km 이내 ${searchResults.length}개 심리상담센터)`
                  : `지도 (${searchResults.length}개 심리상담센터)`
                }
              </h3>
          <div style={{ height: '800px', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
            <NaverMap 
              center={mapCenter} 
              selectedLocation={selectedLocation}
              currentLocation={currentLocation}
              searchResults={searchResults}
            />
          </div>
        </div>
      </div>

      {/* 선택된 위치 정보 */}
      {selectedLocation && (
        <div style={{
          backgroundColor: '#CEF4E7',
          borderRadius: '15px',
          padding: '20px',
          marginTop: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#111827' }}>
            선택된 상담센터 정보
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            <div>
              <h4 style={{ margin: '0 0 10px 0', color: '#111827', fontSize: '18px' }}>
                {selectedLocation.title}
              </h4>
              <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#111827' }}>
                📍 {selectedLocation.roadAddress || selectedLocation.address}
              </p>
              {selectedLocation.telephone && (
                <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: 'rgb(39, 192, 141)' }}>
                  📞 {selectedLocation.telephone}
                </p>
              )}
              {selectedLocation.category && (
                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#111827' }}>
                  {selectedLocation.category}
                </p>
              )}
            </div>
            {selectedLocation.coords && (
              <div>
                <h5 style={{ margin: '0 0 10px 0', color: '#111827' }}>좌표 정보</h5>
                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#111827' }}>
                  위도: {selectedLocation.coords.lat.toFixed(6)}
                </p>
                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#111827' }}>
                  경도: {selectedLocation.coords.lng.toFixed(6)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

export default CounselingCenterPage
