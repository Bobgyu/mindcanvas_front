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
      <div className='logo-area'></div>
      <div className='login-area'>
        <input type="button" className='login-button' value="로그인" onClick={handleLogin}/>
        <input type="button" className='login-button' value="구글 로그인"/>
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
