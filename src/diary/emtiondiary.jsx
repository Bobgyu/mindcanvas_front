import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function EmotionDiary() {
  const navigate = useNavigate()
  const [selectedEmotion, setSelectedEmotion] = useState(null)
  const [diaryText, setDiaryText] = useState('')
  const [showEmotionPicker, setShowEmotionPicker] = useState(false)
  const [modal, setModal] = useState({ show: false, message: '', type: '' })

  // 감정 이모티콘 목록
  const emotions = [
	{ id: 'kind', name: '기쁨', image: 'Emotion Color Outline_5-kind.png' },  
	{ id: 'good', name: '좋음', image: 'Emotion Color Outline_2-smile.png' },  
    { id: 'amaized', name: '놀람', image: 'Emotion Color Outline_20-amazed.png' },
    { id: 'depression', name: '우울', image: 'Emotion Color Outline_9-sad.png' },
    { id: 'not-bothered', name: '무관심', image: 'Emotion Color Outline_1-not-bothered.png' },
	{ id: 'angry', name: '화남', image: 'Emotion Color Outline_14-angry.png' },
    { id: 'madness', name: '짜증', image: 'Emotion Color Outline_24-madness.png' },    
	{ id: 'sick', name: '아픔', image: 'Emotion Color Outline_19-sick.png' },
    { id: 'sad', name: '슬픔', image: 'sad.png' }
  ]

  const handleBack = () => {
    navigate('/mainpage')
  }

  const selectEmotion = (emotion) => {
    setSelectedEmotion(emotion)
    setShowEmotionPicker(false)
  }

  const closeModal = () => {
    setModal({ show: false, message: '', type: '' });
  };

  const handleSubmit = async () => {
    if (!selectedEmotion || !diaryText.trim()) {
      setModal({ 
        show: true, 
        message: '감정을 선택하고 일기를 작성해주세요.', 
        type: 'warning' 
      });
      return
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setModal({ 
          show: true, 
          message: '로그인이 필요합니다.', 
          type: 'warning' 
        });
        setTimeout(() => navigate('/login'), 2000);
        return
      }

      // API로 감정일기 저장
      const response = await axios.post('http://localhost:5000/api/emotion-diary', {
        emotion: selectedEmotion.name,
        emotion_id: selectedEmotion.id,
        content: diaryText.trim()
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        setModal({ 
          show: true, 
          message: '일기가 저장되었습니다!', 
          type: 'success' 
        });
        setTimeout(() => navigate('/mainpage'), 2000);
      } else {
        setModal({ 
          show: true, 
          message: '일기 저장에 실패했습니다.', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('감정일기 저장 오류:', error)
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
          message: '일기 저장 중 오류가 발생했습니다.', 
          type: 'error' 
        });
      }
    }
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
            
            {/* 확인 버튼 */}
            <button
              onClick={closeModal}
              style={{
                width: '100%',
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

      {/* 마음일기 유형 표시 */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#4A90E2',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: 'bold',
        zIndex: 100
      }}>
        마음일기
      </div>

      {/* 메인 컨텐츠 */}
      <main className="flex-grow p-6" style={{ marginTop: '60px' }}>
        {/* 감정 선택 영역 */}
        <div className="emotion-section">
          <div className="emotion-bubble">
            {selectedEmotion ? (
              <div className="selected-emotion">
                <img 
                  src={`/src/imgdata/emotion/${selectedEmotion.image}`}
                  alt={selectedEmotion.name}
                  className="emotion-icon"
                />
                <span className="emotion-name">{selectedEmotion.name}</span>
                <button 
                  className="change-emotion-btn"
                  onClick={() => setShowEmotionPicker(true)}
                >
                  ▼
                </button>
              </div>
            ) : (
              <button 
                className="select-emotion-btn"
                onClick={() => setShowEmotionPicker(true)}
              >
                감정을 선택해주세요 ▼
              </button>
            )}
          </div>

          {/* 감정 선택 드롭다운 */}
          {showEmotionPicker && (
            <div className="emotion-picker">
              <div className="emotion-grid">
                {emotions.map((emotion) => (
                  <button
                    key={emotion.id}
                    className="emotion-option"
                    onClick={() => selectEmotion(emotion)}
                  >
                    <img 
                      src={`/src/imgdata/emotion/${emotion.image}`}
                      alt={emotion.name}
                      className="emotion-icon-small"
                    />
                    <span className="emotion-label">{emotion.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 일기 작성 영역 */}
        <div className="diary-section">
          <div className="diary-bubble">
            <div className="diary-header">
              <span className="diary-title">오늘의 일기를 적어주세요.</span>
            </div>
            <textarea
              className="diary-textarea"
              value={diaryText}
              onChange={(e) => setDiaryText(e.target.value)}
              placeholder="오늘 하루는 어떠셨나요? 느낀 점을 자유롭게 적어보세요."
              rows="8"
            />
          </div>
        </div>

        {/* 작성완료 버튼 */}
        <div className="submit-section">
          <button 
            className="submit-button"
            onClick={handleSubmit}
          >
            작성완료
          </button>
        </div>
      </main>

      <style>{`
        .diary-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }

        .emotion-section {
          position: relative;
          margin-bottom: 20px;
        }

        .diary-section {
          margin-bottom: 20px;
        }

        .submit-section {
          margin-top: 10px;
        }

        .emotion-bubble {
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 20px;
          padding: 20px 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          min-width: 300px;
          text-align: center;
        }

        .selected-emotion {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
        }

        .emotion-icon {
          width: 40px;
          height: 40px;
        }

        .emotion-name {
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }

        .change-emotion-btn {
          background: rgb(39, 192, 141) ;
          border: none;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .change-emotion-btn:hover {
          background: rgb(39, 192, 141) ;
          transform: scale(1.1);
        }

        .select-emotion-btn {
          background: #f0f0f0;
          border: 2px dashed #ccc;
          color: #666;
          padding: 15px 20px;
          border-radius: 15px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s ease;
          width: 100%;
        }

        .select-emotion-btn:hover {
          background: #e0e0e0;
          border-color: #999;
        }

        .emotion-picker {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          border: 2px solid #333;
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
          z-index: 100;
          margin-top: 10px;
        }

        .emotion-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          min-width: 300px;
        }

        .emotion-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 15px;
          border: 2px solid #eee;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .emotion-option:hover {
          border-color: #4CAF50;
          background: #f8f8f8;
          transform: translateY(-2px);
        }

        .emotion-icon-small {
          width: 30px;
          height: 30px;
        }

        .emotion-label {
          font-size: 12px;
          font-weight: bold;
          color: #333;
        }

        .diary-section {
          width: 100%;
          max-width: 600px;
        }

        .diary-bubble {
          background: #30E8AB;
          border: none;
          border-radius: 20px;
          padding: 25px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          position: relative;
        }


        .diary-header {
          margin-bottom: 20px;
        }

        .diary-title {
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }

        .diary-textarea {
          width: 100%;
          border: none;
          background: transparent;
          resize: none;
          outline: none;
          font-size: 16px;
          line-height: 1.6;
          color: #333;
          font-family: inherit;
        }

        .diary-textarea::placeholder {
          color: #666;
        }

        .submit-section {
          display: flex;
          justify-content: center;
        }

        .submit-button {
          padding: 10px 20px;
          background-color: rgb(39, 192, 141);
          color: white;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
        }


        @media (max-width: 768px) {
          .diary-content {
            padding: 80px 10px 20px;
          }

          .emotion-bubble {
            min-width: 250px;
          }

          .emotion-grid {
            grid-template-columns: repeat(2, 1fr);
            min-width: 250px;
          }

          .diary-bubble {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  )
}

export default EmotionDiary
