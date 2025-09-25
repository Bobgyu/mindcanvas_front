import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Colorfill() {
  const navigate = useNavigate()
  
  // 색칠하기 이미지 목록
  const colorImages = [
    { id: 1, name: '호작도', filename: 'hojakdo.png', description: '조선시대 화가 김홍도의 호작도' },
    { id: 2, name: '미인도', filename: 'miindo.png', description: '조선시대 미인도' },
    { id: 3, name: '천지창조', filename: 'thecreation.png', description: '미켈란젤로의 천지창조' },
    { id: 4, name: '진주 귀걸이를 한 소녀', filename: 'pearl.png', description: '베르메르의 진주 귀걸이를 한 소녀' },
    { id: 5, name: '피카소', filename: 'picaso.png', description: '피카소의 작품' },
    { id: 6, name: '해바라기', filename: 'sunflower.png', description: '반 고흐의 해바라기' },
    { id: 7, name: '모나리자', filename: 'monarisa.png', description: '레오나르도 다 빈치의 모나리자' },
    { id: 8, name: '별이 빛나는 밤', filename: 'starnight.png', description: '반 고흐의 별이 빛나는 밤' }
  ]

  const [selectedImage, setSelectedImage] = useState(null)

  const goBack = () => {
    navigate('/')
  }

  const selectImage = (image) => {
    setSelectedImage(image)
  }

  const startColoring = (image) => {
    // 선택된 이미지 정보를 localStorage에 저장하고 캔버스 페이지로 이동
    localStorage.setItem('selectedColorImage', JSON.stringify(image))
    navigate('/draw/fillcanvas')
  }

  return (
    <div className="colorfill-container">
      <div className="colorfill-header">
        <button className="back-button" onClick={goBack}>
          ← 뒤로가기
        </button>
        <h1>색칠하기 갤러리</h1>
        <p>색칠하고 싶은 그림을 선택해주세요</p>
      </div>

      <div className="gallery-grid">
        {colorImages.map((image) => (
          <div 
            key={image.id} 
            className="gallery-item"
            onClick={() => selectImage(image)}
          >
            <div className="image-container">
              <img 
                src={`/src/imgdata/colorimg/${image.filename}`}
                alt={image.name}
                className="gallery-image"
              />
              <div className="image-overlay">
                <div className="image-info">
                  <h3>{image.name}</h3>
                  <p>{image.description}</p>
                  <button className="select-button">선택하기</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className="selected-image-modal">
          <div className="modal-content">
            <h2>{selectedImage.name}</h2>
            <img 
              src={`/src/imgdata/colorimg/${selectedImage.filename}`}
              alt={selectedImage.name}
              className="modal-image"
            />
            <p>{selectedImage.description}</p>
            <div className="modal-buttons">
              <button 
                className="start-coloring"
                onClick={() => startColoring(selectedImage)}
              >
                색칠하기 시작
              </button>
              <button 
                className="close-modal"
                onClick={() => setSelectedImage(null)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .colorfill-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .colorfill-header {
          text-align: center;
          margin-bottom: 30px;
          color: white;
        }

        .back-button {
          position: absolute;
          left: 20px;
          top: 20px;
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

        .colorfill-header h1 {
          font-size: 2.5rem;
          margin: 20px 0 10px 0;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .colorfill-header p {
          font-size: 1.2rem;
          opacity: 0.9;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .gallery-item {
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .gallery-item:hover {
          transform: translateY(-10px);
        }

        .image-container {
          position: relative;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          background: white;
        }

        .gallery-image {
          width: 100%;
          height: 250px;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .gallery-item:hover .gallery-image {
          transform: scale(1.1);
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .gallery-item:hover .image-overlay {
          opacity: 1;
        }

        .image-info {
          text-align: center;
          color: white;
          padding: 20px;
        }

        .image-info h3 {
          font-size: 1.5rem;
          margin-bottom: 10px;
        }

        .image-info p {
          font-size: 0.9rem;
          margin-bottom: 15px;
          opacity: 0.9;
        }

        .select-button {
          background: #ff6b6b;
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .select-button:hover {
          background: #ff5252;
          transform: scale(1.05);
        }

        .selected-image-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          padding: 30px;
          max-width: 500px;
          width: 90%;
          text-align: center;
          animation: modalSlideIn 0.3s ease;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-content h2 {
          color: #333;
          margin-bottom: 20px;
        }

        .modal-image {
          width: 100%;
          max-height: 300px;
          object-fit: cover;
          border-radius: 10px;
          margin-bottom: 15px;
        }

        .modal-content p {
          color: #666;
          margin-bottom: 25px;
          line-height: 1.6;
        }

        .modal-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
        }

        .start-coloring {
          background: #4CAF50;
          border: none;
          color: white;
          padding: 12px 25px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .start-coloring:hover {
          background: #45a049;
          transform: scale(1.05);
        }

        .close-modal {
          background: #f44336;
          border: none;
          color: white;
          padding: 12px 25px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .close-modal:hover {
          background: #da190b;
          transform: scale(1.05);
        }

        @media (max-width: 768px) {
          .gallery-grid {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            padding: 0 10px;
          }

          .colorfill-header h1 {
            font-size: 2rem;
          }

          .back-button {
            position: relative;
            left: auto;
            top: auto;
            margin-bottom: 20px;
          }
        }
      `}</style>
    </div>
  )
}

export default Colorfill
