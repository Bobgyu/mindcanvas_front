import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function MyPage() {
  const [count, setCount] = useState(0)

  const navigate = useNavigate()

  const handleCoordinator = () => {
    navigate('coordinator')   // 상대경로 → /mypage/coordinator 로 이동
  }

  return (
    <>
    <div className='upper-options'>
      <input type="button" className='upper-option' value="내 그림(작품) 보기 (+분석결과)" onClick={() => navigate('/mypage/gallery')}/>
      <input type="button" className='upper-option' value="마음일기 보기" />
      <input type="button" className='upper-option' value="마음코디네이터" onClick={handleCoordinator}/>
      <input type="button" className='upper-option' value="정보변경" />
      <input type="button" className='upper-option' value="공지사항" />
    </div>
    <div className='lower-options'>
      <input type="button" className='lower-option' value="그리기" onClick={() => navigate('/mainpage')}/>
      <input type="button" className='lower-option' value="분석" />
      <input type="button" className='lower-option' value="채팅" />
      <input type="button" className='lower-option' value="챗봇" />
      <input type="button" className='lower-option' value="마이페이지" />
    </div>
    </>
  )
}

export default MyPage
