import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'

function Chat() {
  const navigate = useNavigate()
  const location = useLocation()
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef(null)
  
  const coordinator = location.state?.coordinator
  const fromMainPage = location.state?.fromMainPage
  const fromMyPage = location.state?.fromMyPage

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
      const response = await axios.get(`http://localhost:5000/api/chat/history?coordinator_id=${coordinator.id}`, {
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
    navigate('/chat-list', { state: { refresh: true, fromMainPage, fromMyPage } })
  }

  const sendMessage = async () => {
    if (inputMessage.trim()) {
      const userMessage = {
        id: Date.now(),
        text: inputMessage.trim(),
        sender: 'user',
        timestamp: new Date().toLocaleTimeString()
      }
      
      setMessages(prev => [...prev, userMessage])
      const messageText = inputMessage.trim()
      setInputMessage('')
      
      // 사용자 메시지를 DB에 저장
      try {
        const token = localStorage.getItem('authToken')
        await axios.post('http://localhost:5000/api/chat/send', {
          coordinator_id: coordinator.id,
          coordinator_name: coordinator.name,
          message: messageText,
          sender: 'user'
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      } catch (error) {
        console.error('메시지 저장 실패:', error)
      }
      
      // AI 응답 시뮬레이션
      setTimeout(async () => {
        const responses = [
          "안녕하세요! 어떤 도움이 필요하신가요?",
          "그런 마음이 드시는군요. 더 자세히 말씀해 주실 수 있나요?",
          "충분히 이해합니다. 함께 해결해보아요.",
          "좋은 질문이네요. 제 경험상 이런 방법이 도움이 될 것 같습니다.",
          "괜찮습니다. 천천히 말씀해 주세요."
        ]
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)]
        
        const aiMessage = {
          id: Date.now() + 1,
          text: randomResponse,
          sender: 'coordinator',
          timestamp: new Date().toLocaleTimeString()
        }
        
        setMessages(prev => [...prev, aiMessage])
        
        // AI 응답도 DB에 저장
        try {
          const token = localStorage.getItem('authToken')
          await axios.post('http://localhost:5000/api/chat/send', {
            coordinator_id: coordinator.id,
            coordinator_name: coordinator.name,
            message: randomResponse,
            sender: 'coordinator'
          }, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        } catch (error) {
          console.error('AI 응답 저장 실패:', error)
        }
      }, 1000)
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
          <h1 className="text-lg font-bold text-gray-800">{coordinator.name} 코디네이터</h1>
          <p className="text-sm" style={{ color: '#27C08D' }}>온라인</p>
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
                <p className="text-base">{coordinator.name} 코디네이터입니다.</p>
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
                <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs text-gray-600">코</span>
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
            disabled={!inputMessage.trim()}
            className="p-3 rounded-full transition-colors"
            style={{ 
              backgroundColor: inputMessage.trim() ? '#27C08D' : '#E5E5E5',
              color: inputMessage.trim() ? 'white' : '#9CA3AF'
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
