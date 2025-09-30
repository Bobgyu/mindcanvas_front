import React, { useState } from 'react';
import axios from 'axios'; // axios 임포트
import { useNavigate } from 'react-router-dom'; // 라우터 이동을 위해 임포트

function Join() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    verificationCode: '', // 현재 백엔드에서 사용하지 않지만, 폼에는 유지
    birthdate: '',
    gender: 'female',
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false,
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // 라우터 이동 함수
  const [emailCheckMessage, setEmailCheckMessage] = useState('');
  const [isEmailAvailable, setIsEmailAvailable] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
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
    setFormData((prevData) => ({
      ...prevData,
      agreeTerms: checked,
      agreePrivacy: checked,
      agreeMarketing: checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // 오류 메시지 초기화

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 이메일 중복 확인 완료 여부
    // 백엔드에 이메일 중복 확인 API가 없으므로 이 로직은 주석 처리합니다.
    // if (!isEmailAvailable) {
    //   setError('이메일 중복 확인을 완료해야 합니다.');
    //   return;
    // }

    // 필수 동의 항목 확인 (이용약관, 개인정보 취급방침) - 임시로 주석 처리
    /*
    if (!formData.agreeTerms || !formData.agreePrivacy) {
        setError('이용약관 및 개인정보 취급방침에 동의해야 합니다.');
        return;
    }
    */

    try {
      const response = await axios.post('http://localhost:5000/api/register', {
        username: formData.email, // 백엔드는 'username'을 기대합니다.
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        birthdate: formData.birthdate,
        gender: formData.gender,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        alert(response.data.message);
        navigate('/login'); // 회원가입 성공 후 로그인 페이지로 이동
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('회원가입 중 오류가 발생했습니다.');
      }
    }
  };

  const handleEmailCheck = async () => {
    setEmailCheckMessage(''); // 메시지 초기화
    setIsEmailAvailable(false); // 가용성 상태 초기화

    if (!formData.email) {
      setEmailCheckMessage('이메일을 입력해주세요.');
      return;
    }

    // 백엔드에 이메일 중복 확인 API가 없으므로 항상 사용 가능하다고 가정합니다.
    // 실제 환경에서는 백엔드에 `/api/check-email`과 같은 엔드포인트를 구현해야 합니다.
    setEmailCheckMessage('이메일 사용 가능합니다.');
    setIsEmailAvailable(true);

    /*
    try {
      const response = await axios.post('http://localhost:5000/api/check-email', {
        email: formData.email,
      });

      if (response.data.available) {
        setEmailCheckMessage(response.data.message);
        setIsEmailAvailable(true);
      } else {
        setEmailCheckMessage(response.data.message);
        setIsEmailAvailable(false);
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setEmailCheckMessage(err.response.data.error);
      } else {
        setEmailCheckMessage('이메일 중복 확인 중 오류가 발생했습니다.');
      }
      setIsEmailAvailable(false);
    }
    */
  };

  return (
    <div className="w-[29rem] h-[58rem] rounded-3xl bg-white flex flex-col">
      <header className="w-full shadow-sm py-4 px-6 flex items-center justify-between">
        <button className="text-gray-600" onClick={() => navigate(-1)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <h1 className="text-xl font-bold">회원가입</h1>
        <div className="w-6"></div> {/* Placeholder for alignment */}
      </header>

      <main className="flex-grow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
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
                value={formData.email}
                onChange={handleChange}
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
              value={formData.password}
              onChange={handleChange}
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
              value={formData.confirmPassword}
              onChange={handleChange}
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
              value={formData.name}
              onChange={handleChange}
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
                value={formData.phone}
                onChange={handleChange}
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
              value={formData.birthdate}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green-hover h-12"
              required
            />
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
                  checked={formData.gender === 'female'}
                  onChange={handleChange}
                  className="form-radio text-purple-600"
                />
                <span className="ml-2">여성</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleChange}
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
                checked={formData.agreeTerms && formData.agreePrivacy && formData.agreeMarketing}
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
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="form-checkbox text-primary-green"
                  required
                />
                <span className="ml-2 text-gray-700">[필수] 이용약관 동의</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="agreePrivacy"
                  checked={formData.agreePrivacy}
                  onChange={handleChange}
                  className="form-checkbox text-primary-green"
                  required
                />
                <span className="ml-2 text-gray-700">[필수] 개인정보 취급방침 동의</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="agreeMarketing"
                  checked={formData.agreeMarketing}
                  onChange={handleChange}
                  className="form-checkbox text-primary-green"
                />
                <span className="ml-2 text-gray-700">[선택] 마케팅 정보 수신 동의</span>
              </label>
            </div>
          </div>
          
          {/* 회원가입 버튼 */}
          <button
            type="submit"
            className="w-full bg-primary-green text-white p-3 rounded-lg font-bold text-lg hover:bg-primary-green-hover focus:outline-none focus:ring-2 focus:ring-primary-green-hover"
          >
            회원가입
          </button>
        </form>
      </main>
    </div>
  );
}

export default Join;