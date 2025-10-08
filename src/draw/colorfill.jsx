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
    <div className="w-[29rem] h-[58rem] rounded-3xl flex flex-col overflow-hidden bg-[rgb(206,244,231)]">
      {/* 뒤로가기 버튼 */}
      <div className="fixed top-5 left-5 z-[100]">
        <p onClick={goBack} className="cursor-pointer flex items-center">
          <img src="/src/imgdata/icon/backarrow.png" alt="뒤로가기" className="w-5 h-5" />
        </p>
      </div>

      {/* 색칠하기 갤러리 표시 */}
      <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-[#4A90E2] text-white px-4 py-2 rounded-[20px] text-sm font-bold z-[100]">
        색칠하기 갤러리
      </div>

      {/* 안내 문구 */}
      <div className="fixed top-[70px] left-1/2 transform -translate-x-1/2 text-[#333] text-xs font-normal z-[100] text-center">
        색칠하고 싶은 그림을 선택하세요.
      </div>

      {/* 메인 컨텐츠 */}
      <main className="flex-grow p-6 overflow-y-auto scrollbar-hide mt-[100px]">
        <div className="grid grid-cols-1 gap-6 p-0 max-w-[90%] mx-auto">
          {colorImages.map((image) => (
            <div 
              key={image.id} 
              className="cursor-pointer transition-transform duration-300 hover:-translate-y-1"
              onClick={() => selectImage(image)}
            >
              <div className="relative rounded-[15px] overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.2)] bg-white">
                <img 
                  src={`/src/imgdata/colorimg/${image.filename}`}
                  alt={image.name}
                  className="w-full h-[200px] object-cover object-[top_20%] transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 transition-opacity duration-300 hover:opacity-100">
                  <div className="text-center text-white p-2.5">
                    <h3 className="text-sm font-bold mb-1">{image.name}</h3>
                    <p className="text-xs mb-2 opacity-90 leading-tight">{image.description}</p>
                    <button className="px-3 py-1.5 bg-[rgb(39,192,141)] text-white border-none rounded-[15px] cursor-pointer text-xs transition-all duration-300 hover:bg-[rgb(50,220,160)] hover:scale-105">
                      선택하기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

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
        .scrollbar-hide {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-hide::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-hide::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        
        .scrollbar-hide::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
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
      `}</style>
    </div>
  )
}

export default Colorfill
