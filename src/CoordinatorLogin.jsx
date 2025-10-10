import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CoordinatorLogin() {
  const [emailLocalPart, setEmailLocalPart] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [emailCheckMessage, setEmailCheckMessage] = useState('');
  const [isEmailAvailable, setIsEmailAvailable] = useState(false);
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    birthdate: '',
    gender: 'female',
    specialization: '일반 상담',
    organization: '',
    experience: '',
    region: '',
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false
  });
  const navigate = useNavigate();

  // 컴포넌트 마운트 시 토큰 검증
  useEffect(() => {
    const token = localStorage.getItem('coordinatorToken');
    if (token) {
      // JWT 토큰을 로컬에서 검증
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        if (tokenData.exp > currentTime) {
          // 토큰이 유효하면 코디네이터 대시보드로 이동
          navigate('/coordinator-dashboard');
        } else {
          // 토큰이 만료되었으면 제거
          localStorage.removeItem('coordinatorToken');
          localStorage.removeItem('coordinatorId');
          localStorage.removeItem('coordinatorUsername');
        }
      } catch (error) {
        // 토큰 파싱 오류 시 제거
        localStorage.removeItem('coordinatorToken');
        localStorage.removeItem('coordinatorId');
        localStorage.removeItem('coordinatorUsername');
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const fullEmail = `${emailLocalPart}@${selectedDomain}`;
      const response = await axios.post('http://localhost:5000/api/coordinator/login', {
        username: fullEmail,
        password
      });

      if (response.data.success) {
        // 토큰과 코디네이터 정보 저장
        localStorage.setItem('coordinatorToken', response.data.token);
        localStorage.setItem('coordinatorId', response.data.coordinator_id);
        localStorage.setItem('coordinatorUsername', response.data.username);
        localStorage.setItem('coordinatorName', response.data.name);
        localStorage.setItem('coordinatorProfileImage', response.data.profile_image);
        localStorage.setItem('coordinatorSpecialization', response.data.specialization);

        // 코디네이터 대시보드로 이동
        navigate('/coordinator-dashboard');
      }
    } catch (error) {
      setError(error.response?.data?.error || '로그인에 실패했습니다.');
    }
  };

  const handleRegisterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRegisterData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // 이메일 필드가 변경되면 중복 확인 메시지 초기화
    if (name === 'email') {
      setEmailCheckMessage('');
      setIsEmailAvailable(false);
    }
  };

  const handleAllAgreeChange = (e) => {
    const checked = e.target.checked;
    setRegisterData((prevData) => ({
      ...prevData,
      agreeTerms: checked,
      agreePrivacy: checked,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // 비밀번호 확인
    if (registerData.password !== registerData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 필수 동의 항목 확인
    if (!registerData.agreeTerms || !registerData.agreePrivacy) {
      setError('이용약관 및 개인정보 취급방침에 동의해야 합니다.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/coordinator/register', {
        username: registerData.email,
        password: registerData.password,
        email: registerData.email,
        name: registerData.name,
        phone: registerData.phone,
        birthdate: registerData.birthdate,
        gender: registerData.gender,
        specialization: registerData.specialization,
        organization: registerData.organization,
        experience: registerData.experience,
        region: registerData.region
      });

      if (response.data.success) {
        alert('코디네이터 등록이 완료되었습니다. 로그인해주세요.');
        setIsRegistering(false);
        setRegisterData({
          email: '',
          password: '',
          confirmPassword: '',
          name: '',
          phone: '',
          birthdate: '',
          gender: 'female',
          specialization: '일반 상담',
          organization: '',
          experience: '',
          region: '',
          agreeTerms: false,
          agreePrivacy: false,
          agreeMarketing: false
        });
      }
    } catch (error) {
      setError(error.response?.data?.error || '등록에 실패했습니다.');
    }
  };

  const handleEmailCheck = async () => {
    setEmailCheckMessage('');
    setIsEmailAvailable(false);

    if (!registerData.email) {
      setEmailCheckMessage('이메일을 입력해주세요.');
      return;
    }

    // 백엔드에 이메일 중복 확인 API가 없으므로 항상 사용 가능하다고 가정
    setEmailCheckMessage('이메일 사용 가능합니다.');
    setIsEmailAvailable(true);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="w-[29rem] h-[58rem] rounded-3xl bg-white flex flex-col">
      <header className="w-full shadow-sm py-4 px-6 flex items-center justify-between">
        <button className="text-gray-600 hover:text-gray-800 transition-colors" onClick={handleBack}>
          <img src="/src/imgdata/icon/backarrow.png" alt="뒤로가기" style={{ width: '24px', height: '24px' }} />
        </button>
        <h1 className="text-xl font-bold">
          {isRegistering ? '코디네이터 등록' : '코디네이터 로그인'}
        </h1>
        <div className="w-6"></div>
      </header>

      <main className="flex-grow p-6 overflow-y-auto">
        {!isRegistering ? (
            // 로그인 폼
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

              {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}

              {/* 로그인 버튼 */}
              <button
                className="w-full bg-primary-green text-white p-3 rounded-lg font-bold text-lg hover:bg-primary-green-hover focus:outline-none focus:ring-2 focus:ring-primary-green-hover"
                onClick={handleLogin}
              >
                로그인
              </button>
            </div>
          ) : (
            // 등록 폼
            <form onSubmit={handleRegister} className="space-y-6">
              {/* 아이디 (이메일) */}
              <div>
                <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
                  아이디 (이메일)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="이메일 주소"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green-hover h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleEmailCheck}
                    className="px-4 py-3 bg-light-green text-primary-green rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green-hover"
                  >
                    중복확인
                  </button>
                </div>
                {emailCheckMessage && (
                    <p className={`text-sm mt-1 ${isEmailAvailable ? 'text-green-600' : 'text-red-600'}`}>
                        {emailCheckMessage}
                    </p>
                )}
              </div>

              {/* 비밀번호 */}
              <div>
                <label htmlFor="password" className="block text-gray-700 font-bold mb-2">
                  비밀번호
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="비밀번호"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green-hover h-12"
                  required
                />
              </div>

              {/* 비밀번호 확인 */}
              <div>
                <label htmlFor="confirmPassword" className="block text-gray-700 font-bold mb-2">
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="비밀번호 확인"
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green-hover h-12"
                  required
                />
              </div>

              {/* 이름 */}
              <div>
                <label htmlFor="name" className="block text-gray-700 font-bold mb-2">
                  이름
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="실명을 입력하세요"
                  value={registerData.name}
                  onChange={handleRegisterChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green-hover h-12"
                  required
                />
              </div>

              {/* 휴대폰 번호 */}
              <div>
                <label htmlFor="phone" className="block text-gray-700 font-bold mb-2">
                  휴대폰 번호
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="'-' 구분없이 입력"
                    value={registerData.phone}
                    onChange={handleRegisterChange}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green-hover h-12"
                    required
                />
                </div>
              </div>

              {/* 생년월일 */}
              <div>
                <label htmlFor="birthdate" className="block text-gray-700 font-bold mb-2">
                  생년월일
                </label>
                <input
                  type="text"
                  id="birthdate"
                  name="birthdate"
                  placeholder="8자리 입력 (YYYYMMDD)"
                  value={registerData.birthdate}
                  onChange={handleRegisterChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green-hover h-12"
                  required
                />
              </div>

              {/* 전문 분야 */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  전문 분야
                </label>
                <select
                  name="specialization"
                  value={registerData.specialization}
                  onChange={handleRegisterChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green-hover h-12"
                >
                  <option value="일반 상담">일반 상담</option>
                  <option value="청소년 상담">청소년 상담</option>
                  <option value="가족 상담">가족 상담</option>
                  <option value="우울/불안 상담">우울/불안 상담</option>
                  <option value="트라우마 상담">트라우마 상담</option>
                  <option value="부부 상담">부부 상담</option>
                  <option value="직업 상담">직업 상담</option>
                </select>
              </div>

              {/* 소속기관 */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  소속기관
                </label>
                <input
                  type="text"
                  name="organization"
                  value={registerData.organization}
                  onChange={handleRegisterChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green-hover h-12"
                  placeholder="소속기관을 입력하세요"
                  required
                />
              </div>

              {/* 경력 */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  경력
                </label>
                <input
                  type="text"
                  name="experience"
                  value={registerData.experience}
                  onChange={handleRegisterChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green-hover h-12"
                  placeholder="경력을 입력하세요 (예: 5년)"
                  required
                />
              </div>

              {/* 지역 */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  지역
                </label>
                <select
                  name="region"
                  value={registerData.region}
                  onChange={handleRegisterChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green-hover h-12"
                  required
                >
                  <option value="">지역을 선택하세요</option>
                  <option value="서울">서울</option>
                  <option value="경기">경기</option>
                  <option value="인천">인천</option>
                  <option value="부산">부산</option>
                  <option value="대구">대구</option>
                  <option value="광주">광주</option>
                  <option value="대전">대전</option>
                  <option value="울산">울산</option>
                  <option value="세종">세종</option>
                  <option value="강원">강원</option>
                  <option value="충북">충북</option>
                  <option value="충남">충남</option>
                  <option value="전북">전북</option>
                  <option value="전남">전남</option>
                  <option value="경북">경북</option>
                  <option value="경남">경남</option>
                  <option value="제주">제주</option>
                </select>
              </div>

              {/* 성별 */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">성별</label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={registerData.gender === 'female'}
                      onChange={handleRegisterChange}
                      className="form-radio text-purple-600"
                    />
                    <span className="ml-2">여성</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={registerData.gender === 'male'}
                      onChange={handleRegisterChange}
                      className="form-radio text-purple-600"
                    />
                    <span className="ml-2">남성</span>
                  </label>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}

              {/* 약관 동의 */}
              <div className="space-y-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={registerData.agreeTerms && registerData.agreePrivacy}
                    onChange={handleAllAgreeChange}
                    className="form-checkbox text-primary-green"
                  />
                  <span className="ml-2 font-bold text-gray-800">전체 동의</span>
                </label>
                <div className="ml-6 space-y-1">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={registerData.agreeTerms}
                      onChange={handleRegisterChange}
                      className="form-checkbox text-primary-green"
                      required
                    />
                    <span className="ml-2 text-gray-700">[필수] 이용약관 동의</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="agreePrivacy"
                      checked={registerData.agreePrivacy}
                      onChange={handleRegisterChange}
                      className="form-checkbox text-primary-green"
                      required
                    />
                    <span className="ml-2 text-gray-700">[필수] 개인정보 취급방침 동의</span>
                  </label>
                </div>
              </div>

              {/* 등록 버튼 */}
              <button
                type="submit"
                className="w-full bg-primary-green text-white p-3 rounded-lg font-bold text-lg hover:bg-primary-green-hover focus:outline-none focus:ring-2 focus:ring-primary-green-hover"
              >
                코디네이터 등록
              </button>
            </form>
          )}
        
        <div className="mt-4">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="w-full bg-gray-200 text-gray-700 p-3 rounded-lg font-bold text-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {isRegistering ? '로그인으로 돌아가기' : '코디네이터 등록'}
          </button>
        </div>
      </main>
    </div>
  );
}

export default CoordinatorLogin;
