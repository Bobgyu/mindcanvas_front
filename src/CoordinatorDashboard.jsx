import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CoordinatorDashboard() {
  const navigate = useNavigate();
  const [chatRequests, setChatRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 컴포넌트 마운트 시 토큰 검증 및 채팅 요청 목록 로드
  useEffect(() => {
    const token = localStorage.getItem('coordinatorToken');
    if (!token) {
      navigate('/coordinator-login');
      return;
    }

    // JWT 토큰을 로컬에서 검증
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      if (tokenData.exp < currentTime) {
        // 토큰이 만료되었으면 로그인 페이지로
        localStorage.removeItem('coordinatorToken');
        localStorage.removeItem('coordinatorId');
        localStorage.removeItem('coordinatorUsername');
        navigate('/coordinator-login');
        return;
      }
    } catch (error) {
      // 토큰 파싱 오류 시 로그인 페이지로
      localStorage.removeItem('coordinatorToken');
      localStorage.removeItem('coordinatorId');
      localStorage.removeItem('coordinatorUsername');
      navigate('/coordinator-login');
      return;
    }

    // 채팅 요청 목록 로드
    fetchChatRequests();
  }, [navigate]);

  const fetchChatRequests = async () => {
    try {
      const token = localStorage.getItem('coordinatorToken');
      const response = await axios.get('http://localhost:5000/api/coordinator/chat-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setChatRequests(response.data.chat_requests);
      } else {
        setError('채팅 요청 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('채팅 요청 목록 로드 실패:', error);
      if (error.response?.status === 401) {
        // 인증 오류 시 로그인 페이지로
        localStorage.removeItem('coordinatorToken');
        localStorage.removeItem('coordinatorId');
        localStorage.removeItem('coordinatorUsername');
        navigate('/coordinator-login');
      } else {
        setError('채팅 요청 목록을 불러오는데 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('coordinatorToken');
    localStorage.removeItem('coordinatorId');
    localStorage.removeItem('coordinatorUsername');
    localStorage.removeItem('coordinatorSpecialization');
    navigate('/coordinator-login');
  };

  const handleChatRequestClick = (chatRequest) => {
    // 특정 사용자와의 채팅 페이지로 이동
    navigate('/coordinator-chat', { 
      state: { 
        userId: chatRequest.user_id,
        username: chatRequest.username,
        coordinatorId: localStorage.getItem('coordinatorId')
      } 
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const coordinatorUsername = localStorage.getItem('coordinatorUsername');
  const coordinatorName = localStorage.getItem('coordinatorName');
  const coordinatorProfileImage = localStorage.getItem('coordinatorProfileImage');
  const coordinatorSpecialization = localStorage.getItem('coordinatorSpecialization');
  const [imageError, setImageError] = useState(false);

  // 디버깅용 콘솔 출력
  console.log('프로필 이미지 경로:', coordinatorProfileImage);
  console.log('이미지 에러 상태:', imageError);

  // 프로필 이미지가 변경되면 에러 상태 초기화
  useEffect(() => {
    setImageError(false);
  }, [coordinatorProfileImage]);

  return (
    <div className="w-[29rem] h-[58rem] rounded-3xl flex flex-col overflow-hidden relative" style={{backgroundColor: 'rgb(206, 244, 231)'}}>
      {/* 헤더 */}
      <header className="w-full shadow-sm py-4 px-6 flex items-center justify-between flex-shrink-0 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
            {coordinatorProfileImage && !imageError ? (
              <img 
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMxMEI5ODEiLz4KPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+QzwvdGV4dD4KPC9zdmc+" 
                alt="프로필" 
                className="w-full h-full object-cover"
                onError={() => {
                  console.log('이미지 로드 실패');
                  setImageError(true);
                }}
                onLoad={() => {
                  console.log('이미지 로드 성공');
                }}
              />
            ) : (
              <span className="text-green-600 font-semibold text-sm">
                {coordinatorUsername?.charAt(0)?.toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">
              {coordinatorName && coordinatorName !== 'null' && coordinatorName !== coordinatorUsername 
                ? coordinatorName 
                : coordinatorUsername} 코디네이터
            </h1>
            <p className="text-sm text-gray-600">{coordinatorSpecialization}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </header>

      {/* 구분선 */}
      <div className="w-full border-t border-gray-200"></div>

      {/* 메인 콘텐츠 */}
      <main className="flex-grow overflow-y-auto">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">상담 요청 목록</h2>
            <p className="text-gray-600">사용자들의 상담 요청을 확인하고 응답하세요.</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-500">상담 요청을 불러오는 중...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={fetchChatRequests}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                다시 시도
              </button>
            </div>
          ) : chatRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg mb-2">상담 요청이 없습니다</p>
              <p className="text-gray-400 text-sm">사용자들이 상담을 요청하면 여기에 표시됩니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {chatRequests.map((request) => (
                <div
                  key={request.user_id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 cursor-pointer transition-all duration-200"
                  onClick={() => handleChatRequestClick(request)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {request.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-800">
                          {request.username}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {request.message_count}개 메시지
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500">
                        {formatTime(request.last_message_time)}
                      </span>
                      {request.unread_count > 0 && (
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {request.unread_count}개 읽지 않음
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {request.last_message && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {request.last_message}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default CoordinatorDashboard;
