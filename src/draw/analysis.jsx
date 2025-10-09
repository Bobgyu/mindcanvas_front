import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Analysis() {
  const navigate = useNavigate()
  const [speechAnalysis, setSpeechAnalysis] = useState('')
  const [analysisData, setAnalysisData] = useState(null)
  const [drawnImage, setDrawnImage] = useState(null)
  const [analyzedImage, setAnalyzedImage] = useState(null)
  const [isLoadingSpeech, setIsLoadingSpeech] = useState(false)
  const [isFromGallery, setIsFromGallery] = useState(false)
  const [galleryDrawingId, setGalleryDrawingId] = useState(null)
  const [savedDrawingId, setSavedDrawingId] = useState(null) // 일반 그리기에서 저장된 그림 ID

  const handleBack = () => {
    // 로컬 스토리지 정리
    localStorage.removeItem('savedDrawingId')
    localStorage.removeItem('drawnImage')
    localStorage.removeItem('analysisResult')
    
    if (isFromGallery) {
      // 갤러리에서 온 경우 갤러리로 돌아가기
      navigate('/mypage/gallery')
    } else {
      // 일반 그리기에서 온 경우
      navigate('/draw/home')
    }
  }

  const findMindCoordinator = () => {
    navigate('/coordinator', { state: { from: 'analysis' } })
  }

  const findCounselingCenter = () => {
    navigate('/counseling-center')
  }

  // 갤러리에서 온 경우 분석 결과를 기존 그림에 업데이트
  const updateGalleryDrawing = async (analysisResult) => {
    if (!isFromGallery || !galleryDrawingId) return

    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`http://localhost:5000/api/drawings/${galleryDrawingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: drawnImage,
          analysis_result: analysisResult
        })
      })

      if (response.ok) {
        console.log('갤러리 그림 분석 결과 업데이트 완료')
        // 성공 알림
        alert('분석 결과가 저장되었습니다!')
        // 로컬 스토리지에 분석 완료 플래그 저장
        localStorage.setItem('analysisCompleted', 'true')
      } else {
        console.error('갤러리 그림 업데이트 실패')
        alert('분석 결과 저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('갤러리 그림 업데이트 오류:', error)
      alert('분석 결과 저장 중 오류가 발생했습니다.')
    }
  }

  // 일반 그리기에서 저장된 그림에 AI 분석 결과 업데이트
  const updateSavedDrawing = async (drawingId, analysisResult) => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`http://localhost:5000/api/drawings/${drawingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          analysis_result: analysisResult
        })
      })

      if (response.ok) {
        console.log('저장된 그림 AI 분석 결과 업데이트 완료')
        // 로컬 스토리지에 분석 완료 플래그 저장
        localStorage.setItem('analysisCompleted', 'true')
      } else {
        console.error('저장된 그림 업데이트 실패')
      }
    } catch (error) {
      console.error('저장된 그림 업데이트 오류:', error)
    }
  }

  const getChatbotAnalysis = async (analysisData) => {
    try {
      setIsLoadingSpeech(true)
      const response = await fetch('http://localhost:5000/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: "이 집 그림 분석 결과를 바탕으로 따뜻하고 친근한 어투로 심리 분석을 해주세요. 전문적이지만 이해하기 쉽게 설명해주세요.",
          conversation_history: [],
          image_analysis_result: analysisData
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSpeechAnalysis(data.response)
          // 갤러리에서 온 경우 AI 분석 내용을 포함하여 업데이트
          if (isFromGallery && galleryDrawingId) {
            // 로컬 스토리지에서 분석 결과를 다시 가져와서 AI 분석 내용과 합치기
            const savedAnalysis = localStorage.getItem('analysisResult')
            if (savedAnalysis) {
              try {
                const parsedAnalysis = JSON.parse(savedAnalysis)
                const analysisWithSpeech = {
                  ...parsedAnalysis,
                  ai_analysis: data.response
                }
                updateGalleryDrawing(analysisWithSpeech)
              } catch (error) {
                console.error('분석 결과 파싱 오류:', error)
              }
            }
          }
          
          // 일반 그리기에서 저장된 그림도 AI 분석 내용으로 업데이트
          if (!isFromGallery && savedDrawingId) {
            const savedAnalysis = localStorage.getItem('analysisResult')
            if (savedAnalysis) {
              try {
                const parsedAnalysis = JSON.parse(savedAnalysis)
                const analysisWithSpeech = {
                  ...parsedAnalysis,
                  ai_analysis: data.response
                }
                updateSavedDrawing(savedDrawingId, analysisWithSpeech)
              } catch (error) {
                console.error('분석 결과 파싱 오류:', error)
              }
            }
          }
        } else {
          setSpeechAnalysis('분석 결과를 처리하는 중 오류가 발생했습니다.')
        }
      } else {
        setSpeechAnalysis('서버와의 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('챗봇 응답 오류:', error)
      setSpeechAnalysis('분석 결과를 처리하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsLoadingSpeech(false)
    }
  }

  useEffect(() => {
    // 갤러리에서 온 경우인지 확인
    const continueDrawingData = localStorage.getItem('continueDrawing')
    if (continueDrawingData) {
      try {
        const data = JSON.parse(continueDrawingData)
        setIsFromGallery(true)
        setGalleryDrawingId(data.id)
        setDrawnImage(data.image)
        // 갤러리에서 온 경우 로컬 스토리지 정리
        localStorage.removeItem('continueDrawing')
      } catch (error) {
        console.error('갤러리 데이터 로드 실패:', error)
      }
    }
    
    // 일반 그리기에서 저장된 그림 ID 확인
    const savedDrawingId = localStorage.getItem('savedDrawingId')
    if (savedDrawingId) {
      setSavedDrawingId(savedDrawingId)
    }
    
    // 로컬 스토리지에서 그린 그림과 분석 결과 가져오기
    const savedDrawnImage = localStorage.getItem('drawnImage')
    const savedAnalysis = localStorage.getItem('analysisResult')
    
    if (savedDrawnImage) {
      setDrawnImage(savedDrawnImage)
    }
    
    if (savedAnalysis) {
      try {
        const parsedAnalysis = JSON.parse(savedAnalysis)
        setAnalysisData(parsedAnalysis)
        
        // 분석된 그림 생성 (탐지된 요소들을 표시한 그림)
        if (parsedAnalysis.detected_elements && parsedAnalysis.detected_elements.length > 0) {
          createAnalyzedImage(savedDrawnImage, parsedAnalysis.detected_elements)
        }
        
        // 분석 결과를 텍스트로 변환
        let resultText = ''
        
        // 탐지된 요소들 표시
        if (parsedAnalysis.detected_elements && parsedAnalysis.detected_elements.length > 0) {
          resultText += '🔍 탐지된 요소들:\n'
          parsedAnalysis.detected_elements.forEach((element, index) => {
            resultText += `• ${element.class} (신뢰도: ${(element.confidence * 100).toFixed(1)}%)\n`
          })
          resultText += '\n'
        }
        
        if (parsedAnalysis.house_elements) {
          resultText += '🏠 집 요소 분석:\n'
          Object.entries(parsedAnalysis.house_elements).forEach(([key, value]) => {
            resultText += `• ${value}\n`
          })
          resultText += '\n'
        }
        
        if (parsedAnalysis.psychological_analysis) {
          resultText += '🧠 심리 분석:\n'
          Object.entries(parsedAnalysis.psychological_analysis).forEach(([key, value]) => {
            resultText += `• ${value}\n`
          })
          resultText += '\n'
        }
        
        if (parsedAnalysis.recommendations) {
          resultText += '💡 추천사항:\n'
          parsedAnalysis.recommendations.forEach((rec, index) => {
            resultText += `${index + 1}. ${rec}\n`
          })
        }
        
        
        // 갤러리에서 온 경우 분석 결과를 기존 그림에 업데이트
        if (isFromGallery) {
          // AI 심리 분석 내용을 포함하여 업데이트
          const analysisWithSpeech = {
            ...parsedAnalysis,
            ai_analysis: speechAnalysis || 'AI가 따뜻한 심리 분석을 준비하고 있습니다...'
          }
          updateGalleryDrawing(analysisWithSpeech)
        }
        
        // 챗봇 분석 요청
        getChatbotAnalysis(parsedAnalysis)
      } catch (error) {
        console.error('분석 결과 파싱 오류:', error)
        console.error('분석 결과를 불러오는 중 오류가 발생했습니다.')
      }
    } else {
      console.log('분석 결과가 없습니다. 먼저 그림을 그리고 분석해주세요.')
    }
  }, [])

  const createAnalyzedImage = (originalImageData, detections) => {
    try {
      // 원본 이미지를 캔버스에 로드
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // 캔버스 크기 설정
        canvas.width = 400
        canvas.height = 680
        
        // 원본 이미지 그리기
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        // 탐지된 요소들에 바운딩 박스 그리기
        detections.forEach((detection, index) => {
          const [x1, y1, x2, y2] = detection.bbox
          
          // 바운딩 박스 그리기
          ctx.strokeStyle = '#ff0000'
          ctx.lineWidth = 3
          ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)
          
          // 라벨 배경
          const label = `${detection.class} (${(detection.confidence * 100).toFixed(1)}%)`
          ctx.font = '14px Arial'
          const textWidth = ctx.measureText(label).width
          const textHeight = 20
          
          ctx.fillStyle = 'rgba(255, 0, 0, 0.8)'
          ctx.fillRect(x1, y1 - textHeight, textWidth + 10, textHeight)
          
          // 라벨 텍스트
          ctx.fillStyle = 'white'
          ctx.fillText(label, x1 + 5, y1 - 5)
        })
        
        // 분석된 이미지를 Base64로 변환
        const analyzedImageData = canvas.toDataURL('image/png')
        setAnalyzedImage(analyzedImageData)
      }
      
      img.src = originalImageData
    } catch (error) {
      console.error('분석된 이미지 생성 오류:', error)
    }
  }

  return (
    <>
      {/* CSS 애니메이션 */}
      <style>{`
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
      
      {/* 뒤로가기 */}
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

      {/* 메인 분석 페이지 */}
      <div style={{ 
        padding: '20px',
        minHeight: '100vh',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '30px'
      }}>
        
        {/* 상단 이미지 영역 */}
        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          marginTop: '60px'
        }}>
          {/* 집그림 */}
          <div style={{
            width: '200px',
            height: '200px',
            border: '2px solid #000',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9f9f9',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {drawnImage ? (
              <img 
                src={drawnImage} 
                alt="그린 그림" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <span style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#666'
              }}>
                집그림
              </span>
            )}
          </div>

          {/* 분석된그림 */}
          <div style={{
            width: '200px',
            height: '200px',
            border: '2px solid #000',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9f9f9',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {analyzedImage ? (
              <img 
                src={analyzedImage} 
                alt="분석된 그림" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <span style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#666'
              }}>
                분석된그림
              </span>
            )}
          </div>
        </div>


        {/* 말하기 분석 영역 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          alignItems: 'center'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#333',
            margin: 0
          }}>
            AI 심리 분석
          </h3>
          <div style={{
            width: '90%',
            maxWidth: '600px',
            minHeight: '150px',
            border: '2px solid #000',
            borderRadius: '10px',
            padding: '15px',
            backgroundColor: '#f9f9f9',
            fontSize: '14px',
            color: '#333',
            whiteSpace: 'pre-wrap',
            textAlign: 'left',
            overflow: 'auto',
            lineHeight: '1.6',
            display: 'flex',
            alignItems: isLoadingSpeech ? 'center' : 'flex-start',
            justifyContent: 'center'
          }}>
            {isLoadingSpeech ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                color: '#666'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#666',
                    animation: 'typing 1.4s infinite ease-in-out'
                  }}></div>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#666',
                    animation: 'typing 1.4s infinite ease-in-out',
                    animationDelay: '0.2s'
                  }}></div>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#666',
                    animation: 'typing 1.4s infinite ease-in-out',
                    animationDelay: '0.4s'
                  }}></div>
                </div>
                <span>챗봇이 따뜻한 분석을 준비하고 있어요...</span>
              </div>
            ) : (
              speechAnalysis || 'AI가 따뜻한 심리 분석을 준비하고 있습니다...'
            )}
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          marginTop: '20px',
          marginBottom: '40px'
        }}>
          {/* 마음코디네이터 찾기 버튼 */}
          <button
            onClick={findMindCoordinator}
            style={{
              padding: '15px 25px',
              backgroundColor: 'rgb(39, 192, 141)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgb(35, 173, 127)'
              e.target.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgb(39, 192, 141)'
              e.target.style.transform = 'translateY(0)'
            }}
          >
            마음코디네이터 찾기
          </button>

          {/* 근처 상담센터 찾기 버튼 */}
          <button
            onClick={findCounselingCenter}
            style={{
              padding: '15px 25px',
              backgroundColor: 'rgb(39, 192, 141)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgb(35, 173, 127)'
              e.target.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgb(39, 192, 141)'
              e.target.style.transform = 'translateY(0)'
            }}
          >
            근처 상담센터 찾기
          </button>
        </div>
      </div>
    </>
  )
}

export default Analysis
