import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

function CoordinatorChat() {
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  
  const { userId, username, coordinatorId } = location.state || {};
  const coordinatorUsername = localStorage.getItem('coordinatorUsername');
  const coordinatorName = localStorage.getItem('coordinatorName');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket 연결
  useEffect(() => {
    if (!userId || !coordinatorId) {
      navigate('/coordinator-dashboard');
      return;
    }

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
      newSocket.emit('join_chat', {
        user_id: userId,
        coordinator_id: coordinatorId,
        user_type: 'coordinator'
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
  }, [userId, coordinatorId, navigate]);

  // 채팅 히스토리 로드
  useEffect(() => {
    if (userId && coordinatorId) {
      loadChatHistory();
    }
  }, [userId, coordinatorId]);

  const loadChatHistory = async () => {
    try {
      const token = localStorage.getItem('coordinatorToken');
      const response = await axios.get(`http://localhost:5000/api/chat/history?coordinator_id=${coordinatorId}&user_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const formattedMessages = response.data.chats.map(chat => ({
          id: chat.id,
          text: chat.message,
          sender: chat.sender,
          timestamp: new Date(chat.created_at).toLocaleTimeString()
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('채팅 히스토리 로드 실패:', error);
    }
  };

  const handleBack = () => {
    navigate('/coordinator-dashboard');
  };

  const sendMessage = async () => {
    if (inputMessage.trim() && socket && isConnected) {
      const messageText = inputMessage.trim();
      setInputMessage('');

      // WebSocket으로 메시지 전송
      const coordinatorName = localStorage.getItem('coordinatorName') || localStorage.getItem('coordinatorUsername') || '코디네이터';
      socket.emit('send_message', {
        user_id: userId,
        coordinator_id: coordinatorId,
        coordinator_name: coordinatorName,
        message: messageText,
        sender: 'coordinator'
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!userId || !coordinatorId) {
    return (
      <div className="w-[29rem] h-[58rem] rounded-3xl bg-white flex flex-col overflow-hidden">
        <div className="flex items-center justify-center h-full">
          <p>채팅 정보를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
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
          <h1 className="text-lg font-bold text-gray-800">{username}님과의 상담</h1>
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <p className="text-sm" style={{ color: isConnected ? '#27C08D' : '#EF4444' }}>
              {isConnected ? '연결됨' : '연결 끊김'}
            </p>
          </div>
        </div>
        <div className="w-6"></div>
      </header>

      {/* 구분선 */}
      <div className="w-full border-t border-gray-200"></div>

      {/* 메시지 영역 */}
      <main className="flex-grow pt-8 px-4 pb-4 overflow-y-auto bg-white">
        <div className="space-y-4 h-full flex flex-col">
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-600">
                <p className="text-lg font-medium mb-2">안녕하세요!</p>
                <p className="text-base">{username}님과의 상담을 시작합니다.</p>
                <p className="text-sm mt-2">도움이 필요한 내용을 말씀해 주세요.</p>
              </div>
            </div>
          )}
          
          {messages.length > 0 && (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end space-x-2 ${message.sender === 'coordinator' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center">
                      <span className="text-xs font-semibold text-blue-600">
                        {username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex flex-col max-w-xs">
                    {message.sender === 'user' && (
                      <span className="text-xs text-gray-600 mb-1">{username}</span>
                    )}
                    {message.sender === 'coordinator' && (
                      <span className="text-xs text-gray-600 mb-1 text-right">{coordinatorName || '코디네이터'}</span>
                    )}
                    
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        message.sender === 'coordinator'
                          ? 'text-black'
                          : 'text-black'
                      }`}
                      style={{
                        backgroundColor: message.sender === 'coordinator' ? '#27C08D' : '#E5F3FF'
                      }}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                  
                  {message.sender === 'coordinator' && (
                    <div className="w-8 h-8 rounded-full bg-green-100 flex-shrink-0 flex items-center justify-center">
                      <span className="text-xs font-semibold text-green-600">
                        {coordinatorUsername?.charAt(0)?.toUpperCase()}
                      </span>
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
            disabled={!isConnected}
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
  );
}

export default CoordinatorChat;
