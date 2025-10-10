import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import io from 'socket.io-client'

function Chat() {
  const navigate = useNavigate()
  const location = useLocation()
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef(null)
  
  const coordinator = location.state?.coordinator
  const fromMainPage = location.state?.fromMainPage
  const fromMyPage = location.state?.fromMyPage
  const fromMyPageChat = location.state?.fromMyPageChat
  const fromCoordinator = location.state?.fromCoordinator

  // 디버깅 로그 추가
  console.log('Chat.jsx - coordinator 정보:', coordinator)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // WebSocket 연결
  useEffect(() => {
    if (!coordinator) return;

    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('WebSocket 연결됨');
      setIsConnected(true);
      
      // 채팅방 입장
      const userId = localStorage.getItem('userId');
      newSocket.emit('join_chat', {
        user_id: userId,
        coordinator_id: coordinator.id,
        user_type: 'user'
      });
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket 연결 끊김');
      setIsConnected(false);
    });

    newSocket.on('new_message', (data) => {
      const newMessage = {
        id: data.id,
        text: data.message,
        sender: data.sender,
        timestamp: new Date(data.timestamp).toLocaleTimeString()
      };
      setMessages(prev => [...prev, newMessage]);
    });

    newSocket.on('error', (data) => {
      console.error('WebSocket 오류:', data.message);
    });

    return () => {
      newSocket.close();
    };
  }, [coordinator]);

  // 채팅 히스토리 로드
  useEffect(() => {
    if (coordinator) {
      loadChatHistory()
      markMessagesAsRead() // 채팅방 진입 시 메시지를 읽음 상태로 표시
    }
  }, [coordinator])

  const loadChatHistory = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const userId = localStorage.getItem('userId')
      const response = await axios.get(`http://localhost:5000/api/chat/history?coordinator_id=${coordinator.id}&user_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.data.success) {
        const formattedMessages = response.data.chats.map(chat => ({
          id: chat.id,
          text: chat.message,
          sender: chat.sender,
          timestamp: new Date(chat.created_at).toLocaleTimeString()
        }))
        setMessages(formattedMessages)
      }
    } catch (error) {
      console.error('채팅 히스토리 로드 실패:', error)
    }
  }

  const markMessagesAsRead = async () => {
    try {
      const token = localStorage.getItem('authToken')
      await axios.post('http://localhost:5000/api/chat/mark-read', {
        coordinator_id: coordinator.id
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
    } catch (error) {
      console.error('메시지 읽음 상태 업데이트 실패:', error)
    }
  }

  const handleBack = () => {
    // Coordinator 페이지에서 온 경우 Coordinator 페이지로 돌아가기
    if (fromCoordinator) {
      navigate('/mypage/coordinator', { state: { coordinator } })
    }
    // 그렇지 않으면 기존 로직대로 ChatList로 이동
    else {
      navigate('/chat-list', { state: { refresh: true, fromMainPage, fromMyPage, fromMyPageChat } })
    }
  }

  const sendMessage = async () => {
    if (inputMessage.trim() && socket && isConnected) {
      const messageText = inputMessage.trim();
      setInputMessage('');

      // WebSocket으로 메시지 전송
      const userId = localStorage.getItem('userId');
      socket.emit('send_message', {
        user_id: userId,
        coordinator_id: coordinator.id,
        coordinator_name: coordinator.name || coordinator.username || '코디네이터',
        message: messageText,
        sender: 'user'
      });
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!coordinator) {
    return (
      <div className="w-[29rem] h-[58rem] rounded-3xl bg-white flex flex-col overflow-hidden">
        <div className="flex items-center justify-center h-full">
          <p>코디네이터 정보를 찾을 수 없습니다.</p>
        </div>
      </div>
    )
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
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-800">{coordinator?.name || coordinator?.username || '코디네이터'}님</h1>
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <p className="text-sm" style={{ color: isConnected ? '#27C08D' : '#EF4444' }}>
              {isConnected ? '연결됨' : '연결 끊김'}
            </p>
          </div>
        </div>
        <button className="text-gray-600">
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
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        </button>
      </header>

      {/* 구분선 */}
      <div className="w-full border-t border-gray-200"></div>

      {/* 메시지 영역 - 흰색 배경 */}
      <main className="flex-grow pt-8 px-4 pb-4 overflow-y-auto bg-white">
        <div className="space-y-4 h-full flex flex-col">
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-600">
                <p className="text-lg font-medium mb-2">안녕하세요!</p>
                <p className="text-base">{coordinator?.name || coordinator?.username || '코디네이터'}님입니다.</p>
                <p className="text-sm mt-2">무엇이든 편하게 말씀해 주세요.</p>
              </div>
            </div>
          )}
          
          {messages.length > 0 && (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end space-x-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
              {message.sender === 'coordinator' && (
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  {coordinator.profile ? (
                    <img 
                      src={coordinator.profile} 
                      alt="코디네이터 프로필" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // 이미지 로드 실패 시 기본 아이콘으로 대체
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-full h-full flex items-center justify-center" 
                    style={{
                      backgroundColor: '#CEF4E7', 
                      display: coordinator.profile ? 'none' : 'flex'
                    }}
                  >
                    <span className="text-xs font-semibold" style={{color: 'rgb(39, 192, 141)'}}>
                      {(coordinator?.name || coordinator?.username || 'C').charAt(0)}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col max-w-xs">
                {message.sender === 'coordinator' && (
                  <span className="text-xs text-gray-600 mb-1">코디네이터</span>
                )}
                {message.sender === 'user' && (
                  <span className="text-xs text-gray-600 mb-1 text-right">나</span>
                )}
                
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'text-black'
                      : 'text-black'
                  }`}
                  style={{
                    backgroundColor: message.sender === 'user' ? '#27C08D' : '#C8F0E0'
                  }}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
              
              {message.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs text-gray-600">나</span>
                </div>
              )}
            </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* 입력 영역 */}
      <footer className="w-full p-4 bg-white border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 작성하세요..."
            className="flex-grow px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || !isConnected}
            className="p-3 rounded-full transition-colors"
            style={{ 
              backgroundColor: (inputMessage.trim() && isConnected) ? '#27C08D' : '#E5E5E5',
              color: (inputMessage.trim() && isConnected) ? 'white' : '#9CA3AF'
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  )
}

export default Chat
