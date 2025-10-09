import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

function CoordinatorFind() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedCoordinator, setSelectedCoordinator] = useState(null)

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
    navigate('/mypage')
  }

  // 마음코디네이터 데이터 (실제로는 API에서 가져올 데이터)
  const coordinators = [
    {
      id: 1,
      name: "김상담",
      age: "65세",
      region: "서울",
      experience: "8년",
      institution: "마음치료센터",
      profile: "/src/imgdata/icon/user.png"
    },
    {
      id: 2,
      name: "이심리",
      age: "62세", 
      region: "부산",
      experience: "5년",
      institution: "정신건강원",
      profile: "/src/imgdata/icon/user.png"
    },
    {
      id: 3,
      name: "박치료",
      age: "68세",
      region: "대구", 
      experience: "10년",
      institution: "상담센터",
      profile: "/src/imgdata/icon/user.png"
    }
  ]

  const handleChat = () => {
    if (selectedCoordinator) {
      navigate('/chat', { state: { coordinator: selectedCoordinator, fromMyPage: true } })
    } else {
      alert('먼저 코디네이터를 선택해주세요!')
    }
  }

  const handleCoordinatorClick = (coordinator) => {
    // 코디네이터 카드 클릭 시 해당 코디네이터를 선택
    setSelectedCoordinator(coordinator)
  }

  const handleViewDetails = (coordinator) => {
    // 코디네이터 상세 정보 보기
    navigate('/coordinator', { state: { coordinator } })
  }

  const handleWishlist = (coordinatorId) => {
    alert(`${coordinatorId}번 코디네이터를 찜했습니다!`)
  }

  return (
    <div className="w-[29rem] h-[58rem] rounded-3xl bg-white flex flex-col overflow-hidden">
      {/* 헤더 */}
      <header className="w-full shadow-sm py-4 px-6 flex items-center justify-between flex-shrink-0">
        <button className="text-gray-600" onClick={handleBack}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-800">마음코디네이터</h1>
        <button className="text-gray-600" onClick={handleHome}>
          <span className="text-sm font-medium">홈</span>
        </button>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-grow p-6 overflow-y-auto">
        <div className="space-y-4">
          {coordinators.map((coordinator) => (
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
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <img 
                      src={coordinator.profile} 
                      alt="프로필" 
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  </div>
                </div>
                
                {/* 코디네이터 정보 */}
                <div className="flex-grow">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-500">이름</span>
                        <p className="font-medium text-gray-800">{coordinator.name}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">지역</span>
                        <p className="font-medium text-gray-800">{coordinator.region}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">경력</span>
                        <p className="font-medium text-gray-800">{coordinator.experience}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-500">나이</span>
                        <p className="font-medium text-gray-800">{coordinator.age}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">기관</span>
                        <p className="font-medium text-gray-800">{coordinator.institution}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* 상세보기 버튼 */}
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewDetails(coordinator)
                      }}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      상세보기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 하단 액션 바 */}
      <footer className="w-full p-6 bg-white border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* 왼쪽 버튼들 */}
          <div className="flex space-x-2">
            <button 
              onClick={() => handleWishlist(1)}
              className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
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
