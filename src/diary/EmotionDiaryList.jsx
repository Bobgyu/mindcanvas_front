import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function EmotionDiaryList() {
  const navigate = useNavigate()
  const [diaries, setDiaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
    if (!window.confirm('정말로 이 일기를 삭제하시겠습니까?')) {
      return
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.delete(`http://localhost:5000/api/emotion-diary/${diaryId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        alert('일기가 삭제되었습니다.')
        fetchDiaries() // 목록 새로고침
      } else {
        alert('일기 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('감정일기 삭제 오류:', error)
      if (error.response?.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.')
        localStorage.removeItem('authToken')
        localStorage.removeItem('userId')
        localStorage.removeItem('username')
        navigate('/login')
      } else {
        alert('일기 삭제 중 오류가 발생했습니다.')
      }
    }
  }

  if (loading) {
    return (
      <div className="w-[29rem] h-[58rem] rounded-3xl flex flex-col" style={{backgroundColor: 'rgb(206, 244, 231)'}}>
        <header className="w-full shadow-sm py-4 px-6 flex items-center justify-between">
          <div className="w-6"></div>
          <h1 className="text-xl font-bold">마음일기 보기</h1>
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
          <h1 className="text-xl font-bold">마음일기 보기</h1>
          <div className="w-6"></div>
        </header>
        <main className="flex-grow p-6 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={fetchDiaries} 
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              다시 시도
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
        <h1 className="text-xl font-bold">마음일기 보기</h1>
        <div className="w-6"></div>
      </header>

      {/* 일기 목록 */}
      <main className="flex-grow p-6">
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
                    className="delete-button"
                    onClick={() => handleDeleteDiary(diary.id)}
                    title="삭제"
                  >
                    🗑️
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

        .empty-state {
          text-align: center;
          color: #666;
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
          color: #667eea;
          padding: 15px 30px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .write-diary-button:hover {
          background: #f0f0f0;
          transform: translateY(-2px);
        }

        .diary-card {
          background: white;
          border-radius: 15px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .diary-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
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
          color: #333;
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

        .delete-button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          padding: 5px;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .delete-button:hover {
          background: #ffebee;
          transform: scale(1.1);
        }

        .diary-content {
          color: #333;
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
