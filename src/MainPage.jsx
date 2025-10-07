import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Chatbot from './Chatbot.jsx'
import axios from 'axios'

function MainPage() {
  const [count, setCount] = useState(0)
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

  const navigate = useNavigate()

  // 컴포넌트 마운트 시 토큰 검증 (한 번만 실행)
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      // 토큰이 없으면 로그인 페이지로 리다이렉트
      navigate('/login');
      return;
    }

    // 토큰이 있으면 바로 통과 (서버 검증 생략)
    // JWT 토큰은 클라이언트에서 만료 시간을 체크하여 로컬에서 검증
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      if (tokenData.exp < currentTime) {
        // 토큰이 만료되었으면 로그인 페이지로
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        navigate('/login');
        return;
      }
    } catch (error) {
      // 토큰 파싱 오류 시 로그인 페이지로
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      navigate('/login');
      return;
    }
  }, [navigate]);

  const verifyToken = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post('http://localhost:5000/api/verify-token', {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status !== 200) {
        // 토큰이 유효하지 않으면 로그인 페이지로 리다이렉트
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        navigate('/login');
      }
    } catch (err) {
      // 토큰 검증 실패 시 로그인 페이지로 리다이렉트
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      navigate('/login');
    }
  };

  const gotoMypage = () => {
    navigate('/mypage')   // 상대경로 → /mypage 로 이동
  }

  const gotoHome = () => {
    navigate('/draw/home')   // 집 그리기 페이지로 이동
  }

  const gotoTree = () => {
    navigate('/draw/tree')   // 나무 그리기 페이지로 이동
  }

  const gotoPerson = () => {
    navigate('/draw/person')   // 사람 그리기 페이지로 이동
  }

  const gotoEmotionDiary = () => {
    navigate('/diary/emotion')   // 감정 일기 페이지로 이동
  }

  const gotoColorfill = () => {
    navigate('/draw/colorfill')   // 색칠하기 페이지로 이동
  }

  const openChatbot = () => {
    setIsChatbotOpen(true)
  }

  const closeChatbot = () => {
    setIsChatbotOpen(false)
  }

  return (
    <>
    <div className='options'>
      <div className='picture-options'>
        <h2>그림심리테스트</h2>
        <button className='option' onClick={gotoHome}>
          <img src="/src/imgdata/icon/home.png" alt="집" style={{ width: '48px', height: '48px', marginRight: '20px' }} />
          집
        </button>
        <button className='option' onClick={gotoTree}>
          <img src="/src/imgdata/icon/tree.png" alt="나무" style={{ width: '48px', height: '48px', marginRight: '20px' }} />
          나무
        </button>
        <button className='option' onClick={gotoPerson}>
          <img src="/src/imgdata/icon/person.png" alt="사람" style={{ width: '48px', height: '48px', marginRight: '20px' }} />
          사람
        </button>
      </div>

      <div className='draw-options'>
        <h2>그리기</h2>
        <input type="button" className='option' value="마음일기" onClick={gotoEmotionDiary} />
        <input type="button" className='option' value="색칠하기" onClick={gotoColorfill} />
        <input type="button" className='option' value="자유롭게" />
      </div>
    </div>
    <div className='lower-options'>
      <input type="button" className='lower-option' value="그리기" />
      <input type="button" className='lower-option' value="분석" />
      <input type="button" className='lower-option' value="채팅" />
      <input type="button" className='lower-option' value="챗봇" onClick={openChatbot} />
      <input type="button" className='lower-option' value="마이페이지" onClick={gotoMypage}/>
    </div>
    
    {/* 챗봇 모달 */}
    <Chatbot isOpen={isChatbotOpen} onClose={closeChatbot} />
    </>
  )
}

export default MainPage