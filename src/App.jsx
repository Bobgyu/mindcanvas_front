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

  const handleCoordinatorLogin = () => {
    navigate('/coordinator-login')
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
        <input 
          type="button" 
          className='coordinator-login-button' 
          value="마음코디네이터 로그인" 
          onClick={handleCoordinatorLogin}
          style={{
            width: '70%',
            height: '80px',
            borderRadius: '16px',
            border: 'none',
            backgroundColor: '#3B82F6',
            color: 'white',
            fontSize: '20px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: '16px'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#2563EB';
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#3B82F6';
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = 'none';
          }}
          onMouseDown={(e) => {
            e.target.style.transform = 'scale(0.95)';
          }}
          onMouseUp={(e) => {
            e.target.style.transform = 'scale(1.05)';
          }}
        />
        <input type="button" className='login-button' value="사용자 로그인" onClick={handleLogin}/>
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
