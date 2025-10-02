import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function MyGallery() {
  const [drawings, setDrawings] = useState([]);
  const [error, setError] = useState('');
  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const navigate = useNavigate();

  // localStorage에서 실제 사용자 ID 가져오기
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchDrawings = async () => {
      if (!userId) {
        setError('로그인이 필요합니다.');
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/drawings/${userId}`);
        if (response.data.success) {
          setDrawings(response.data.drawings);
        }
      } catch (err) {
        console.error("그림 가져오기 오류:", err);
        setError('그림을 가져오는 중 오류가 발생했습니다.');
      }
    };

    fetchDrawings();
  }, [userId, navigate]);

  const handleThumbnailClick = (drawing) => {
    // 분석된 그림이면 상세보기, 아니면 이어서 그리기
    if (drawing.analysis_result) {
      setSelectedDrawing(drawing);
    } else {
      // 이어서 그리기 - 선택된 이미지 정보를 localStorage에 저장하고 캔버스 페이지로 이동
      const imageData = {
        id: drawing.id,
        image: drawing.image,
        isContinue: true // 이어서 그리기 플래그
      };
      localStorage.setItem('selectedColorImage', JSON.stringify(imageData));
      navigate('/draw/fillcanvas');
    }
  };

  const closeDetail = () => {
    setSelectedDrawing(null);
  };

  return (
    <div className="w-[29rem] h-[58rem] rounded-3xl bg-white flex flex-col">
      <header className="w-full shadow-sm py-4 px-6 flex items-center justify-between">
        <button className="text-gray-600" onClick={() => navigate('/mypage')}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <h1 className="text-xl font-bold">내 그림 갤러리</h1>
        <div className="w-6"></div>
      </header>

      <main className="flex-grow p-6">
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {drawings.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-gray-500">아직 저장된 그림이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {drawings.map((drawing) => (
              <div 
                key={drawing.id} 
                className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow relative border-2 border-gray-400"
                onClick={() => handleThumbnailClick(drawing)}
              >
                <img 
                  src={drawing.image} 
                  alt={`Drawing ${drawing.id}`} 
                  className="w-full h-full object-cover"
                />
                {/* 분석된 그림에만 "분석" 표시 */}
                {drawing.analysis_result && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    분석
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                  {new Date(drawing.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 상세보기 모달 */}
        {selectedDrawing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">그림 상세보기</h2>
                <button 
                  onClick={closeDetail}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <img 
                src={selectedDrawing.image} 
                alt={`Drawing ${selectedDrawing.id}`} 
                className="w-full h-auto rounded-lg mb-4"
              />
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">저장일: {new Date(selectedDrawing.created_at).toLocaleString()}</p>
              </div>

              {selectedDrawing.analysis_result ? (
                <div className="border-t pt-4">
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <h3 className="font-semibold text-lg">심리 분석 결과</h3>
                  </div>
                  
                  {/* 전체 점수와 위험도 */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center mb-2">
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                        <p className="text-sm font-medium text-blue-700">총 점수</p>
                      </div>
                      <p className="text-2xl font-bold text-blue-800">{selectedDrawing.analysis_result.total_score}</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                      <div className="flex items-center mb-2">
                        <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                        <p className="text-sm font-medium text-red-700">위험도</p>
                      </div>
                      <p className="text-2xl font-bold text-red-800">{selectedDrawing.analysis_result.risk_level}</p>
                    </div>
                  </div>
                  
                  {/* 상세 분석 결과 */}
                  {selectedDrawing.analysis_result.objects && Object.entries(selectedDrawing.analysis_result.objects).map(([objType, objData]) => (
                    <div key={objType} className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-lg text-gray-800">{objData.label}</h4>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                          점수: {objData.score}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        {objData.interpretations && objData.interpretations.map((interp, index) => (
                          <div key={index} className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-gray-800">{interp.feature}</h5>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                interp.severity === '높음' ? 'bg-red-100 text-red-800' :
                                interp.severity === '보통' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                심각도: {interp.severity}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">{interp.interpretation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <p className="text-gray-500 text-lg font-medium">아직 분석되지 않은 그림입니다</p>
                      <p className="text-gray-400 text-sm mt-1">분석을 원하시면 해당 그림을 분석해주세요</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default MyGallery;
