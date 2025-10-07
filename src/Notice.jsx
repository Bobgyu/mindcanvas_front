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
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: 100
      }}>
        <p onClick={handleBack} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <img src="/src/imgdata/icon/backarrow.png" alt="뒤로가기" style={{ width: '20px', height: '20px' }} />
        </p>
      </div>
      <div>
        <h3>공지사항</h3>
      </div>
    </>
  )
}

export default Notice
