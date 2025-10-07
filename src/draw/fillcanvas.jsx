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

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    
    // 캔버스 내부 좌표로 변환 (줌과 팬 고려)
    const x = (e.clientX - rect.left - panOffset.x) / zoom
    const y = (e.clientY - rect.top - panOffset.y) / zoom

    // 캔버스 경계 체크
    if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
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
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // 커서 위치는 캔버스 내부 좌표로 설정 (draw 함수와 동일한 계산)
    const canvasX = (x - panOffset.x) / zoom
    const canvasY = (y - panOffset.y) / zoom
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
          alert("그림이 성공적으로 업데이트되었습니다!");
          navigate('/mypage/gallery');
        } else {
          alert("그림 업데이트에 실패했습니다: " + response.data.error);
        }
      } else {
        // 새로운 색칠하기인 경우 새로 저장
        const response = await axios.post('http://localhost:5000/api/colored-drawings', {
          image: imageData
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
            ← 뒤로가기
          </button>
          <h1>{selectedImage.name}</h1>
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
          
          {zoom > 1 && (
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
          )}
        </div>

        <div className="header-right">
          <button className="action-button clear" onClick={clearCanvas}>
            초기화
          </button>
          <button className="action-button save" onClick={saveCanvas}>
            {selectedImage && selectedImage.isContinue ? '업데이트' : '저장'}
          </button>
        </div>
      </div>

      <div className="canvas-workspace">
        <div className="canvas-container">
          <div 
            className="canvas-wrapper"
            style={{
              transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
              transformOrigin: 'center center'
            }}
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
              style={{
                width: canvasSize.width,
                height: canvasSize.height,
                cursor: 'none'
              }}
              willReadFrequently={true}
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
                  transition: 'none'
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="tool-section">
          <h3>도구 선택</h3>
          <div className="tool-buttons">
            <button
              className={`tool-button ${currentTool === 'brush' ? 'active' : ''}`}
              onClick={() => setCurrentTool('brush')}
            >
              🖌️ 브러시
            </button>
            <button
              className={`tool-button ${currentTool === 'eraser' ? 'active' : ''}`}
              onClick={() => setCurrentTool('eraser')}
            >
              🧽 지우개
            </button>
          </div>
        </div>

        <div className="tool-section">
          <h3>브러시 크기</h3>
          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="brush-slider"
          />
          <span className="brush-size-display">{brushSize}px</span>
        </div>

        <div className="tool-section">
          <h3>색상 선택</h3>
          <div className="color-palette">
            {colorPalette.map((color, index) => (
              <button
                key={index}
                className={`color-button ${selectedColor === color ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>
          <button
            className="custom-color-button"
            onClick={() => setShowColorPicker(!showColorPicker)}
          >
            사용자 정의 색상
          </button>
          {showColorPicker && (
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="color-picker"
            />
          )}
        </div>
      </div>

      <style jsx>{`
        .fillcanvas-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
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
        }

        .header-center {
          display: flex;
          align-items: center;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 10px;
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
          white-space: nowrap;
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateX(-5px);
        }

        .canvas-header h1 {
          font-size: 1.8rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          margin: 0;
          white-space: nowrap;
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
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          margin-left: 20px;
        }

        .nav-row {
          display: flex;
          gap: 10px;
        }

        .nav-button {
          background: rgba(255, 255, 255, 0.3);
          border: none;
          color: white;
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
          background: rgba(255, 255, 255, 0.5);
          transform: scale(1.1);
        }

        .action-button {
          padding: 10px 20px;
          border: none;
          border-radius: 25px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .action-button.clear {
          background: #ff6b6b;
          color: white;
        }

        .action-button.clear:hover {
          background: #ff5252;
          transform: scale(1.05);
        }

        .action-button.save {
          background: rgb(39, 192, 141);
          color: white;
        }

        .action-button.save:hover {
          background: rgb(35, 173, 127);
          transform: scale(1.05);
        }


        .canvas-workspace {
          display: flex;
          justify-content: center;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto 20px auto;
          min-height: 400px;
        }

        .toolbar {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 15px;
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .tool-section {
          margin-bottom: 25px;
        }

        .toolbar .tool-section:last-child {
          margin-bottom: 0;
        }

        .tool-section h3 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 1.1rem;
        }

        .tool-buttons {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .tool-button {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #ddd;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }

        .tool-button:hover {
          border-color: #4CAF50;
          background: #f0f8f0;
        }

        .tool-button.active {
          border-color: #4CAF50;
          background: #4CAF50;
          color: white;
        }

        .tool-button.active:hover {
          background: #45a049;
        }

        .brush-slider {
          width: 100%;
          margin-bottom: 10px;
        }

        .brush-size-display {
          display: block;
          text-align: center;
          color: #666;
          font-weight: bold;
        }

        .color-palette {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          margin-bottom: 15px;
        }

        .color-button {
          width: 35px;
          height: 35px;
          border: 3px solid transparent;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .color-button:hover {
          transform: scale(1.1);
        }

        .color-button.active {
          border-color: #333;
          transform: scale(1.2);
        }

        .custom-color-button {
          width: 100%;
          padding: 10px;
          background: #f0f0f0;
          border: 2px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .custom-color-button:hover {
          background: #e0e0e0;
        }

        .color-picker {
          width: 100%;
          height: 40px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 10px;
        }

        .canvas-container {
          display: flex;
          justify-content: center;
          align-items: center;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          position: relative;
          width: 100%;
          height: 500px;
        }

        .canvas-wrapper {
          transition: transform 0.1s ease;
        }

        .drawing-canvas {
          border: 2px solid #ddd;
          border-radius: 10px;
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
