import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Analysis() {
  const navigate = useNavigate()
  const [analysisResult, setAnalysisResult] = useState('')
  const [speechAnalysis, setSpeechAnalysis] = useState('')
  const [analysisData, setAnalysisData] = useState(null)
  const [drawnImage, setDrawnImage] = useState(null)
  const [analyzedImage, setAnalyzedImage] = useState(null)

  const handleBack = () => {
    navigate('/draw/home')
  }

  const findMindCoordinator = () => {
    alert('마음코디네이터 찾기 기능은 준비 중입니다!')
  }

  const findCounselingCenter = () => {
    alert('근처 상담센터 찾기 기능은 준비 중입니다!')
  }

  useEffect(() => {
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
        
        setAnalysisResult(resultText)
      } catch (error) {
        console.error('분석 결과 파싱 오류:', error)
        setAnalysisResult('분석 결과를 불러오는 중 오류가 발생했습니다.')
      }
    } else {
      setAnalysisResult('분석 결과가 없습니다. 먼저 그림을 그리고 분석해주세요.')
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
      {/* 뒤로가기 */}
      <div className='goback'>
        <p onClick={handleBack} style={{ cursor: 'pointer' }}>뒤로가기</p>
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

        {/* 분석결과 영역 */}
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
            분석결과
          </h3>
          <div style={{
            width: '90%',
            maxWidth: '600px',
            minHeight: '200px',
            maxHeight: '300px',
            border: '2px solid #000',
            borderRadius: '10px',
            padding: '15px',
            backgroundColor: '#f9f9f9',
            fontSize: '14px',
            color: '#333',
            whiteSpace: 'pre-line',
            textAlign: 'left',
            overflow: 'auto',
            lineHeight: '1.5'
          }}>
            {analysisResult || '분석 결과가 여기에 표시됩니다.'}
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
            말하기 분석
          </h3>
          <div style={{
            width: '90%',
            maxWidth: '600px',
            height: '150px',
            border: '2px solid #000',
            borderRadius: '10px',
            padding: '15px',
            backgroundColor: '#f9f9f9',
            fontSize: '14px',
            color: '#666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {speechAnalysis || '말하기 분석 결과가 여기에 표시됩니다.'}
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
              backgroundColor: '#3a9d1f',
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
              e.target.style.backgroundColor = '#338a1a'
              e.target.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#3a9d1f'
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
              backgroundColor: '#4ecdc4',
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
              e.target.style.backgroundColor = '#45b7aa'
              e.target.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#4ecdc4'
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
