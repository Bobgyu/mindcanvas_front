import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Coordinator() {
  const [count, setCount] = useState(0)
  const navigate = useNavigate()

  const handleBack = () => {
    navigate('/mypage')  // 절대 경로로 /mypage 이동
  }

  return (
    <>
      <div className='goback'>
        <p onClick={handleBack} style={{ cursor: 'pointer' }}>뒤로가기</p>
      </div>
      <div className='profile-area'>
        <div className='coordi-profile'>
          {/* 프로필 사진 */}
          <div className='profile-picture'>
            <div className='imsi-picture'></div>
          </div>
          {/* 코디네이터 이름 */}
          <div className='coordi-introduce'>
            <p>마음코디네이터</p>
            <h2>OOO님</h2>
          </div>
        </div>
      </div>
      <div className='info-area'>
        <h3>기본정보</h3>
        <div className='info'>
          <p>아직 정보가 없습니다.</p>
        </div>
      </div>
      <div className='evaluate-coordi'>
        <input type="button" className='evaluate-button' value="평가의견남기기" />
      </div>
      <div className='coordi-options'>
        <p>채팅하기</p>
        <p>연결끊기</p>
        <p>다른 마음코디네이터</p>
      </div>
    </>
  )
}

export default Coordinator
