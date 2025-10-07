import { useNavigate } from 'react-router-dom'
import { useRef, useState, useEffect } from 'react'
import axios from 'axios'

function Theme() {
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
  const [zoom, setZoom] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB']

  const handleBack = () => {
    navigate('/mainpage')
  }

  const startDrawing = (e) => {
    if (e.button === 0) { // 왼쪽 마우스 버튼만 그리기
      setIsDrawing(true)
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      const rect = canvas.getBoundingClientRect()
      // 확대/이동을 고려한 내부 좌표
      const x = (e.clientX - rect.left - panOffset.x) / zoom
      const y = (e.clientY - rect.top - panOffset.y) / zoom
      ctx.beginPath()
      ctx.moveTo(x, y)
    } else if (e.button === 1 || e.button === 2) { // 가운데 또는 오른쪽 버튼은 팬
      setIsPanning(true)
      setLastPanPoint({ x: e.clientX, y: e.clientY })
    }
  }

  const draw = (e) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    // 확대/이동을 고려한 내부 좌표
    const x = (e.clientX - rect.left - panOffset.x) / zoom
    const y = (e.clientY - rect.top - panOffset.y) / zoom
    // 경계 체크
    if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) return
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
    const xScreen = e.clientX - rect.left
    const yScreen = e.clientY - rect.top
    const x = (xScreen - panOffset.x) / zoom
    const y = (yScreen - panOffset.y) / zoom
    setCursorPos({ x, y })           // 내부 좌표 (그리기용)
    setCursorScreenPos({ x: xScreen, y: yScreen }) // 화면 좌표 (커서 렌더링용)
    setShowCursor(true)
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x
      const deltaY = e.clientY - lastPanPoint.y
      setPanOffset(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }))
      setLastPanPoint({ x: e.clientX, y: e.clientY })
    } else if (isDrawing) {
      draw(e)
    }
  }

  const handleMouseLeave = () => {
    setShowCursor(false)
    stopDrawing()
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      ctx.beginPath()
    }
    if (isPanning) {
      setIsPanning(false)
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // 배경색 다시 설정
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const saveDrawingToBackend = async (imageData) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate('/login');
      return false;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/drawings', {
        image: imageData
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

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(0.1, Math.min(5, zoom * delta))
    setZoom(newZoom)
  }

  const resetZoom = () => {
    setZoom(1)
    setPanOffset({ x: 0, y: 0 })
  }

  const moveCanvas = (direction) => {
    const moveDistance = 50
    switch (direction) {
      case 'up':
        setPanOffset(prev => ({ ...prev, y: prev.y + moveDistance }))
        break
      case 'down':
        setPanOffset(prev => ({ ...prev, y: prev.y - moveDistance }))
        break
      case 'left':
        setPanOffset(prev => ({ ...prev, x: prev.x + moveDistance }))
        break
      case 'right':
        setPanOffset(prev => ({ ...prev, x: prev.x - moveDistance }))
        break
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // 캔버스 크기 설정 (home.jsx와 동일한 크기로 고정)
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
  const [cursorScreenPos, setCursorScreenPos] = useState({ x: 0, y: 0 })
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
        {/* 테마 그리기 표시 */}
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
          테마 그리기
        </div>

        {/* 줌 컨트롤 */}
        <div style={{
          position: 'fixed',
          top: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '8px 12px',
          borderRadius: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 100
        }}>
          <button 
            onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              border: '1px solid #ccc',
              backgroundColor: '#f0f0f0',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            -
          </button>
          <span style={{ fontSize: '12px', fontWeight: 'bold', minWidth: '50px', textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button 
            onClick={() => setZoom(Math.min(5, zoom + 0.1))}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              border: '1px solid #ccc',
              backgroundColor: '#f0f0f0',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            +
          </button>
          <button 
            onClick={resetZoom}
            style={{
              padding: '4px 8px',
              borderRadius: '15px',
              border: '1px solid #ccc',
              backgroundColor: '#f0f0f0',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            리셋
          </button>
        </div>

        {/* 네비게이션 컨트롤 (줌이 1보다 클 때만 표시) */}
        {zoom > 1 && (
          <div style={{
            position: 'fixed',
            top: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '8px',
            borderRadius: '15px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            zIndex: 100
          }}>
            <button 
              onClick={() => moveCanvas('up')}
              style={{
                width: '35px',
                height: '35px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                backgroundColor: '#f0f0f0',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="위로 이동"
            >
              ↑
            </button>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => moveCanvas('left')}
                style={{
                  width: '35px',
                  height: '35px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  backgroundColor: '#f0f0f0',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="왼쪽으로 이동"
              >
                ←
              </button>
              <button 
                onClick={() => moveCanvas('right')}
                style={{
                  width: '35px',
                  height: '35px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  backgroundColor: '#f0f0f0',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="오른쪽으로 이동"
              >
                →
              </button>
            </div>
            <button 
              onClick={() => moveCanvas('down')}
              style={{
                width: '35px',
                height: '35px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                backgroundColor: '#f0f0f0',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="아래로 이동"
            >
              ↓
            </button>
          </div>
        )}

        {/* 캔버스 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: '30px',
          marginTop: '120px',
          position: 'relative',
          width: '400px',
          height: '680px',
          overflow: 'hidden'
        }}>
          <div 
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
              transformOrigin: 'top left',
              transition: 'transform 0.08s ease'
            }}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={handleMouseMove}
              onMouseUp={stopDrawing}
              onMouseLeave={handleMouseLeave}
              onWheel={handleWheel}
              onContextMenu={(e) => e.preventDefault()}
              style={{
                border: '1px solid #000',
                borderRadius: '10px',
                cursor: 'none',
                backgroundColor: '#CEF4E7',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}
            />
          </div>
          {/* 커스텀 커서 (컨테이너 고정 좌표 위에 렌더) */}
          {showCursor && (
            <div
              style={{
                position: 'absolute',
                left: cursorScreenPos.x - brushSize / 2,
                top: cursorScreenPos.y - brushSize / 2,
                width: brushSize,
                height: brushSize,
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
          padding: '15px 40px',
          borderRadius: '50px',
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
              backgroundColor: currentTool === 'brush' ? '#e8f5e8' : '#F9FAF9',
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
              backgroundColor: currentTool === 'eraser' ? '#e8f5e8' : '#F9FAF9',
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

      </div>
    </>
  )
}

export default Theme


