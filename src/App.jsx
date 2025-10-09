import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function App() {
  const [count, setCount] = useState(0)

  const navigate = useNavigate()

  const handleLogin = () => {
    navigate('/login')  // 클릭하면 /login 페이지로 이동
  }

  const handleJoin = () => {
    navigate('/join')
  }

  return (
    <>
      <div className='logo-area' style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '80px 0 40px 0'
      }}>
        <img 
          src="/src/imgdata/icon/logo.png" 
          alt="MINDCANVAS" 
          style={{ 
            width: '400px', 
            height: 'auto',
            display: 'block'
          }} 
        />
      </div>
      <div className='login-area' style={{ marginTop: '60px' }}>
        <input type="button" className='login-button' value="로그인" onClick={handleLogin}/>
        <p 
          className='join'
          onClick={handleJoin}   // ✅ 클릭 시 이동
          style={{ cursor: 'pointer' }} // 클릭 가능한 표시
        >
          회원가입
        </p>
      </div>
    </>
  )
}

export default App
