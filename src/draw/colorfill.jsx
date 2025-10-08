import { useState, useEffect } from 'react'
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

  // 토큰 검증 (로컬 검증)
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    // JWT 토큰을 로컬에서 검증
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      if (tokenData.exp < currentTime) {
        // 토큰이 만료되었으면 로그인 페이지로
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        navigate('/login');
        return;
      }
    } catch (error) {
      // 토큰 파싱 오류 시 로그인 페이지로
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      navigate('/login');
      return;
    }
  }, [navigate]);

  const goBack = () => {
    navigate('/mainpage')
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
          <img src="/src/imgdata/icon/backarrow.png" alt="뒤로가기" style={{ width: '20px', height: '20px' }} />
        </button>
        <h1>색칠하기 갤러리</h1>
        <p>색칠하고 싶은 그림을 선택해주세요</p>
      </div>

      <div className="gallery-wrapper">
        <div className="scrollable-content">
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
        </div>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-[20px] p-5 max-w-[400px] w-[90%] text-center animate-[modalSlideIn_0.3s_ease]">
            <h2 className="text-[#333] mb-4 text-xl">{selectedImage.name}</h2>
            <img 
              src={`/src/imgdata/colorimg/${selectedImage.filename}`}
              alt={selectedImage.name}
              className="w-full max-h-[200px] object-cover rounded-[10px] mb-2.5"
            />
            <p className="text-[#666] mb-5 leading-[1.4] text-sm">{selectedImage.description}</p>
            <div className="flex gap-2.5 justify-center">
              <button 
                className="bg-[#4CAF50] border-none text-white px-4 py-2 rounded-[20px] cursor-pointer text-sm transition-all duration-300 hover:bg-[#45a049] hover:scale-105"
                onClick={() => startColoring(selectedImage)}
              >
                색칠하기 시작
              </button>
              <button 
                className="bg-[#f44336] border-none text-white px-4 py-2 rounded-[20px] cursor-pointer text-sm transition-all duration-300 hover:bg-[#da190b] hover:scale-105"
                onClick={() => setSelectedImage(null)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .colorfill-container {
          height: 880px;
          background: linear-gradient(135deg, rgb(39, 192, 141) 0%, #30E8AB 100%);
          padding: 15px;
          border-radius: 25px;
          margin: 20px;
          overflow: hidden;
          box-sizing: border-box;
          max-width: calc(100vw - 60px);
          position: relative;
          clip-path: inset(0);
        }

        .colorfill-container::-webkit-scrollbar {
          width: 8px;
        }

        .colorfill-container::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }

        .colorfill-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }

        .colorfill-container::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        .gallery-wrapper {
          width: 100%;
          height: 720px;
          overflow-y: auto;
          position: relative;
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.1);
          padding: 10px;
          box-sizing: border-box;
        }

        .gallery-wrapper::-webkit-scrollbar {
          width: 8px;
        }

        .gallery-wrapper::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        .gallery-wrapper::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }

        .gallery-wrapper::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        .scrollable-content {
          height: auto;
          overflow: visible;
          padding: 0;
          margin: 0;
          width: 100%;
        }

        .scrollable-content::-webkit-scrollbar {
          width: 8px;
        }

        .scrollable-content::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }

        .scrollable-content::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }

        .scrollable-content::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        .colorfill-header {
          text-align: center;
          margin-bottom: 10px;
          color: white;
          position: sticky;
          top: 0;
          background: linear-gradient(135deg, rgb(39, 192, 141) 0%, #30E8AB 100%);
          padding: 10px 0;
          z-index: 10;
          border-radius: 20px;
          margin: 0 0 10px 0;
        }

        .back-button {
          position: absolute;
          left: 0px;
          top: 0px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .colorfill-header h1 {
          font-size: 2.2rem;
          margin: 20px 0 10px 0;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .colorfill-header p {
          font-size: 1.2rem;
          opacity: 0.9;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 8px;
          max-width: 100%;
          margin: 0;
          padding: 0;
          padding-bottom: 15px;
          height: fit-content;
          width: 100%;
          box-sizing: border-box;
        }

        .gallery-item {
          cursor: pointer;
          transition: transform 0.3s ease;
          overflow: hidden;
          border-radius: 10px;
        }

        .gallery-item:hover {
          transform: translateY(-10px);
        }

        .image-container {
          position: relative;
          border-radius: 25px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          background: white;
        }

        .gallery-image {
          width: 100%;
          height: 200px;
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
          background: rgb(39, 192, 141);
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .select-button:hover {
          background: #30E8AB;
          transform: scale(1.05);
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
