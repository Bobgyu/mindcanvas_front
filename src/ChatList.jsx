import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'

function ChatList() {
  const navigate = useNavigate()
  const location = useLocation()
  const [chatRooms, setChatRooms] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [modal, setModal] = useState({ show: false, message: '', type: '', onConfirm: null })

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


  const handleDeleteChat = (chatRoom, e) => {
    e.stopPropagation() // 채팅방 클릭 이벤트 방지
    setModal({ 
      show: true, 
      message: `${chatRoom.coordinator_name} 코디네이터와의 채팅을\n삭제하시겠습니까?\n\n삭제된 채팅은 복구할 수 없습니다.`, 
      type: 'warning',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('authToken')
          const response = await axios.delete(`http://localhost:5000/api/chat/room/${chatRoom.coordinator_id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (response.data.success) {
            setModal({ 
              show: true, 
              message: '채팅이 삭제되었습니다.', 
              type: 'success' 
            })
            // 채팅방 목록 새로고침
            fetchChatRooms()
          } else {
            setModal({ 
              show: true, 
              message: '채팅 삭제에 실패했습니다.', 
              type: 'error' 
            })
          }
        } catch (error) {
          console.error('채팅 삭제 오류:', error)
          if (error.response?.status === 401) {
            setModal({ 
              show: true, 
              message: '로그인이 만료되었습니다. 다시 로그인해주세요.', 
              type: 'warning' 
            })
            localStorage.removeItem('authToken')
            localStorage.removeItem('userId')
            localStorage.removeItem('username')
            setTimeout(() => navigate('/login'), 2000)
          } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            setModal({ 
              show: true, 
              message: '서버 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.', 
              type: 'error' 
            })
          } else {
            setModal({ 
              show: true, 
              message: '채팅 삭제 중 오류가 발생했습니다.', 
              type: 'error' 
            })
          }
        }
      }
    })
  }

  const closeModal = () => {
    setModal({ show: false, message: '', type: '', onConfirm: null })
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
    <div className="w-[29rem] h-[58rem] rounded-3xl flex flex-col overflow-hidden relative" style={{backgroundColor: 'rgb(206, 244, 231)'}}>
      {/* 모달 오버레이 */}
      {modal.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '30px',
            margin: '20px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            textAlign: 'center'
          }}>
            {/* 모달 아이콘 */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              {modal.type === 'success' && (
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#d4edda',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{ width: '30px', height: '30px', color: '#28a745' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {modal.type === 'error' && (
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#f8d7da',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{ width: '30px', height: '30px', color: '#dc3545' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              {modal.type === 'warning' && (
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#fff3cd',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{ width: '30px', height: '30px', color: '#ffc107' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* 모달 메시지 */}
            <p style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '25px',
              lineHeight: '1.5',
              whiteSpace: 'pre-line'
            }}>
              {modal.message}
            </p>
            
            {/* 버튼들 */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {modal.type === 'warning' ? (
                <>
                  <button
                    onClick={closeModal}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.opacity = '0.9';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.opacity = '1';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      if (modal.onConfirm) {
                        modal.onConfirm();
                      }
                      closeModal();
                    }}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.opacity = '0.9';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.opacity = '1';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    삭제
                  </button>
                </>
              ) : (
                <button
                  onClick={closeModal}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: modal.type === 'success' ? 'rgb(39, 192, 141)' : 
                                   modal.type === 'error' ? '#dc3545' : '#ffc107',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = '0.9';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = '1';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  확인
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <header className="w-full shadow-sm py-4 px-6 flex items-center justify-between flex-shrink-0">
        <button className="text-gray-600" onClick={handleBack}>
          <img src="/src/imgdata/icon/backarrow.png" alt="뒤로가기" style={{ width: '24px', height: '24px' }} />
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
          <div className="space-y-4 p-4">
            {chatRooms.map((chatRoom) => (
              <div
                key={chatRoom.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 cursor-pointer transition-all duration-200"
                onClick={() => handleChatRoomClick(chatRoom)}
              >
                <div className="flex items-center space-x-4">
                  {/* 프로필 이미지 */}
                  <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 border-2" style={{backgroundColor: '#CEF4E7', borderColor: 'rgb(39, 192, 141)'}}>
                    <span className="text-lg font-semibold" style={{color: 'rgb(39, 192, 141)'}}>
                      {chatRoom.coordinator_name.charAt(0)}
                    </span>
                  </div>
                  
                  {/* 채팅방 정보 */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-semibold truncate" style={{color: '#111827'}}>
                        {chatRoom.coordinator_name} 코디네이터
                      </h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => handleDeleteChat(chatRoom, e)}
                          className="text-gray-400 transition-colors p-1 rounded-full hover:bg-opacity-20"
                          style={{'&:hover': {color: '#dc3545', backgroundColor: '#f8d7da'}}}
                          title="채팅 삭제"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <span className="text-xs px-2 py-1 rounded-full" style={{color: '#111827', backgroundColor: '#CEF4E7'}}>
                          {formatTime(chatRoom.last_message_time)}
                        </span>
                        {chatRoom.unread_count > 0 && (
                          <span className="w-6 h-6 text-white text-xs rounded-full flex items-center justify-center font-semibold" style={{backgroundColor: 'rgb(39, 192, 141)'}}>
                            {chatRoom.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm mb-2 font-medium" style={{color: '#111827'}}>
                      {chatRoom.coordinator_institution}
                    </p>
                    <p className="text-sm truncate p-2 rounded-lg" style={{color: '#111827', backgroundColor: '#F9FAF9'}}>
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
