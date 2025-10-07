import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

function PersonAnalysis() {
  const navigate = useNavigate()
  const [speechAnalysis, setSpeechAnalysis] = useState('')
  const [drawnImage, setDrawnImage] = useState(null)
  const [analyzedImage, setAnalyzedImage] = useState(null)
  const [selectedGender, setSelectedGender] = useState(null)
  const [isLoadingSpeech, setIsLoadingSpeech] = useState(false)

  const handleBack = () => {
    navigate('/draw/person')
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
          message: "이 사람 그림 분석 결과를 바탕으로 따뜻하고 친근한 어투로 심리 분석을 해주세요. 전문적이지만 이해하기 쉽게 설명해주세요.",
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
    const savedDrawnImage = localStorage.getItem('drawnPersonImage')
    const savedAnalysis = localStorage.getItem('personAnalysisResult')
    const savedGender = localStorage.getItem('selectedGender')
    
    if (savedDrawnImage) {
      setDrawnImage(savedDrawnImage)
    }
    
    if (savedGender) {
      setSelectedGender(savedGender)
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
          resultText += `👤 탐지된 ${savedGender === 'male' ? '남성' : '여성'} 요소들:\n`
          parsedAnalysis.forEach((element, index) => {
            resultText += `• ${element.class} (신뢰도: ${(element.confidence * 100).toFixed(1)}%)\n`
          })
          resultText += '\n'
        }
        
        // 사람 구조 분석
        resultText += '🧍 사람 구조 분석:\n'
        const hasHead = parsedAnalysis.some(d => d.class === '머리' || d.class === '얼굴')
        const hasBody = parsedAnalysis.some(d => d.class === '몸통' || d.class === '상체')
        const hasArms = parsedAnalysis.some(d => d.class === '팔' || d.class === '손')
        const hasLegs = parsedAnalysis.some(d => d.class === '다리' || d.class === '발')
        const hasEyes = parsedAnalysis.some(d => d.class === '눈')
        const hasMouth = parsedAnalysis.some(d => d.class === '입')
        const hasNose = parsedAnalysis.some(d => d.class === '코')
        const hasEars = parsedAnalysis.some(d => d.class === '귀')
        const hasHair = parsedAnalysis.some(d => d.class === '머리카락')
        
        if (hasHead) {
          resultText += '• 머리/얼굴이 그려져 있습니다. 자아 인식과 정체성을 나타냅니다.\n'
        } else {
          resultText += '• 머리/얼굴이 명확하지 않습니다. 자아 인식이 부족할 수 있습니다.\n'
        }
        
        if (hasBody) {
          resultText += '• 몸통이 그려져 있습니다. 감정과 욕구의 중심을 보여줍니다.\n'
        } else {
          resultText += '• 몸통이 명확하지 않습니다. 감정 표현이 제한적일 수 있습니다.\n'
        }
        
        if (hasArms) {
          resultText += '• 팔/손이 그려져 있습니다. 환경과의 상호작용 능력을 나타냅니다.\n'
        } else {
          resultText += '• 팔/손이 명확하지 않습니다. 상호작용 능력이 부족할 수 있습니다.\n'
        }
        
        if (hasLegs) {
          resultText += '• 다리/발이 그려져 있습니다. 안정감과 지지력을 보여줍니다.\n'
        } else {
          resultText += '• 다리/발이 명확하지 않습니다. 안정감이나 지지력이 부족할 수 있습니다.\n'
        }
        
        if (hasEyes) {
          resultText += '• 눈이 그려져 있습니다. 관찰력과 인식 능력을 나타냅니다.\n'
        } else {
          resultText += '• 눈이 명확하지 않습니다. 관찰력이나 인식 능력이 제한적일 수 있습니다.\n'
        }
        
        if (hasMouth) {
          resultText += '• 입이 그려져 있습니다. 의사소통 능력을 보여줍니다.\n'
        } else {
          resultText += '• 입이 명확하지 않습니다. 의사소통 능력이 부족할 수 있습니다.\n'
        }
        
        if (hasNose) {
          resultText += '• 코가 그려져 있습니다. 감각적 인식 능력을 나타냅니다.\n'
        } else {
          resultText += '• 코가 명확하지 않습니다. 감각적 인식이 제한적일 수 있습니다.\n'
        }
        
        if (hasEars) {
          resultText += '• 귀가 그려져 있습니다. 듣기와 이해 능력을 보여줍니다.\n'
        } else {
          resultText += '• 귀가 명확하지 않습니다. 듣기나 이해 능력이 부족할 수 있습니다.\n'
        }
        
        if (hasHair) {
          resultText += '• 머리카락이 그려져 있습니다. 개성과 스타일을 나타냅니다.\n'
        } else {
          resultText += '• 머리카락이 명확하지 않습니다. 개성 표현이 제한적일 수 있습니다.\n'
        }
        
        resultText += '\n'
        
        // 심리 분석
        resultText += '🧠 심리 분석:\n'
        const totalElements = parsedAnalysis.length
        const facialFeatures = parsedAnalysis.filter(d => 
          ['눈', '입', '코', '귀', '얼굴'].includes(d.class)
        ).length
        
        if (totalElements >= 8) {
          resultText += '• 매우 상세한 사람 그림입니다. 높은 인지 능력과 관찰력을 보여줍니다.\n'
        } else if (totalElements >= 5) {
          resultText += '• 적당한 수준의 상세함을 보입니다. 균형 잡힌 인지 능력을 가지고 있습니다.\n'
        } else {
          resultText += '• 기본적인 사람 구조입니다. 더 자세한 표현을 시도해볼 수 있습니다.\n'
        }
        
        if (facialFeatures >= 3) {
          resultText += '• 얼굴 특징이 잘 표현되어 있습니다. 사회적 상호작용에 관심이 많습니다.\n'
        } else if (facialFeatures >= 1) {
          resultText += '• 기본적인 얼굴 특징을 보입니다. 더 세부적인 표현을 시도해보세요.\n'
        } else {
          resultText += '• 얼굴 특징이 부족합니다. 사회적 상호작용에 관심을 가져보세요.\n'
        }
        
        // 성별별 특화 분석
        if (savedGender === 'male') {
          resultText += '• 남성 모델 분석: 남성적 특성과 사회적 역할에 대한 인식을 보여줍니다.\n'
        } else {
          resultText += '• 여성 모델 분석: 여성적 특성과 사회적 역할에 대한 인식을 보여줍니다.\n'
        }
        
        resultText += '\n'
        
        // 추천사항
        resultText += '💡 추천사항:\n'
        if (!hasHead) {
          resultText += '1. 머리와 얼굴을 더 명확하게 그려보세요.\n'
        }
        if (!hasBody) {
          resultText += '2. 몸통을 추가하여 사람을 완성해보세요.\n'
        }
        if (!hasArms) {
          resultText += '3. 팔과 손을 그려서 상호작용 능력을 표현해보세요.\n'
        }
        if (!hasLegs) {
          resultText += '4. 다리와 발을 그려서 안정감을 표현해보세요.\n'
        }
        if (facialFeatures < 3) {
          resultText += '5. 눈, 입, 코, 귀 등 얼굴 특징을 더 자세히 그려보세요.\n'
        }
        if (!hasHair) {
          resultText += '6. 머리카락을 추가하여 개성을 표현해보세요.\n'
        }
        
        if (hasHead && hasBody && hasArms && hasLegs && facialFeatures >= 3) {
          resultText += '1. 훌륭한 사람 그림입니다! 더 창의적인 요소들을 추가해보세요.\n'
        }
        
        
        // 챗봇 분석 요청
        getChatbotAnalysis(parsedAnalysis)
      } catch (error) {
        console.error('분석 결과 파싱 오류:', error)
        console.error('분석 결과를 불러오는 중 오류가 발생했습니다.')
      }
    } else {
      console.log('분석 결과가 없습니다. 먼저 사람을 그리고 분석해주세요.')
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
          {/* 사람그림 */}
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
                alt="그린 사람 그림" 
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
                {selectedGender === 'male' ? '남자그림' : '여자그림'}
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
                alt="분석된 사람 그림" 
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

export default PersonAnalysis
