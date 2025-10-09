import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'

function CoordinatorFind() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedCoordinator, setSelectedCoordinator] = useState(null)
  const [favorites, setFavorites] = useState(new Set())
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [modal, setModal] = useState({ show: false, message: '', type: '' })
  const [assignedCoordinatorId, setAssignedCoordinatorId] = useState(null)

  const handleBack = () => {
    // location.state를 확인해서 정확한 페이지로 돌아가기
    if (location.state && location.state.from === 'gallery-detail') {
      // 갤러리 상세보기에서 온 경우, 갤러리 페이지로 돌아가되 특정 그림이 선택된 상태로
      navigate('/mypage/gallery', { state: { selectedDrawingId: location.state.drawingId } })
    } else if (location.state && location.state.from === 'analysis') {
      // 분석 페이지에서 온 경우, 분석 페이지로 돌아가기
      navigate(-1)
    } else {
      // 기본적으로 이전 페이지로 돌아가기
      navigate(-1)
    }
  }

  const handleHome = () => {
    navigate('/mainpage')
  }

  // 사용자의 지정된 코디네이터 정보 가져오기
  useEffect(() => {
    const fetchAssignedCoordinator = async () => {
      try {
        const token = localStorage.getItem('authToken')
        if (!token) return

        const response = await axios.get('http://localhost:5000/api/user/coordinator', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.data.success && response.data.coordinator) {
          setAssignedCoordinatorId(response.data.coordinator.id)
        }
      } catch (error) {
        console.error('지정된 코디네이터 정보 조회 실패:', error)
      }
    }

    fetchAssignedCoordinator()
  }, [])

  // 마음코디네이터 데이터 (실제로는 API에서 가져올 데이터)
  const coordinators = [
    {
      id: 1,
      name: "김철호",
      age: "70세",
      region: "서울",
      experience: "8년",
      institution: "마음치료센터",
      profile: "/src/imgdata/icon/마음코디네이터1.png"
    },
    {
      id: 2,
      name: "이말숙",
      age: "69세", 
      region: "부산",
      experience: "5년",
      institution: "정신건강원",
      profile: "/src/imgdata/icon/마음코디네이터2.png"
    },
    {
      id: 3,
      name: "박수미",
      age: "63세",
      region: "대구", 
      experience: "10년",
      institution: "심리상담센터",
      profile: "/src/imgdata/icon/마음코디네이터3.png"
    },
    {
      id: 4,
      name: "최준식",
      age: "65세",
      region: "인천", 
      experience: "8년",
      institution: "심리상담센터",
      profile: "/src/imgdata/icon/마음코디네이터4.png"
    }
  ]

  const handleChat = () => {
    if (selectedCoordinator) {
      navigate('/chat', { state: { coordinator: selectedCoordinator, fromMyPage: true } })
    } else {
      setModal({ 
        show: true, 
        message: '먼저 코디네이터를 선택해주세요!', 
        type: 'warning' 
      })
    }
  }

  const handleCoordinatorClick = (coordinator) => {
    // 코디네이터 카드 클릭 시 해당 코디네이터를 선택
    setSelectedCoordinator(coordinator)
  }


  const handleWishlist = (coordinatorId) => {
    const isCurrentlyFavorite = favorites.has(coordinatorId)
    
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      
      if (isCurrentlyFavorite) {
        newFavorites.delete(coordinatorId)
      } else {
        newFavorites.add(coordinatorId)
      }
      
      return newFavorites
    })
  }

  const handleToggleFavorites = () => {
    setShowFavoritesOnly(prev => !prev)
  }

  const closeModal = () => {
    setModal({ show: false, message: '', type: '' })
  }

  // 필터링된 코디네이터 목록 (지정된 코디네이터 제외)
  const filteredCoordinators = coordinators
    .filter(coordinator => coordinator.id !== assignedCoordinatorId) // 지정된 코디네이터 제외
    .filter(coordinator => showFavoritesOnly ? favorites.has(coordinator.id) : true) // 즐겨찾기 필터

  return (
    <div className="w-[29rem] h-[58rem] rounded-3xl flex flex-col overflow-hidden relative" style={{backgroundColor: 'rgb(206, 244, 231)'}}>
      {/* 모달 오버레이 */}
      {modal.show && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl transform transition-all duration-300 ease-out">
            {/* 모달 아이콘 */}
            <div className="flex justify-center mb-4">
              {modal.type === 'add' && (
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {modal.type === 'remove' && (
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              {modal.type === 'warning' && (
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* 모달 메시지 */}
            <p className="text-center text-gray-800 text-base font-medium mb-6 leading-relaxed">
              {modal.message}
            </p>
            
            {/* 확인 버튼 */}
            <button
              onClick={closeModal}
              className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors duration-200"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <header className="w-full shadow-sm py-4 px-6 flex items-center justify-between flex-shrink-0">
        <button className="text-gray-600" onClick={handleBack}>
          <img src="/src/imgdata/icon/backarrow.png" alt="뒤로가기" style={{ width: '24px', height: '24px' }} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">마음코디네이터</h1>
        <button className="text-gray-600" onClick={handleHome}>
          <img src="/src/imgdata/icon/homeicon.png" alt="홈" style={{ width: '24px', height: '24px' }} />
        </button>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-grow p-6 overflow-y-auto">
        <div className="space-y-4">
          {filteredCoordinators.length === 0 && showFavoritesOnly ? (
            <div className="text-center py-8">
              <p className="text-gray-500">즐겨찾기된 코디네이터가 없습니다.</p>
              <p className="text-sm text-gray-400 mt-2">하트 버튼을 눌러 코디네이터를 즐겨찾기에 추가해보세요.</p>
            </div>
          ) : (
            filteredCoordinators.map((coordinator) => (
            <div 
              key={coordinator.id} 
              className={`border rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 ${
                selectedCoordinator && selectedCoordinator.id === coordinator.id
                  ? 'bg-green-50 border-green-300 shadow-md'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleCoordinatorClick(coordinator)}
            >
              <div className="flex items-start space-x-4">
                {/* 프로필 이미지 */}
                <div className="flex-shrink-0">
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    backgroundColor: '#CEF4E7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <img 
                      src={coordinator.profile} 
                      alt="프로필" 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '50%'
                      }}
                    />
                  </div>
                </div>
                
                {/* 코디네이터 정보 */}
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-3 flex-grow">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span style={{color: '#6B7280', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px'}}>이름:</span>
                          <span style={{fontWeight: '600', color: '#111827', fontSize: '16px'}}>{coordinator.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span style={{color: '#6B7280', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px'}}>나이:</span>
                          <span style={{fontWeight: '600', color: '#111827', fontSize: '16px'}}>{coordinator.age}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span style={{color: '#6B7280', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px'}}>지역:</span>
                          <span style={{fontWeight: '600', color: '#111827', fontSize: '16px'}}>{coordinator.region}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span style={{color: '#6B7280', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px'}}>경력:</span>
                          <span style={{fontWeight: '600', color: '#111827', fontSize: '16px'}}>{coordinator.experience}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span style={{color: '#6B7280', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px'}}>기관:</span>
                        <span style={{fontWeight: '600', color: '#111827', fontSize: '16px'}}>{coordinator.institution}</span>
                      </div>
                    </div>
                    
                    {/* 즐겨찾기 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleWishlist(coordinator.id)
                      }}
                      className="ml-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
                      title="즐겨찾기"
                    >
                      <svg 
                        className={`w-5 h-5 transition-colors ${
                          favorites.has(coordinator.id) 
                            ? 'text-red-500' 
                            : 'text-gray-400 hover:text-red-500'
                        }`} 
                        fill={favorites.has(coordinator.id) ? 'currentColor' : 'none'} 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      </main>

      {/* 하단 액션 바 */}
      <footer className="w-full p-6 bg-white border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* 왼쪽 버튼들 */}
          <div className="flex space-x-2">
            <button 
              onClick={handleToggleFavorites}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                showFavoritesOnly 
                  ? 'bg-red-100 hover:bg-red-200' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              title={showFavoritesOnly ? '전체 보기' : '즐겨찾기만 보기'}
            >
              <svg 
                className={`w-5 h-5 transition-colors ${
                  showFavoritesOnly ? 'text-red-500' : 'text-gray-600'
                }`} 
                fill={showFavoritesOnly ? 'currentColor' : 'none'} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
          
          {/* 대화하기 버튼 */}
          <button 
            onClick={handleChat}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              selectedCoordinator 
                ? 'bg-primary-green text-white hover:bg-primary-green-hover' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            style={{ backgroundColor: selectedCoordinator ? 'rgb(39, 192, 141)' : undefined }}
            disabled={!selectedCoordinator}
          >
            {selectedCoordinator ? `대화하기` : '코디네이터를 선택하세요'}
          </button>
        </div>
      </footer>
    </div>
  )
}

export default CoordinatorFind