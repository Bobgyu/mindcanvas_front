import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function EmotionDiaryList() {
  const navigate = useNavigate()
  const [diaries, setDiaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modal, setModal] = useState({ show: false, message: '', type: '' })

  // 감정 이모티콘 매핑
  const emotionImages = {
    'kind': 'Emotion Color Outline_5-kind.png',
    'good': 'Emotion Color Outline_2-smile.png',
    'amaized': 'Emotion Color Outline_20-amazed.png',
    'depression': 'Emotion Color Outline_9-sad.png',
    'not-bothered': 'Emotion Color Outline_1-not-bothered.png',
    'angry': 'Emotion Color Outline_14-angry.png',
    'madness': 'Emotion Color Outline_24-madness.png',
    'sick': 'Emotion Color Outline_19-sick.png',
    'sad': 'sad.png'
  }

  useEffect(() => {
    fetchDiaries()
  }, [])

  const fetchDiaries = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login')
        return
      }

      const response = await axios.get('http://localhost:5000/api/emotion-diary', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        setDiaries(response.data.diaries)
      } else {
        setError('일기 목록을 불러오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('감정일기 조회 오류:', error)
      if (error.response?.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.')
        localStorage.removeItem('authToken')
        localStorage.removeItem('userId')
        localStorage.removeItem('username')
        navigate('/login')
      } else {
        setError('일기 목록을 불러오는데 실패했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate('/mypage')
  }

  const closeModal = () => {
    setModal({ show: false, message: '', type: '' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDeleteDiary = async (diaryId) => {
    setModal({ 
      show: true, 
      message: '정말로 이 일기를 삭제하시겠습니까?', 
      type: 'warning',
      onConfirm: async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.delete(`http://localhost:5000/api/emotion-diary/${diaryId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
            setModal({ 
              show: true, 
              message: '일기가 삭제되었습니다.', 
              type: 'success' 
            });
        fetchDiaries() // 목록 새로고침
      } else {
            setModal({ 
              show: true, 
              message: '일기 삭제에 실패했습니다.', 
              type: 'error' 
            });
      }
    } catch (error) {
      console.error('감정일기 삭제 오류:', error)
      if (error.response?.status === 401) {
            setModal({ 
              show: true, 
              message: '로그인이 만료되었습니다. 다시 로그인해주세요.', 
              type: 'warning' 
            });
        localStorage.removeItem('authToken')
        localStorage.removeItem('userId')
        localStorage.removeItem('username')
            setTimeout(() => navigate('/login'), 2000);
      } else {
            setModal({ 
              show: true, 
              message: '일기 삭제 중 오류가 발생했습니다.', 
              type: 'error' 
            });
          }
        }
      }
    });
  }

  if (loading) {
    return (
      <div className="w-[29rem] h-[58rem] rounded-3xl flex flex-col" style={{backgroundColor: 'rgb(206, 244, 231)'}}>
        <header className="w-full shadow-sm py-4 px-6 flex items-center justify-between">
          <div className="w-6"></div>
          <h1 className="text-xl font-bold" style={{color: '#111827'}}>마음일기 보기</h1>
          <div className="w-6"></div>
        </header>
        <main className="flex-grow p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="loading-spinner"></div>
            <p className="text-gray-600 mt-4">일기를 불러오는 중...</p>
          </div>
        </main>
        <style>{`
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-top: 4px solid #333;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-[29rem] h-[58rem] rounded-3xl flex flex-col" style={{backgroundColor: 'rgb(206, 244, 231)'}}>
        <header className="w-full shadow-sm py-4 px-6 flex items-center justify-between">
          <div className="w-6"></div>
          <h1 className="text-xl font-bold" style={{color: '#111827'}}>마음일기 보기</h1>
          <div className="w-6"></div>
        </header>
        <main className="flex-grow p-6 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={fetchDiaries} 
              className="text-white px-4 py-2 rounded-lg transition-colors"
              style={{backgroundColor: 'rgb(39, 192, 141)'}}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#30E8AB'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'rgb(39, 192, 141)'}
            >
              다시 시도
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="w-[29rem] h-[58rem] rounded-3xl flex flex-col relative" style={{backgroundColor: 'rgb(206, 244, 231)'}}>
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
              {modal.type === 'warning' && (
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#fff3cd',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{ width: '30px', height: '30px', color: '#ffc107' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
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
              lineHeight: '1.5'
            }}>
              {modal.message}
            </p>
            
            {/* 버튼들 */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {modal.type === 'warning' ? (
                <>
                  <button
                    onClick={closeModal}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#6c757d',
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
                    취소
                  </button>
                  <button
                    onClick={() => {
                      if (modal.onConfirm) {
                        modal.onConfirm();
                      }
                      closeModal();
                    }}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#dc3545',
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
                    삭제
                  </button>
                </>
              ) : (
                <button
                  onClick={closeModal}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: modal.type === 'success' ? 'rgb(39, 192, 141)' : 
                                   modal.type === 'error' ? '#dc3545' : '#ffc107',
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
              )}
            </div>
          </div>
        </div>
      )}

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
        <h1 className="text-xl font-bold" style={{color: '#111827'}}>마음일기 보기</h1>
        <div className="w-6"></div>
      </header>

      {/* 일기 목록 */}
      <main className="flex-grow p-6 overflow-y-auto custom-scrollbar">
        {diaries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>아직 작성된 일기가 없습니다</h3>
            <p>첫 번째 마음일기를 작성해보세요!</p>
            <button 
              className="write-diary-button"
              onClick={() => navigate('/diary/emotion')}
            >
              일기 작성하기
            </button>
          </div>
        ) : (
          diaries.map((diary) => (
            <div key={diary.id} className="diary-card">
              <div className="diary-card-header">
                <div className="emotion-info">
                  <img 
                    src={`/src/imgdata/emotion/${emotionImages[diary.emotion_id] || 'Emotion Color Outline_2-smile.png'}`}
                    alt={diary.emotion}
                    className="emotion-icon"
                  />
                  <span className="emotion-name">{diary.emotion}</span>
                </div>
                <div className="diary-actions">
                  <span className="diary-date">{formatDate(diary.created_at)}</span>
                  <button 
                    onClick={() => handleDeleteDiary(diary.id)}
                    className="text-gray-400 transition-colors p-1 rounded-full hover:bg-opacity-20"
                    style={{'&:hover': {color: '#dc3545', backgroundColor: '#f8d7da'}}}
                    title="일기 삭제"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="diary-content">
                <p>{diary.content}</p>
              </div>
            </div>
          ))
        )}
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        .empty-state {
          text-align: center;
          color: #111827;
          padding: 60px 20px;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .empty-state h3 {
          font-size: 24px;
          margin-bottom: 10px;
        }

        .empty-state p {
          font-size: 16px;
          margin-bottom: 30px;
          opacity: 0.8;
        }

        .write-diary-button {
          background: white;
          border: none;
          color: rgb(39, 192, 141);
          padding: 15px 30px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .write-diary-button:hover {
          background: #CEF4E7;
          transform: translateY(-2px);
        }

        .diary-card {
          background: white;
          border-radius: 15px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          border: 1px solid #CEF4E7;
          transition: all 0.3s ease;
        }

        .diary-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
          border-color: rgb(39, 192, 141);
        }

        .diary-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }

        .emotion-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .emotion-icon {
          width: 30px;
          height: 30px;
        }

        .emotion-name {
          font-size: 16px;
          font-weight: bold;
          color: #111827;
        }

        .diary-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .diary-date {
          font-size: 12px;
          color: #666;
        }


        .diary-content {
          color: #111827;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        @media (max-width: 768px) {
          .diary-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .diary-card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .diary-actions {
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  )
}

export default EmotionDiaryList
