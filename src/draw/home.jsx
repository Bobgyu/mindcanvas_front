import { useNavigate } from 'react-router-dom'
import { useRef, useState, useEffect } from 'react'
import axios from 'axios'


function Home() {
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushSize, setBrushSize] = useState(5)
  const [brushColor, setBrushColor] = useState('#000000')
  const [currentTool, setCurrentTool] = useState('brush')
  const [showPalette, setShowPalette] = useState(false)
  const [showBrushSize, setShowBrushSize] = useState(false)
  const [customColor, setCustomColor] = useState('#000000')
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false)

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB']

  const handleBack = () => {
    navigate('/mainpage')
  }

  const startDrawing = (e) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e) => {
    if (!isDrawing) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    if (currentTool === 'brush') {
      ctx.globalCompositeOperation = 'source-over'
      ctx.lineWidth = brushSize
      ctx.lineCap = 'round'
      ctx.strokeStyle = brushColor
      ctx.lineTo(x, y)
      ctx.stroke()
    } else if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineWidth = brushSize * 2
      ctx.lineCap = 'round'
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setCursorPos({ x, y })
    setShowCursor(true)
    draw(e)
  }

  const handleMouseLeave = () => {
    setShowCursor(false)
    stopDrawing()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // 배경색 다시 설정
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const saveDrawingToBackend = async (imageData, analysisResult = null) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate('/login');
      return false;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/drawings', {
        image: imageData,
        analysis_result: analysisResult
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        alert("그림이 성공적으로 저장되었습니다!");
        return true;
      } else {
        alert("그림 저장에 실패했습니다: " + response.data.error);
        return false;
      }
    } catch (error) {
      console.error("그림 저장 API 오류:", error);
      if (error.response?.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        navigate('/login');
      } else {
        alert("그림 저장 중 오류가 발생했습니다. 백엔드 서버가 실행 중인지 확인해주세요.");
      }
      return false;
    }
  };

  const saveDrawing = async () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL('image/png');
    await saveDrawingToBackend(imageData);
  };

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)

  const handleAnalysisClick = () => {
    setShowAnalysisModal(true);
  };

  const confirmAnalysis = async () => {
    setShowAnalysisModal(false);
    try {
      setIsAnalyzing(true);
      const canvas = canvasRef.current;
      const imageData = canvas.toDataURL('image/png');
      
      // 백엔드 API 호출하여 분석
      const analyzeResponse = await axios.post('http://localhost:5000/api/analyze', {
        image: imageData
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (analyzeResponse.data.success) {
        const analysisResult = analyzeResponse.data.analysis;
        
        // 분석 결과를 포함하여 그림 저장
        const saved = await saveDrawingToBackend(imageData, analysisResult);
        
        if (saved) {
          // 그린 그림을 로컬 스토리지에 저장
          localStorage.setItem('drawnImage', imageData);
          // 분석 결과를 로컬 스토리지에 저장
          localStorage.setItem('analysisResult', JSON.stringify(analysisResult));
          // 분석 페이지로 이동
          navigate('/draw/analysis');
        }
      } else {
        alert('분석에 실패했습니다: ' + analyzeResponse.data.error);
      }
    } catch (error) {
      console.error('분석 오류:', error);
      alert('분석 중 오류가 발생했습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const cancelAnalysis = () => {
    setShowAnalysisModal(false);
  };

  const selectColor = (color) => {
    setBrushColor(color)
    setShowPalette(false)
  }

  const addCustomColor = () => {
    setBrushColor(customColor)
    setShowCustomColorPicker(false)
    setShowPalette(false)
  }

  const selectBrushSize = (size) => {
    setBrushSize(size)
    setShowBrushSize(false)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // 캔버스 크기 설정 (더 크게)
    canvas.width = 400
    canvas.height = 680
    
    // 배경색 설정
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // 기본 설정
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  // 도구별 커서 스타일 생성
  const getCursorStyle = () => {
    if (currentTool === 'eraser') {
      return { cursor: 'crosshair' }
    } else if (currentTool === 'brush') {
      return { cursor: 'crosshair' }
    }
    return { cursor: 'crosshair' }
  }

  // 커서 위치 추적을 위한 상태
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [showCursor, setShowCursor] = useState(false)

  return (
    <>
      {/* 상단 저장 버튼 */}
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        right: '20px', 
        zIndex: 10 
      }}>
        <button 
          onClick={saveDrawing}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: 'rgb(39, 192, 141)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '20px', 
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          저장하기
        </button>
      </div>

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
      
      {/* 메인 그리기 영역 */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        padding: '20px',
        minHeight: '100vh',
        boxSizing: 'border-box',
        position: 'relative'
      }}>
        {/* 집 유형 표시 */}
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
          집
        </div>

        {/* 캔버스 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: '30px',
          marginTop: '120px',
          position: 'relative'
        }}>
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDrawing}
            onMouseLeave={handleMouseLeave}
            style={{
              border: '1px solid #000',
              borderRadius: '10px',
              cursor: 'none',
              backgroundColor: '#CEF4E7',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
          />
          
          {/* 커스텀 커서 */}
          {showCursor && (
            <div
              style={{
                position: 'absolute',
                left: cursorPos.x - brushSize,
                top: cursorPos.y - brushSize,
                width: brushSize * 2,
                height: brushSize * 2,
                borderRadius: currentTool === 'eraser' ? '0%' : '50%',
                border: `2px solid ${currentTool === 'eraser' ? 'red' : brushColor}`,
                backgroundColor: 'transparent',
                pointerEvents: 'none',
                zIndex: 10,
                transition: 'none'
              }}
            />
          )}
          
        </div>
        
        {/* 하단 도구 바 - 고정 위치 */}
        <div style={{ 
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', 
          justifyContent: 'center', 
          gap: '15px', 
          alignItems: 'center',
          backgroundColor: 'rgb(39, 192, 141)',
          padding: '15px 20px',
          borderRadius: '25px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          zIndex: 100
        }}>
          {/* 붓 버튼 */}
          <button 
            onClick={() => setCurrentTool('brush')}
            style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '50%', 
              border: currentTool === 'brush' ? '3px solid #3a9d1f' : '1px solid #ccc',
              backgroundColor: currentTool === 'brush' ? '#e8f5e8' : 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}
          >
            <img src="/src/imgdata/icon/PAINTBRUSH.png" alt="붓" style={{ width: '32px', height: '32px' }} />
          </button>
          
          {/* 지우개 버튼 */}
          <button 
            onClick={() => setCurrentTool('eraser')}
            style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '50%', 
              border: currentTool === 'eraser' ? '3px solid #3a9d1f' : '1px solid #ccc',
              backgroundColor: currentTool === 'eraser' ? '#e8f5e8' : 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}
          >
            <img src="/src/imgdata/icon/eraser.png" alt="지우개" style={{ width: '32px', height: '32px' }} />
          </button>
          
          {/* 팔레트 버튼 */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowPalette(!showPalette)}
              style={{ 
                width: '50px', 
                height: '50px', 
                borderRadius: '50%', 
                border: '1px solid #ccc',
                backgroundColor: '#F9FAF9',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
            >
              <img src="/src/imgdata/icon/PALLETE.png" alt="팔레트" style={{ width: '32px', height: '32px' }} />
            </button>
            
            {/* 팔레트 드롭다운 */}
            {showPalette && (
              <div style={{
                position: 'absolute',
                bottom: '70px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#F9FAF9',
                border: '1px solid #ccc',
                borderRadius: '10px',
                padding: '15px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                zIndex: 200,
                minWidth: '240px',
                maxWidth: '280px'
              }}>
                {/* 기본 색상들 */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(5, 1fr)', 
                  gap: '8px',
                  justifyItems: 'center'
                }}>
                  {colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => selectColor(color)}
                      style={{
                        width: '35px',
                        height: '35px',
                        backgroundColor: color,
                        border: brushColor === color ? '3px solid #3a9d1f' : '2px solid #ddd',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.1)'
                        e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)'
                        e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    />
                  ))}
                </div>
                
                {/* 구분선 */}
                <div style={{ 
                  height: '1px', 
                  backgroundColor: '#eee', 
                  margin: '5px 0' 
                }} />
                
                {/* 사용자 지정 색상 */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  justifyContent: 'center'
                }}>
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    style={{
                      width: '45px',
                      height: '35px',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  />
                  <button
                    onClick={addCustomColor}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'rgb(39, 192, 141)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgb(35, 173, 127)'
                      e.target.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'rgb(39, 192, 141)'
                      e.target.style.transform = 'translateY(0)'
                    }}
                  >
                    추가
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* 분석 버튼 */}
          <button 
            onClick={handleAnalysisClick}
            disabled={isAnalyzing}
            style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '50%', 
              border: '1px solid #ccc',
              backgroundColor: isAnalyzing ? '#f0f0f0' : '#CEF4E7',
              cursor: isAnalyzing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              opacity: isAnalyzing ? 0.6 : 1
            }}
          >
            <img src="/src/imgdata/icon/IDEA.png" alt="분석" style={{ width: '32px', height: '32px' }} />
          </button>
        </div>
        
        {/* 브러시 크기 표시 - 상단에 배치 */}
        <div style={{ 
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '12px', 
          color: '#666',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '8px 15px',
          borderRadius: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 100
        }}>
          <span>브러시: {brushSize}px</span>
          <input 
            type="range" 
            min="1" 
            max="20" 
            value={brushSize} 
            onChange={(e) => setBrushSize(e.target.value)}
            style={{ width: '80px' }}
          />
        </div>

        {/* 분석 확인 모달 */}
        {showAnalysisModal && (
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
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '15px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              textAlign: 'center',
              maxWidth: '400px',
              width: '90%'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                marginBottom: '20px',
                color: '#333'
              }}>
                분석을 실시하시겠습니까?
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '25px',
                lineHeight: '1.5'
              }}>
                그림을 분석하여 심리 상태를 확인할 수 있습니다.
              </p>
              <div style={{
                display: 'flex',
                gap: '15px',
                justifyContent: 'center'
              }}>
                <button
                  onClick={cancelAnalysis}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f0f0f0',
                    color: '#333',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  취소
                </button>
                <button
                  onClick={confirmAnalysis}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'rgb(39, 192, 141)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  분석하기
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  )
}

export default Home
