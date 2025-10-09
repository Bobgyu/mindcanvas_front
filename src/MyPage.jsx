import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Chatbot from './Chatbot.jsx'

function MyPage() {
  const [count, setCount] = useState(0)
  const [userInfo, setUserInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

  const navigate = useNavigate()

  const openChatbot = () => {
    setIsChatbotOpen(true)
  }

  const closeChatbot = () => {
    setIsChatbotOpen(false)
  }

  // 사용자 정보 조회
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await axios.get('http://localhost:5000/api/user-info', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.data.success) {
            setUserInfo(response.data.user);
          }
        }
      } catch (err) {
        console.log('사용자 정보 조회 실패:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleCoordinator = () => {
    navigate('coordinator')   // 상대경로 → /mypage/coordinator 로 이동
  }

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        // 서버에 로그아웃 요청
        await axios.post('http://localhost:5000/api/logout', {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (err) {
      console.log('로그아웃 요청 실패:', err);
    } finally {
      // 로컬 스토리지에서 모든 인증 정보 제거
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      localStorage.removeItem('rememberedEmail');
      
      // 로그인 페이지로 리다이렉트
      navigate('/login');
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>로딩 중...</div>
      </div>
    );
  }

  return (
    <>
    {/* 상단 로고 이미지 */}
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      paddingTop: '10px',
      marginBottom: '0'
    }}>
      <img 
        src="/src/imgdata/icon/imgtext.png" 
        alt="MINDCANVAS" 
        style={{ 
          width: '200px', 
          height: 'auto',
          display: 'block'
        }} 
      />
    </div>
    
    <div className='upper-options' style={{ marginTop: '0', paddingTop: '0', height: '80%' }}>
      {/* 관리자 배지 - 작게 */}
      {userInfo && userInfo.is_admin && (
        <div style={{
          backgroundColor: '#ff6b6b',
          color: 'white',
          padding: '4px 8px',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '12px',
          borderRadius: '10px',
          margin: '0 auto 10px auto',
          width: 'fit-content',
          display: 'inline-block'
        }}>
          관리자
        </div>
      )}
      
      <input type="button" className='upper-option' value="내 그림(작품) 보기 (+분석결과)" onClick={() => navigate('/mypage/gallery')} />
      <input type="button" className='upper-option' value="마음일기 보기" onClick={() => navigate('/diary/list')} />
      <input type="button" className='upper-option' value="마음코디네이터" onClick={handleCoordinator}/>
      <input type="button" className='upper-option' value="로그아웃" onClick={handleLogout} style={{backgroundColor: 'rgb(39, 192, 141)', color: 'white'}} />
    </div>
    {/* 네비게이션 바 외부 컨테이너 */}
    <div style={{
      backgroundColor: 'rgb(39, 192, 141)',
      borderRadius: '50px',
      margin: '20px auto',
      width: '80%',
      height: '70px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* 내부 버튼 컨테이너 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        padding: '0px 20px',
        height: '100%'
      }}>
        <button className='lower-option' onClick={() => navigate('/mainpage')} style={{
          backgroundColor: '#CEF4E7',
          border: 'none',
          borderRadius: '50%',
          padding: '4px 0px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '50px',
          height: '50px'
        }}>
          <img src="/src/imgdata/icon/PAINT BRUSH.png" alt="그리기" style={{ width: '32px', height: '32px' }} />
        </button>
        <button className='lower-option' onClick={() => navigate('/chat-list', { state: { fromMyPageChat: true } })} style={{
          backgroundColor: '#CEF4E7',
          border: 'none',
          borderRadius: '50%',
          padding: '4px 0px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '50px',
          height: '50px'
        }}>
          <img src="/src/imgdata/icon/chat.png" alt="채팅" style={{ width: '32px', height: '32px' }} />
        </button>
        <button className='lower-option' onClick={openChatbot} style={{
          backgroundColor: '#CEF4E7',
          border: 'none',
          borderRadius: '50%',
          padding: '4px 0px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '50px',
          height: '50px'
        }}>
          <img src="/src/imgdata/icon/chatbot.png" alt="챗봇" style={{ width: '36px', height: '36px' }} />
        </button>
        <button className='lower-option' style={{
          backgroundColor: '#CEF4E7',
          border: 'none',
          borderRadius: '50%',
          padding: '4px 0px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '50px',
          height: '50px'
        }}>
          <img src="/src/imgdata/icon/user.png" alt="마이페이지" style={{ width: '32px', height: '32px' }} />
        </button>
      </div>
    </div>
    
    {/* 챗봇 모달 */}
    <Chatbot isOpen={isChatbotOpen} onClose={closeChatbot} />
    </>
  )
}

export default MyPage
