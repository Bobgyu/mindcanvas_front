import { useState } from 'react'
import { useNavigate } from 'react-router-dom' // ✅ 추가

function Login() {
  const [count, setCount] = useState(0)

  const [id, setId] = useState('')
  const [pw, setPw] = useState('')

  const navigate = useNavigate() // ✅ 라우터 이동 함수

  const handleLogin = () => {
    // 로그인 검증 로직을 여기에 추가 가능 (예: id/pw 체크)
    // 일단 바로 mainpage로 이동
    navigate('/mainpage')
  }

  return (
    <>
    <div className='login-area1'>
        <input
          type="text"
          className='textarea'
          placeholder="아이디"          // placeholder로 변경
          value={id}                  // 입력값 상태 연결
          onChange={(e) => setId(e.target.value)} // 입력 시 상태 업데이트
        />
        <input
          type="password"             // 비밀번호는 password 타입
          className='textarea'
          placeholder="비밀번호"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
        <p 
          className='login' 
          onClick={handleLogin}   // ✅ 클릭 시 이동
          style={{ cursor: 'pointer' }} // 클릭 가능한 표시
        >
          로그인
        </p>
    </div>
    </>
  )
}

export default Login
