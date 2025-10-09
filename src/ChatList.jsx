import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'

function ChatList() {
  const navigate = useNavigate()
  const location = useLocation()
  const [chatRooms, setChatRooms] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // 채팅방 목록 조회
  useEffect(() => {
    fetchChatRooms()
  }, [])

  // 채팅방에서 돌아왔을 때 목록 새로고침
  useEffect(() => {
    if (location.state?.refresh) {
      fetchChatRooms()
    }
  }, [location.state])

  const fetchChatRooms = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await axios.get('http://localhost:5000/api/chat/rooms', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.data.success) {
        const rooms = response.data.chat_rooms.map(room => ({
          id: room.coordinator_id,
          coordinator_id: room.coordinator_id,
          coordinator_name: room.coordinator_name,
          coordinator_institution: "상담센터", // 기본값 설정
          last_message: room.last_message,
          last_message_time: room.last_message_time,
          unread_count: room.unread_count
        }))
        
        setChatRooms(rooms)
      } else {
        console.error('채팅방 목록 조회 실패:', response.data.error)
        setChatRooms([])
      }
      setIsLoading(false)
    } catch (error) {
      console.error('채팅방 목록 조회 실패:', error)
      setChatRooms([])
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    // 메인페이지에서 온 경우 메인페이지로 돌아가기
    if (location.state?.fromMainPage) {
      navigate('/mainpage')
    } 
    // 마이페이지 하단바 채팅 버튼에서 온 경우 마이페이지로 돌아가기
    else if (location.state?.fromMyPageChat) {
      navigate('/mypage')
    }
    // 마이페이지에서 온 경우 마음코디네이터 페이지로 돌아가기
    else if (location.state?.fromMyPage) {
      navigate('/mypage/coordinator')
    } 
    else {
      navigate(-1)
    }
  }

  const handleChatRoomClick = (chatRoom) => {
    // 코디네이터 정보를 state로 전달하여 채팅 페이지로 이동
    const coordinator = {
      id: chatRoom.coordinator_id,
      name: chatRoom.coordinator_name,
      institution: chatRoom.coordinator_institution
    }
    navigate('/chat', { state: { coordinator, fromMainPage: location.state?.fromMainPage, fromMyPage: location.state?.fromMyPage, fromMyPageChat: location.state?.fromMyPageChat } })
  }

  const handleViewCoordinator = (chatRoom, e) => {
    e.stopPropagation() // 채팅방 클릭 이벤트 방지
    // 코디네이터 정보를 state로 전달하여 코디네이터 페이지로 이동
    const coordinator = {
      id: chatRoom.coordinator_id,
      name: chatRoom.coordinator_name,
      institution: chatRoom.coordinator_institution
    }
    navigate('/coordinator', { state: { coordinator } })
  }

  const formatTime = (timeString) => {
    const date = new Date(timeString)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else {
      return date.toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  return (
    <div className="w-[29rem] h-[58rem] rounded-3xl bg-white flex flex-col overflow-hidden">
      {/* 헤더 */}
      <header className="w-full shadow-sm py-4 px-6 flex items-center justify-between flex-shrink-0 bg-white">
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
        <h1 className="text-xl font-bold text-gray-800">채팅</h1>
        <div className="w-6"></div>
      </header>

      {/* 구분선 */}
      <div className="w-full border-t border-gray-200"></div>

      {/* 채팅방 목록 */}
      <main className="flex-grow overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">채팅방을 불러오는 중...</p>
          </div>
        ) : chatRooms.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">채팅방이 없습니다</p>
              <p className="text-sm">마음코디네이터와 대화를 시작해보세요</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {chatRooms.map((chatRoom) => (
              <div
                key={chatRoom.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleChatRoomClick(chatRoom)}
              >
                <div className="flex items-center space-x-3">
                  {/* 프로필 이미지 */}
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm text-gray-600">
                      {chatRoom.coordinator_name.charAt(0)}
                    </span>
                  </div>
                  
                  {/* 채팅방 정보 */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {chatRoom.coordinator_name} 코디네이터
                      </h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => handleViewCoordinator(chatRoom, e)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="코디네이터 정보 보기"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </button>
                        <span className="text-xs text-gray-500">
                          {formatTime(chatRoom.last_message_time)}
                        </span>
                        {chatRoom.unread_count > 0 && (
                          <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {chatRoom.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      {chatRoom.coordinator_institution}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {chatRoom.last_message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default ChatList
