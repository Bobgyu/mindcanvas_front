import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

function TreeAnalysis() {
  const navigate = useNavigate()
  const [speechAnalysis, setSpeechAnalysis] = useState('')
  const [drawnImage, setDrawnImage] = useState(null)
  const [analyzedImage, setAnalyzedImage] = useState(null)
  const [isLoadingSpeech, setIsLoadingSpeech] = useState(false)

  const handleBack = () => {
    navigate('/draw/tree')
  }

  const findMindCoordinator = () => {
    alert('마음코디네이터 찾기 기능은 준비 중입니다!')
  }

  const findCounselingCenter = () => {
    navigate('/counseling-center')
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
          message: "이 나무 그림 분석 결과를 바탕으로 따뜻하고 친근한 어투로 심리 분석을 해주세요. 전문적이지만 이해하기 쉽게 설명해주세요.",
          conversation_history: [],
          image_analysis_result: analysisData
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSpeechAnalysis(data.response)
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
    // 로컬 스토리지에서 그린 그림과 분석 결과 가져오기
    const savedDrawnImage = localStorage.getItem('drawnTreeImage')
    const savedAnalysis = localStorage.getItem('treeAnalysisResult')
    
    if (savedDrawnImage) {
      setDrawnImage(savedDrawnImage)
    }
    
    if (savedAnalysis) {
      try {
        const parsedAnalysis = JSON.parse(savedAnalysis)
        
        // 분석된 그림 생성 (탐지된 요소들을 표시한 그림)
        if (parsedAnalysis && parsedAnalysis.length > 0) {
          createAnalyzedImage(savedDrawnImage, parsedAnalysis)
        }
        
        // 분석 결과를 텍스트로 변환
        let resultText = ''
        
        // 탐지된 요소들 표시
        if (parsedAnalysis && parsedAnalysis.length > 0) {
          resultText += '🌳 탐지된 나무 요소들:\n'
          parsedAnalysis.forEach((element, index) => {
            resultText += `• ${element.class} (신뢰도: ${(element.confidence * 100).toFixed(1)}%)\n`
          })
          resultText += '\n'
        }
        
        // 나무 구조 분석
        resultText += '🌲 나무 구조 분석:\n'
        const hasTrunk = parsedAnalysis.some(d => d.class === '기둥')
        const hasCrown = parsedAnalysis.some(d => d.class === '수관')
        const hasBranches = parsedAnalysis.some(d => d.class === '가지')
        const hasLeaves = parsedAnalysis.some(d => d.class === '나뭇잎')
        const hasRoots = parsedAnalysis.some(d => d.class === '뿌리')
        
        if (hasTrunk) {
          resultText += '• 기둥이 그려져 있습니다. 안정감과 지지력을 나타냅니다.\n'
        } else {
          resultText += '• 기둥이 명확하지 않습니다. 지지력이나 안정감이 부족할 수 있습니다.\n'
        }
        
        if (hasCrown) {
          resultText += '• 수관이 그려져 있습니다. 성장과 발전의 의지를 보여줍니다.\n'
        } else {
          resultText += '• 수관이 명확하지 않습니다. 성장 욕구가 제한적일 수 있습니다.\n'
        }
        
        if (hasBranches) {
          resultText += '• 가지가 그려져 있습니다. 다양한 방향으로의 확장을 원합니다.\n'
        } else {
          resultText += '• 가지가 명확하지 않습니다. 확장성이나 다양성이 부족할 수 있습니다.\n'
        }
        
        if (hasLeaves) {
          resultText += '• 나뭇잎이 그려져 있습니다. 활력과 생명력을 나타냅니다.\n'
        } else {
          resultText += '• 나뭇잎이 명확하지 않습니다. 활력이나 생명력이 부족할 수 있습니다.\n'
        }
        
        if (hasRoots) {
          resultText += '• 뿌리가 그려져 있습니다. 안정감과 소속감을 중시합니다.\n'
        } else {
          resultText += '• 뿌리가 명확하지 않습니다. 안정감이나 소속감이 부족할 수 있습니다.\n'
        }
        
        resultText += '\n'
        
        // 심리 분석
        resultText += '🧠 심리 분석:\n'
        const totalElements = parsedAnalysis.length
        const creativeElements = parsedAnalysis.filter(d => 
          ['꽃', '열매', '새', '다람쥐', '구름', '달', '별'].includes(d.class)
        ).length
        
        if (totalElements >= 6) {
          resultText += '• 매우 상세한 나무 그림입니다. 높은 인지 능력과 상상력을 보여줍니다.\n'
        } else if (totalElements >= 3) {
          resultText += '• 적당한 수준의 상세함을 보입니다. 균형 잡힌 인지 능력을 가지고 있습니다.\n'
        } else {
          resultText += '• 기본적인 나무 구조입니다. 더 자세한 표현을 시도해볼 수 있습니다.\n'
        }
        
        if (creativeElements >= 2) {
          resultText += '• 창의적이고 풍부한 상상력을 가지고 있습니다. 예술적 감각이 뛰어납니다.\n'
        } else if (creativeElements === 1) {
          resultText += '• 기본적인 창의성을 보입니다. 더 다양한 요소를 추가해보세요.\n'
        } else {
          resultText += '• 창의적 요소가 부족합니다. 상상력을 발휘해 다양한 요소를 그려보세요.\n'
        }
        
        resultText += '\n'
        
        // 추천사항
        resultText += '💡 추천사항:\n'
        if (!hasTrunk) {
          resultText += '1. 나무의 기둥을 더 명확하게 그려보세요.\n'
        }
        if (!hasCrown) {
          resultText += '2. 수관을 추가하여 나무를 완성해보세요.\n'
        }
        if (!hasBranches) {
          resultText += '3. 가지를 그려서 나무가 더 생동감 있게 보이도록 해보세요.\n'
        }
        if (!hasLeaves) {
          resultText += '4. 나뭇잎을 추가하여 활력을 표현해보세요.\n'
        }
        if (!hasRoots) {
          resultText += '5. 뿌리를 그려서 안정감을 표현해보세요.\n'
        }
        if (creativeElements < 2) {
          resultText += '6. 주변 환경(새, 꽃, 구름 등)을 추가해보세요.\n'
        }
        
        if (hasTrunk && hasCrown && hasBranches && hasLeaves) {
          resultText += '1. 훌륭한 나무 그림입니다! 더 창의적인 요소들을 추가해보세요.\n'
        }
        
        
        // 챗봇 분석 요청
        getChatbotAnalysis(parsedAnalysis)
      } catch (error) {
        console.error('분석 결과 파싱 오류:', error)
        console.error('분석 결과를 불러오는 중 오류가 발생했습니다.')
      }
    } else {
      console.log('분석 결과가 없습니다. 먼저 나무를 그리고 분석해주세요.')
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
          {/* 나무그림 */}
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
                alt="그린 나무 그림" 
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
                나무그림
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
                alt="분석된 나무 그림" 
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

export default TreeAnalysis
