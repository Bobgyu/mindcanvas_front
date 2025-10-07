import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function MyPage() {
  const [count, setCount] = useState(0)

  const navigate = useNavigate()

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

  return (
    <>
    <div className='upper-options'>
      <input type="button" className='upper-option' value="내 그림(작품) 보기 (+분석결과)" onClick={() => navigate('/mypage/gallery')} />
      <input type="button" className='upper-option' value="마음일기 보기" onClick={() => navigate('/diary/list')} />
      <input type="button" className='upper-option' value="마음코디네이터" onClick={handleCoordinator}/>
      <input type="button" className='upper-option' value="정보변경" />
      <input type="button" className='upper-option' value="공지사항" />
      <input type="button" className='upper-option' value="로그아웃" onClick={handleLogout} style={{backgroundColor: 'rgb(39, 192, 141)', color: 'white'}} />
    </div>
    <div className='lower-options'>
      <input type="button" className='lower-option' value="그리기" onClick={() => navigate('/mainpage')} />
      <input type="button" className='lower-option' value="분석" />
      <input type="button" className='lower-option' value="채팅" />
      <input type="button" className='lower-option' value="챗봇" />
      <input type="button" className='lower-option' value="마이페이지" />
    </div>
    </>
  )
}

export default MyPage
