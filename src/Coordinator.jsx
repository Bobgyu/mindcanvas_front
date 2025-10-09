import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'

function Coordinator() {
  const [count, setCount] = useState(0)
  const [coordinator, setCoordinator] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  
  // location.state에서 코디네이터 정보 가져오기 (우선순위)
  const stateCoordinator = location.state?.coordinator

  // 사용자의 지정된 코디네이터 정보 가져오기
  useEffect(() => {
    const fetchUserCoordinator = async () => {
      try {
        // location.state에 코디네이터 정보가 있으면 그것을 사용
        if (stateCoordinator) {
          setCoordinator(stateCoordinator)
          setIsLoading(false)
          return
        }

        // 그렇지 않으면 API에서 사용자의 지정된 코디네이터 정보 가져오기
        const token = localStorage.getItem('authToken')
        const response = await axios.get('http://localhost:5000/api/user/coordinator', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.data.success && response.data.coordinator) {
          setCoordinator(response.data.coordinator)
        } else {
          setCoordinator(null)
        }
      } catch (error) {
        console.error('코디네이터 정보 조회 실패:', error)
        setCoordinator(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserCoordinator()
  }, [stateCoordinator])

  const handleBack = () => {
    navigate('/mypage')  // 절대 경로로 /mypage 이동
  }

  const handleChat = () => {
    if (coordinator) {
      navigate('/chat', { state: { coordinator, fromCoordinator: true, fromMyPage: true } })
    } else {
      alert('코디네이터 정보가 없습니다.')
    }
  }

  const handleFindOther = () => {
    // 다른 마음코디네이터 찾기 페이지로 이동
    navigate('/coordinator')
  }

  const handleDisconnect = async () => {
    if (!coordinator) {
      alert('코디네이터 정보가 없습니다.')
      return
    }

    if (!window.confirm(`${coordinator.name} 코디네이터와의 연결을 끊으시겠습니까?\n\n연결을 끊어도 채팅 기록은 보존됩니다.`)) {
      return
    }

    try {
      const token = localStorage.getItem('authToken')
      const response = await axios.post('http://localhost:5000/api/user/coordinator/disconnect', {
        coordinator_id: coordinator.id
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.data.success) {
        alert(response.data.message)
        // 코디네이터 정보 초기화
        setCoordinator(null)
        // 페이지 새로고침하여 코디네이터 없음 상태로 변경
        window.location.reload()
      } else {
        alert('연결 끊기에 실패했습니다: ' + response.data.error)
      }
    } catch (error) {
      console.error('코디네이터 연결 끊기 오류:', error)
      if (error.response?.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.')
        localStorage.removeItem('authToken')
        localStorage.removeItem('userId')
        localStorage.removeItem('username')
        navigate('/login')
      } else {
        alert('연결 끊기 중 오류가 발생했습니다.')
      }
    }
  }

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div>코디네이터 정보를 불러오는 중...</div>
      </div>
    )
  }

  // 코디네이터가 없을 때
  if (!coordinator) {
    return (
      <div className="w-[29rem] h-[58rem] rounded-3xl flex flex-col" style={{backgroundColor: 'rgb(206, 244, 231)'}}>
        {/* 뒤로가기 버튼 */}
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

        {/* 헤더 */}
        <header className="w-full shadow-sm py-4 px-6 flex items-center justify-between">
          <div className="w-6"></div>
          <h1 className="text-xl font-bold">마음코디네이터</h1>
          <div className="w-6"></div>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="flex-grow p-6 flex items-center justify-center">
          <div className="text-center">
            <div>아직 지정된 마음코디네이터가 없습니다.</div>
            <button 
              onClick={handleFindOther}
              style={{
                padding: '10px 20px',
                backgroundColor: '#27C08D',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '20px'
              }}
            >
              마음코디네이터 찾기
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="w-[29rem] h-[58rem] rounded-3xl flex flex-col" style={{backgroundColor: 'rgb(206, 244, 231)'}}>
      {/* 뒤로가기 버튼 */}
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

      {/* 헤더 */}
      <header className="w-full shadow-sm py-4 px-6 flex items-center justify-between">
        <div className="w-6"></div>
        <h1 className="text-xl font-bold">마음코디네이터</h1>
        <div className="w-6"></div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-grow p-6">
      <div className='profile-area' style={{ 
        backgroundColor: 'white', 
        margin: '20px', 
        borderRadius: '16px', 
        padding: '16px',
        paddingBottom: '50px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        border: '1px solid #F3F4F6',
        minHeight: '100px',
        display: 'flex',
        alignItems: 'center',
        position: 'relative'
      }}>
        <div className='coordi-profile' style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          width: '100%',
          paddingleft: '15px'
        }}>
          {/* 프로필 사진 */}
          <div className='profile-picture' style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%',
            backgroundColor: '#CEF4E7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid rgb(39, 192, 141)',
            flexShrink: 0
          }}>
            <div className='imsi-picture' style={{ 
              width: '40px', 
              height: '40px',
              backgroundColor: 'rgb(39, 192, 141)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              {coordinator.name ? coordinator.name.charAt(0) : '?'}
            </div>
          </div>
          {/* 코디네이터 이름 */}
          <div className='coordi-introduce' style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <p style={{ 
              margin: '0',
              color: '#6B7280', 
              fontSize: '14px', 
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              마음코디네이터
            </p>
            <h2 style={{ 
              margin: '0',
              color: '#111827', 
              fontSize: '24px', 
              fontWeight: '700',
              lineHeight: '1.2'
            }}>
              {coordinator.name}님
            </h2>
            <div style={{ 
              width: '40px', 
              height: '3px', 
              backgroundColor: 'rgb(39, 192, 141)', 
              borderRadius: '2px',
              marginTop: '8px'
            }}></div>
          </div>
        </div>
        
        {/* 평가의견남기기 버튼 - 오른쪽 하단 */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px'
        }}>
          <input 
            type="button" 
            className='evaluate-button' 
            value="평가의견남기기" 
            style={{
              padding: '4px 8px',
              backgroundColor: '#CEF4E7',
              color: '#111827',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '9px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              minWidth: 'fit-content'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgb(39, 192, 141)'
              e.target.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#CEF4E7'
              e.target.style.color = '#111827'
            }}
          />
        </div>
      </div>
      <div className='info-area' style={{ 
        backgroundColor: 'white', 
        margin: '20px', 
        borderRadius: '16px', 
        padding: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        border: '1px solid #F3F4F6',
        height: '50%'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '20px',
          paddingBottom: '12px',
          borderBottom: '2px solid #CEF4E7'
        }}>
          <div style={{ 
            width: '4px', 
            height: '20px', 
            backgroundColor: 'rgb(39, 192, 141)', 
            borderRadius: '2px',
            marginRight: '12px'
          }}></div>
          <h3 style={{ 
            color: '#111827', 
            fontSize: '20px', 
            fontWeight: '700', 
            margin: '0'
          }}>
            기본정보
          </h3>
        </div>
        
        <div style={{ 
          maxHeight: '500px',
          overflowY: 'auto',
          paddingRight: '8px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <span style={{ 
                  color: '#6B7280', 
                  fontSize: '13px', 
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  이름
                </span>
                <p style={{ 
                  margin: '0', 
                  fontWeight: '600', 
                  color: '#111827',
                  fontSize: '16px',
                  wordBreak: 'break-word'
                }}>
                  {coordinator.name}
                </p>
              </div>
              
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <span style={{ 
                  color: '#6B7280', 
                  fontSize: '13px', 
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  나이
                </span>
                <p style={{ 
                  margin: '0', 
                  fontWeight: '600', 
                  color: '#111827',
                  fontSize: '16px',
                  wordBreak: 'break-word'
                }}>
                  {coordinator.age || '정보 없음'}
                </p>
              </div>
              
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <span style={{ 
                  color: '#6B7280', 
                  fontSize: '13px', 
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  지역
                </span>
                <p style={{ 
                  margin: '0', 
                  fontWeight: '600', 
                  color: '#111827',
                  fontSize: '16px',
                  wordBreak: 'break-word'
                }}>
                  {coordinator.region || '정보 없음'}
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <span style={{ 
                  color: '#6B7280', 
                  fontSize: '13px', 
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  경력
                </span>
                <p style={{ 
                  margin: '0', 
                  fontWeight: '600', 
                  color: '#111827',
                  fontSize: '16px',
                  wordBreak: 'break-word'
                }}>
                  {coordinator.experience || '정보 없음'}
                </p>
              </div>
              
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <span style={{ 
                  color: '#6B7280', 
                  fontSize: '13px', 
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  소속기관
                </span>
                <p style={{ 
                  margin: '0', 
                  fontWeight: '600', 
                  color: '#111827',
                  fontSize: '16px',
                  wordBreak: 'break-word'
                }}>
                  {coordinator.institution || '정보 없음'}
                </p>
              </div>
              
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <span style={{ 
                  color: '#6B7280', 
                  fontSize: '13px', 
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  전문분야
                </span>
                <p style={{ 
                  margin: '0', 
                  fontWeight: '600', 
                  color: '#111827',
                  fontSize: '16px',
                  wordBreak: 'break-word'
                }}>
                  심리상담, HTP 분석
                </p>
              </div>
            </div>
          </div>
          
          {/* 버튼들 - 기본정보 섹션 하단에 배치 */}
          <div style={{ 
            display: 'flex', 
            gap: '8px',
            justifyContent: 'space-between',
            marginTop: 'auto',
            paddingTop: '30px'
          }}>
            <button 
              onClick={handleChat} 
              style={{ 
                cursor: 'pointer', 
                padding: '8px 12px',
                backgroundColor: 'rgb(39, 192, 141)',
                color: 'white',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                flex: '1'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#30E8AB'
                e.target.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgb(39, 192, 141)'
                e.target.style.transform = 'translateY(0)'
              }}
            >
              채팅하기
            </button>
            <button 
              onClick={handleDisconnect}
              style={{ 
                padding: '8px 12px',
                backgroundColor: '#F3F4F6',
                color: '#6B7280',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12px',
                fontWeight: '500',
                flex: '1',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#EF4444'
                e.target.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#F3F4F6'
                e.target.style.color = '#6B7280'
              }}
            >
              연결끊기
            </button>
            <button 
              onClick={handleFindOther} 
              style={{ 
                cursor: 'pointer', 
                padding: '8px 12px',
                backgroundColor: '#CEF4E7',
                color: '#111827',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                flex: '1'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgb(39, 192, 141)'
                e.target.style.color = 'white'
                e.target.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#CEF4E7'
                e.target.style.color = '#111827'
                e.target.style.transform = 'translateY(0)'
              }}
            >
              다른 마음코디네이터
            </button>
          </div>
        </div>
      </div>
      </main>
    </div>
  )
}

export default Coordinator
