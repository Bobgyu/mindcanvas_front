import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Fillcanvas() {
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushSize, setBrushSize] = useState(10)
  const [selectedColor, setSelectedColor] = useState('#ff6b6b')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showBrushSize, setShowBrushSize] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const [zoom, setZoom] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })
  const [currentTool, setCurrentTool] = useState('brush') // 'brush' 또는 'eraser'
  const [originalImageData, setOriginalImageData] = useState(null)
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [showCursor, setShowCursor] = useState(false)

  // 색상 팔레트
  const colorPalette = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
    '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
    '#10ac84', '#ee5a24', '#0984e3', '#6c5ce7', '#a29bfe',
    '#fd79a8', '#fdcb6e', '#e17055', '#81ecec', '#74b9ff',
    '#000000', '#ffffff', '#636e72', '#b2bec3', '#ddd'
  ]

  useEffect(() => {
    // localStorage에서 선택된 이미지 정보 가져오기
    const savedImage = localStorage.getItem('selectedColorImage')
    if (savedImage) {
      const imageData = JSON.parse(savedImage)
      setSelectedImage(imageData)
    } else {
      // 이미지가 없으면 갤러리로 돌아가기
      navigate('/draw/colorfill')
    }
  }, [navigate])

  useEffect(() => {
    if (selectedImage) {
      // 이어서 색칠하기인 경우 기존 색칠 데이터 로드
      if (selectedImage.isContinue && selectedImage.coloredImage) {
        loadColoredImage(selectedImage.coloredImage)
      } else {
        loadImageToCanvas()
      }
    }
  }, [selectedImage])

  // 캔버스 최적화 설정
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // 캔버스 성능 최적화
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
      }
    }
  }, [])

  const loadImageToCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    const img = new Image()
    img.onload = () => {
      // 캔버스 크기를 이미지에 맞게 조정
      const maxWidth = 800
      const maxHeight = 600
      let { width, height } = img
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width *= ratio
        height *= ratio
      }
      
      canvas.width = width
      canvas.height = height
      setCanvasSize({ width, height })
      
      // 이미지를 캔버스에 그리기
      ctx.drawImage(img, 0, 0, width, height)
      
      // 원본 이미지 데이터 저장 (지우개 기능을 위해)
      const imageData = ctx.getImageData(0, 0, width, height)
      setOriginalImageData(imageData)
    }
    img.src = `/src/imgdata/colorimg/${selectedImage.filename}`
  }

  const loadColoredImage = (coloredImageData) => {
    if (!coloredImageData) {
      console.error('색칠 이미지 데이터가 없습니다.')
      return
    }
    
    const canvas = canvasRef.current
    if (!canvas) {
      console.error('캔버스가 아직 준비되지 않았습니다.')
      return
    }
    
    const ctx = canvas.getContext('2d')
    
    // 먼저 원본 이미지를 로드
    const originalImg = new Image()
    originalImg.onload = () => {
      // 캔버스 크기를 이미지에 맞게 조정
      const maxWidth = 800
      const maxHeight = 600
      let { width, height } = originalImg
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width *= ratio
        height *= ratio
      }
      
      canvas.width = width
      canvas.height = height
      setCanvasSize({ width, height })
      
      // 원본 이미지를 캔버스에 그리기 (선만 있는 상태)
      ctx.drawImage(originalImg, 0, 0, width, height)
      
      // 원본 이미지 데이터를 저장 (지우개 기능을 위해) - 색칠하기 전에 저장
      const originalImageData = ctx.getImageData(0, 0, width, height)
      setOriginalImageData(originalImageData)
      
      // 그 다음 색칠된 이미지를 로드
      const coloredImg = new Image()
      coloredImg.onload = () => {
        try {
          // 색칠된 이미지를 캔버스에 그리기
          ctx.drawImage(coloredImg, 0, 0, width, height)
        } catch (error) {
          console.error('색칠 이미지 로드 중 오류:', error)
        }
      }
      coloredImg.onerror = () => {
        console.error('색칠 이미지 로드 실패')
      }
      coloredImg.src = coloredImageData
    }
    originalImg.onerror = () => {
      console.error('원본 이미지 로드 실패')
    }
    originalImg.src = `/src/imgdata/colorimg/${selectedImage.filename}`
  }

  const startDrawing = (e) => {
    // passive 이벤트 리스너 문제 해결
    if (e.cancelable) {
      e.preventDefault()
    }
    if (e.button === 0) { // 왼쪽 마우스 버튼만 그리기
      setIsDrawing(true)
      draw(e)
    } else if (e.button === 1 || e.button === 2) { // 가운데 또는 오른쪽 버튼은 팬
      setIsPanning(true)
      setLastPanPoint({ x: e.clientX, y: e.clientY })
    }
  }

  const draw = (e) => {
    if (!isDrawing) return
    // passive 이벤트 리스너 문제 해결
    if (e.cancelable) {
      e.preventDefault()
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    
    // 캔버스 중심점 기준으로 좌표 계산
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    // 마우스 위치를 캔버스 중심점 기준으로 변환
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY
    
    // 줌과 팬을 고려한 실제 캔버스 좌표 계산
    const x = (mouseX - panOffset.x) / zoom + canvas.width / 2
    const y = (mouseY - panOffset.y) / zoom + canvas.height / 2

    // 캔버스 경계 체크를 더 관대하게 설정 (브러시 크기만큼 여유를 둠)
    const margin = brushSize
    if (x < -margin || x >= canvas.width + margin || y < -margin || y >= canvas.height + margin) {
      return
    }

    if (currentTool === 'brush') {
      // 브러시 모드
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = selectedColor
      ctx.lineWidth = brushSize
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      ctx.lineTo(x, y)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x, y)
    } else if (currentTool === 'eraser') {
      // 지우개 모드 - 원본 이미지로 복원
      if (originalImageData) {
        // 현재 캔버스의 이미지 데이터 가져오기
        const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const currentData = currentImageData.data
        const originalData = originalImageData.data
        
        // 지우개 영역의 픽셀들을 원본으로 복원
        const radius = brushSize / 2
        const startX = Math.max(0, Math.floor(x - radius))
        const endX = Math.min(canvas.width, Math.ceil(x + radius))
        const startY = Math.max(0, Math.floor(y - radius))
        const endY = Math.min(canvas.height, Math.ceil(y + radius))
        
        for (let py = startY; py < endY; py++) {
          for (let px = startX; px < endX; px++) {
            const distance = Math.sqrt((px - x) ** 2 + (py - y) ** 2)
            if (distance <= radius) {
              const index = (py * canvas.width + px) * 4
              // 원본 이미지의 픽셀 값으로 복원
              currentData[index] = originalData[index]     // R
              currentData[index + 1] = originalData[index + 1] // G
              currentData[index + 2] = originalData[index + 2] // B
              currentData[index + 3] = originalData[index + 3] // A
            }
          }
        }
        
        // 수정된 이미지 데이터를 캔버스에 다시 그리기
        ctx.putImageData(currentImageData, 0, 0)
      }
    }
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

  const handleMouseLeave = () => {
    setShowCursor(false)
    stopDrawing()
  }

  const handleMouseMove = (e) => {
    // passive 이벤트 리스너 문제 해결
    if (e.cancelable) {
      e.preventDefault()
    }
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    
    // 캔버스 중심점 기준으로 좌표 계산
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    // 마우스 위치를 캔버스 중심점 기준으로 변환
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY
    
    // 줌과 팬을 고려한 실제 캔버스 좌표 계산
    const canvasX = (mouseX - panOffset.x) / zoom + canvas.width / 2
    const canvasY = (mouseY - panOffset.y) / zoom + canvas.height / 2
    
    setCursorPos({ x: canvasX, y: canvasY })
    setShowCursor(true)
    
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x
      const deltaY = e.clientY - lastPanPoint.y
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }))
      setLastPanPoint({ x: e.clientX, y: e.clientY })
    } else if (isDrawing) {
      draw(e)
    }
  }

  const handleWheel = (e) => {
    // passive 이벤트 리스너 문제 해결
    if (e.cancelable) {
      e.preventDefault()
    }
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(0.1, Math.min(5, zoom * delta))
    
    // 줌 중심점을 마우스 위치로 설정
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY
    
    // 줌 중심점을 고려한 팬 오프셋 조정
    const zoomRatio = newZoom / zoom
    setPanOffset(prev => ({
      x: prev.x + mouseX * (1 - zoomRatio),
      y: prev.y + mouseY * (1 - zoomRatio)
    }))
    
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

  const clearCanvas = () => {
    if (selectedImage) {
      // 이어서 색칠하기인 경우 기존 색칠 데이터로 초기화
      if (selectedImage.isContinue && selectedImage.coloredImage) {
        loadColoredImage(selectedImage.coloredImage)
      } else {
        loadImageToCanvas()
      }
      setZoom(1)
      setPanOffset({ x: 0, y: 0 })
      setCurrentTool('brush') // 초기화 시 브러시 모드로 전환
    }
  }

  const saveCanvas = async () => {
    const canvas = canvasRef.current
    const imageData = canvas.toDataURL('image/png')
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert("로그인이 필요합니다.");
        navigate('/login');
        return;
      }

      // 이어서 색칠하기인 경우 기존 그림 업데이트
      if (selectedImage && selectedImage.isContinue && selectedImage.id) {
        const response = await axios.put(`http://localhost:5000/api/drawings/${selectedImage.id}`, {
          image: imageData
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          alert("그림이 성공적으로 저장되었습니다!");
          navigate('/mypage/gallery');
        } else {
          alert("그림 저장에 실패했습니다: " + response.data.error);
        }
      } else {
        // 새로운 색칠하기인 경우 새로 저장
        const response = await axios.post('http://localhost:5000/api/colored-drawings', {
          image: imageData,
          drawing_type: 'colored'
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          alert("색칠한 그림이 성공적으로 저장되었습니다!");
          navigate('/mypage/gallery');
        } else {
          alert("그림 저장에 실패했습니다: " + response.data.error);
        }
      }
    } catch (error) {
      console.error("색칠 그림 저장 API 오류:", error);
      if (error.response?.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        navigate('/login');
      } else {
        alert("그림 저장 중 오류가 발생했습니다. 백엔드 서버가 실행 중인지 확인해주세요.");
      }
    }
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    const link = document.createElement('a')
    link.download = `${selectedImage.name}_colored.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const goBack = () => {
    navigate('/draw/colorfill')
  }

  if (!selectedImage) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>이미지를 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="fillcanvas-container">
      <div className="canvas-header">
        <div className="header-left">
          <button className="back-button" onClick={goBack}>
            <img src="/src/imgdata/icon/backarrow.png" alt="뒤로가기" style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
        
        <div className="header-center">
          <div className="zoom-controls">
            <button className="zoom-button" onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}>
              -
            </button>
            <span className="zoom-display">{Math.round(zoom * 100)}%</span>
            <button className="zoom-button" onClick={() => setZoom(Math.min(5, zoom + 0.1))}>
              +
            </button>
            <button className="zoom-button reset" onClick={resetZoom}>
              리셋
            </button>
          </div>
          
        </div>

        <div className="header-right">
          <button className="action-button clear" onClick={clearCanvas}>
            초기화
          </button>
          <button className="action-button save" onClick={saveCanvas}>
            저장
          </button>
        </div>
      </div>

      <div className="canvas-workspace">
        <div className="canvas-container">
          {/* 네비게이션 컨트롤 (캔버스 우측 상단에 겹쳐서 배치) */}
          <div className="navigation-controls">
            <button className="nav-button" onClick={() => moveCanvas('up')} title="위로 이동">
              ↑
            </button>
            <div className="nav-row">
              <button className="nav-button" onClick={() => moveCanvas('left')} title="왼쪽으로 이동">
                ←
              </button>
              <button className="nav-button" onClick={() => moveCanvas('right')} title="오른쪽으로 이동">
                →
              </button>
            </div>
            <button className="nav-button" onClick={() => moveCanvas('down')} title="아래로 이동">
              ↓
            </button>
          </div>
          
          <div 
            className="canvas-wrapper"
            style={{
              transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
              transformOrigin: 'center center'
            }}
            onMouseDown={(e) => e.cancelable && e.preventDefault()}
            onMouseMove={(e) => e.cancelable && e.preventDefault()}
            onMouseUp={(e) => e.cancelable && e.preventDefault()}
          >
            <canvas
              ref={canvasRef}
              className="drawing-canvas"
              onMouseDown={startDrawing}
              onMouseMove={handleMouseMove}
              onMouseUp={stopDrawing}
              onMouseLeave={handleMouseLeave}
              onWheel={handleWheel}
              onContextMenu={(e) => e.preventDefault()}
              onPointerDown={startDrawing}
              onPointerMove={handleMouseMove}
              onPointerUp={stopDrawing}
              onPointerLeave={handleMouseLeave}
              style={{
                width: canvasSize.width,
                height: canvasSize.height,
                cursor: 'none',
                touchAction: 'none'
              }}
            />
            
            {/* 커스텀 커서 */}
            {showCursor && (
              <div
                style={{
                  position: 'absolute',
                  left: cursorPos.x - brushSize / 2,
                  top: cursorPos.y - brushSize / 2,
                  width: brushSize,
                  height: brushSize,
                  borderRadius: currentTool === 'eraser' ? '0%' : '50%',
                  border: `2px solid ${currentTool === 'eraser' ? 'red' : selectedColor}`,
                  backgroundColor: 'transparent',
                  pointerEvents: 'none',
                  zIndex: 10,
                  transition: 'none',
                  transform: `scale(${1/zoom})` // 줌에 반비례하여 커서 크기 조정
                }}
              />
            )}
          </div>
        </div>
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
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => {
              setCurrentTool('brush')
              setShowBrushSize(!showBrushSize)
              setShowColorPicker(false)
            }}
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
          
          {/* 브러시 크기 드롭다운 */}
          {showBrushSize && (
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
              minWidth: '200px'
            }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 'bold', 
                textAlign: 'center',
                color: '#333'
              }}>
                브러시 크기: {brushSize}px
              </div>
              <input 
                type="range" 
                min="1" 
                max="50" 
                value={brushSize} 
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                style={{ 
                  width: '100%',
                  height: '6px',
                  borderRadius: '3px',
                  background: '#ddd',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '8px',
                justifyItems: 'center'
              }}>
                {[1, 3, 5, 8, 10, 12, 15, 20].map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setBrushSize(size)
                      setShowBrushSize(false)
                    }}
                    style={{
                      width: '35px',
                      height: '35px',
                      borderRadius: '50%',
                      border: brushSize === size ? '3px solid #3a9d1f' : '2px solid #ddd',
                      backgroundColor: brushSize === size ? '#e8f5e8' : '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
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
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
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
            onClick={() => setShowColorPicker(!showColorPicker)}
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
          {showColorPicker && (
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
                {colorPalette.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(color)}
                    style={{
                      width: '35px',
                      height: '35px',
                      backgroundColor: color,
                      border: selectedColor === color ? '3px solid #3a9d1f' : '2px solid #ddd',
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
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
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
                  onClick={() => setShowColorPicker(false)}
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
                  선택
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .fillcanvas-container {
          height: 910px;
          background: linear-gradient(135deg, rgb(39, 192, 141) 0%, #30E8AB 100%);
          padding: 15px;
          overflow: hidden;
          border-radius: 25px;
          margin: 10px;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          color: white;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid rgba(255, 255, 255, 0.3);
          border-top: 5px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .canvas-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          color: white;
          padding: 0 20px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
          position: relative;
        }

        .header-center {
          display: flex;
          align-items: center;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
        }

        .back-button {
          position: absolute;
          left: -30px;
          top: -30px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s ease;
          white-space: nowrap;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateX(-5px);
        }


        .zoom-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.2);
          padding: 8px 12px;
          border-radius: 20px;
        }

        .zoom-button {
          background: rgba(255, 255, 255, 0.3);
          border: none;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .zoom-button:hover {
          background: rgba(255, 255, 255, 0.5);
          transform: scale(1.1);
        }

        .zoom-button.reset {
          width: auto;
          padding: 0 12px;
          border-radius: 15px;
          font-size: 12px;
        }

        .zoom-display {
          color: white;
          font-weight: bold;
          min-width: 50px;
          text-align: center;
        }

        .navigation-controls {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          backgroundColor: 'rgba(255, 255, 255, 0.3)';
          padding: 8px;
          border-radius: 15px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          z-index: 20;
        }

        .nav-row {
          display: flex;
          gap: 10px;
        }

        .nav-button {
          background: rgba(240, 240, 240, 0.5);
          border: 1px solid rgba(204, 204, 204, 0.5);
          color: #333;
          width: 35px;
          height: 35px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 18px;
          font-weight: bold;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-button:hover {
          background: rgba(255, 255, 255, 0.8);
          transform: scale(1.1);
        }

        .action-button {
          position: absolute;
          top: -30px;
          padding: 8px;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s ease;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
        }

        .action-button.clear {
          right: 40px;
          background: #ff6b6b;
          color: white;
        }

        .action-button.clear:hover {
          background: #ff5252;
          transform: scale(1.05);
        }

        .action-button.save {
          right: -10px;
          background: #CEF4E7;
          color: #111827;
        }

        .action-button.save:hover {
          background: #B8E8D1;
          transform: scale(1.05);
        }


        .canvas-workspace {
          display: flex;
          justify-content: center;
          align-items: center;
          max-width: 1000px;
          margin: 0 auto 20px auto;
          height: 720px;
        }


        .canvas-container {
          display: flex;
          justify-content: center;
          align-items: center;
          background: #F9FAF9;
          border-radius: 25px;
          padding: 15px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          position: relative;
          width: 100%;
          height: 720px;
        }

        .canvas-wrapper {
          transition: transform 0.1s ease;
        }

        .drawing-canvas {
          border: 2px solid #ddd;
          border-radius: 20px;
          cursor: crosshair;
          background: white;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          display: block;
        }

        .drawing-canvas:active {
          cursor: grabbing;
        }

        @media (max-width: 768px) {
          .canvas-workspace {
            min-height: 300px;
          }

          .canvas-container {
            height: 400px;
          }

          .canvas-header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
            padding: 0 10px;
          }

          .header-left {
            flex-direction: column;
            gap: 10px;
          }

          .header-right {
            flex-direction: column;
            gap: 10px;
          }

          .canvas-header h1 {
            font-size: 1.5rem;
          }

          .back-button {
            position: relative;
            left: auto;
            top: auto;
          }

          .toolbar {
            margin: 0 10px;
          }
        }
      `}</style>
    </div>
  )
}

export default Fillcanvas
