import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ 추가
import axios from 'axios'; // axios 임포트

function Login() {
  const [emailLocalPart, setEmailLocalPart] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('gmail.com'); // 기본값 설정
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [modal, setModal] = useState({ show: false, message: '', type: '', onConfirm: null });
  const navigate = useNavigate(); // ✅ 라우터 이동 함수

  // 컴포넌트 마운트 시 로그인 상태 확인
  useEffect(() => {
    const storedEmail = localStorage.getItem('rememberedEmail');
    if (storedEmail) {
      const [localPart, domainPart] = storedEmail.split('@');
      setEmailLocalPart(localPart || '');
      setSelectedDomain(domainPart || 'gmail.com');
      setRememberMe(true);
    }
    
    // 토큰이 있는지 확인하고 자동 로그인 처리 (로컬 검증)
    const token = localStorage.getItem('authToken');
    if (token) {
      // JWT 토큰을 로컬에서 검증 (서버 호출 없이)
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        if (tokenData.exp > currentTime) {
          // 토큰이 유효하면 바로 메인 페이지로 이동
          navigate('/mainpage');
        } else {
          // 토큰이 만료되었으면 제거
          localStorage.removeItem('authToken');
          localStorage.removeItem('userId');
          localStorage.removeItem('username');
        }
      } catch (error) {
        // 토큰 파싱 오류 시 제거
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
      }
    }
  }, []);

  // 토큰 검증 및 자동 로그인
  const verifyTokenAndLogin = async (token) => {
    try {
      const response = await axios.post('http://localhost:5000/api/verify-token', {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        // 토큰이 유효하면 자동으로 메인 페이지로 이동
        navigate('/mainpage');
      }
    } catch (err) {
      // 토큰이 유효하지 않으면 로컬 스토리지에서 제거
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
    }
  };

  const handleLogin = async () => {
    setError(''); // 오류 메시지 초기화
    const fullEmail = `${emailLocalPart}@${selectedDomain}`;
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        username: fullEmail, // 백엔드는 'username'을 기대합니다.
        password: password,
        remember: rememberMe,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        // 로그인 성공 시 처리
        setModal({ 
          show: true, 
          message: response.data.message, 
          type: 'success',
          onConfirm: () => {
            // JWT 토큰과 사용자 정보를 로컬 스토리지에 저장
            localStorage.setItem('authToken', response.data.token);
            localStorage.setItem('userId', response.data.user_id);
            localStorage.setItem('username', response.data.username);
            
            // 로그인 유지 옵션에 따라 이메일 저장
            if (rememberMe) {
              localStorage.setItem('rememberedEmail', fullEmail);
            } else {
              localStorage.removeItem('rememberedEmail');
            }
            
            navigate('/mainpage'); // 로그인 성공 후 메인 페이지로 이동
          }
        });
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('로그인 중 오류가 발생했습니다.');
      }
    }
  };

  const handleJoin = () => {
    navigate('/join');
  };

  const handleBack = () => {
    navigate('/');
  };

  const closeModal = () => {
    setModal({ show: false, message: '', type: '', onConfirm: null });
  };


  return (
    <div className="w-[29rem] h-[58rem] rounded-3xl bg-white flex flex-col">
      {/* 모달 오버레이 */}
      {modal.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '30px',
            margin: '20px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            textAlign: 'center'
          }}>
            {/* 모달 아이콘 */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              {modal.type === 'success' && (
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#d4edda',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{ width: '30px', height: '30px', color: '#28a745' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {modal.type === 'error' && (
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#f8d7da',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{ width: '30px', height: '30px', color: '#dc3545' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* 모달 메시지 */}
            <p style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '25px',
              lineHeight: '1.5',
              whiteSpace: 'pre-line'
            }}>
              {modal.message}
            </p>
            
            {/* 버튼 */}
            <button
              onClick={() => {
                if (modal.onConfirm) {
                  modal.onConfirm();
                }
                closeModal();
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: modal.type === 'success' ? 'rgb(39, 192, 141)' : '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = '0.9';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = '1';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              확인
            </button>
          </div>
        </div>
      )}

      <header className="w-full shadow-sm py-4 px-6 flex items-center justify-between">
        <button className="text-gray-600 hover:text-gray-800 transition-colors" onClick={handleBack}>
          <img src="/src/imgdata/icon/backarrow.png" alt="뒤로가기" style={{ width: '24px', height: '24px' }} />
        </button>
        <h1 className="text-xl font-bold">로그인</h1>
        <div className="w-6"></div>
      </header>

      <main className="flex-grow p-6">
        {/* 기존 로그인 폼 요소들이 여기에 배치됩니다 */}
        <div className="space-y-6">
          {/* 이메일 입력 그룹 */}
          <div>
            <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
              아이디 (이메일)
            </label>
            <div className="flex items-center mb-4">
              <input
                type="text"
                id="email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green-hover flex-grow h-12"
                placeholder="이메일 아이디"
                value={emailLocalPart}
                onChange={(e) => setEmailLocalPart(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                style={{ marginRight: '8px' }}
              />
              <span>@</span>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green-hover ml-2 h-12"
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
              >
                <option value="gmail.com">gmail.com</option>
                <option value="naver.com">naver.com</option>
                <option value="daum.net">daum.net</option>
                <option value="hanmail.net">hanmail.net</option>
                <option value="yahoo.com">yahoo.com</option>
                <option value="직접입력">직접입력</option>
              </select>
              {selectedDomain === '직접입력' && (
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green-hover ml-2 h-12"
                  placeholder="도메인 직접 입력"
                  value={selectedDomain === '직접입력' ? '' : selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              )}
            </div>
          </div>

          {/* 비밀번호 */}
          <div>
            <label htmlFor="password" className="block text-gray-700 font-bold mb-2">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green-hover h-12"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          {/* 로그인 유지 */}
          <div className='flex items-center mt-2'>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="rememberMe" className="text-gray-700 text-sm">로그인 유지</label>
          </div>

          {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}

          {/* 로그인 버튼 */}
          <button
            className="w-full bg-primary-green text-white p-3 rounded-lg font-bold text-lg hover:bg-primary-green-hover focus:outline-none focus:ring-2 focus:ring-primary-green-hover"
            onClick={handleLogin}
          >
            로그인
          </button>

          {/* 회원가입 버튼 */}
          <button
            className="w-full bg-gray-200 text-gray-700 p-3 rounded-lg font-bold text-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            onClick={handleJoin}
          >
            회원가입
          </button>
        </div>
      </main>
    </div>
  );
}

export default Login;
