import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Notice() {
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
      <div>
        <h3>공지사항</h3>
      </div>
    </>
  )
}

export default Notice
