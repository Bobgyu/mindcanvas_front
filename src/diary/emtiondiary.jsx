import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function EmotionDiary() {
  const navigate = useNavigate()
  const [selectedEmotion, setSelectedEmotion] = useState(null)
  const [diaryText, setDiaryText] = useState('')
  const [showEmotionPicker, setShowEmotionPicker] = useState(false)

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

  const handleSubmit = () => {
    if (!selectedEmotion || !diaryText.trim()) {
      alert('감정을 선택하고 일기를 작성해주세요.')
      return
    }

    // 일기 데이터 저장 (로컬 스토리지 또는 API 호출)
    const diaryData = {
      emotion: selectedEmotion,
      text: diaryText,
      date: new Date().toISOString().split('T')[0]
    }

    // 로컬 스토리지에 저장
    const existingDiaries = JSON.parse(localStorage.getItem('emotionDiaries') || '[]')
    existingDiaries.push(diaryData)
    localStorage.setItem('emotionDiaries', JSON.stringify(existingDiaries))

    alert('일기가 저장되었습니다!')
    navigate('/mainpage')
  }

  return (
    <div className="emotion-diary-container">
      {/* 뒤로가기 버튼 */}
      <div className="back-button-container">
        <button className="back-button" onClick={handleBack}>
          ← 뒤로가기
        </button>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="diary-content">
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
      </div>

      <style jsx>{`
        .emotion-diary-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          position: relative;
        }

        .back-button-container {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 10;
        }

        .back-button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateX(-5px);
        }

        .diary-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          gap: 30px;
          padding: 60px 20px 20px;
        }

        .emotion-section {
          position: relative;
        }

        .emotion-bubble {
          background: white;
          border: 3px solid #333;
          border-radius: 20px;
          padding: 20px 30px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
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
          background: #4CAF50;
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
          background: #45a049;
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
          background: #90EE90;
          border: 3px solid #333;
          border-radius: 20px;
          padding: 25px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          position: relative;
        }

        .diary-bubble::after {
          content: '';
          position: absolute;
          bottom: -15px;
          left: 50px;
          width: 0;
          height: 0;
          border-left: 15px solid transparent;
          border-right: 15px solid transparent;
          border-top: 15px solid #90EE90;
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
          background: white;
          border: 3px solid #333;
          color: #333;
          padding: 15px 40px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .submit-button:hover {
          background: #f0f0f0;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
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
