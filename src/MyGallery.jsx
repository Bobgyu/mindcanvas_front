import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function MyGallery() {
  const [drawings, setDrawings] = useState([]);
  const [error, setError] = useState('');
  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // 색칠하기 원본 이미지 목록
  const colorImages = [
    { id: 1, name: '호작도', filename: 'hojakdo.png', description: '조선시대 화가 김홍도의 호작도' },
    { id: 2, name: '미인도', filename: 'miindo.png', description: '조선시대 미인도' },
    { id: 3, name: '천지창조', filename: 'thecreation.png', description: '미켈란젤로의 천지창조' },
    { id: 4, name: '진주 귀걸이를 한 소녀', filename: 'pearl.png', description: '베르메르의 진주 귀걸이를 한 소녀' },
    { id: 5, name: '피카소', filename: 'picaso.png', description: '피카소의 작품' },
    { id: 6, name: '해바라기', filename: 'sunflower.png', description: '반 고흐의 해바라기' },
    { id: 7, name: '모나리자', filename: 'monarisa.png', description: '레오나르도 다 빈치의 모나리자' },
    { id: 8, name: '별이 빛나는 밤', filename: 'starnight.png', description: '반 고흐의 별이 빛나는 밤' }
  ];

  // 이미지 유사도를 계산하는 함수
  const calculateImageSimilarity = (img1, img2) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 두 이미지를 같은 크기로 리사이즈
    const size = 64;
    canvas.width = size;
    canvas.height = size;
    
    // 첫 번째 이미지 그리기
    ctx.drawImage(img1, 0, 0, size, size);
    const data1 = ctx.getImageData(0, 0, size, size).data;
    
    // 두 번째 이미지 그리기
    ctx.drawImage(img2, 0, 0, size, size);
    const data2 = ctx.getImageData(0, 0, size, size).data;
    
    // 픽셀 차이 계산
    let diff = 0;
    for (let i = 0; i < data1.length; i += 4) {
      const r1 = data1[i];
      const g1 = data1[i + 1];
      const b1 = data1[i + 2];
      const r2 = data2[i];
      const g2 = data2[i + 1];
      const b2 = data2[i + 2];
      
      diff += Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
    }
    
    // 유사도 점수 (낮을수록 유사)
    return diff / (size * size * 3 * 255);
  };

  // 색칠된 이미지에서 가장 유사한 원본 이미지 찾기
  const findMostSimilarOriginalImage = async (coloredImageData) => {
    return new Promise((resolve) => {
      const coloredImg = new Image();
      coloredImg.crossOrigin = 'anonymous';
      coloredImg.onload = async () => {
        let bestMatch = colorImages[0]; // 기본값
        let bestScore = Infinity;
        
        // 모든 원본 이미지와 비교
        const comparisons = colorImages.map(async (originalImage) => {
          return new Promise((resolve) => {
            const originalImg = new Image();
            originalImg.crossOrigin = 'anonymous';
            originalImg.onload = () => {
              const similarity = calculateImageSimilarity(coloredImg, originalImg);
              resolve({ image: originalImage, score: similarity });
            };
            originalImg.onerror = () => resolve({ image: originalImage, score: Infinity });
            originalImg.src = `/src/imgdata/colorimg/${originalImage.filename}`;
          });
        });
        
        const results = await Promise.all(comparisons);
        
        // 가장 유사한 이미지 찾기
        for (const result of results) {
          if (result.score < bestScore) {
            bestScore = result.score;
            bestMatch = result.image;
          }
        }
        
        resolve(bestMatch);
      };
      coloredImg.onerror = () => resolve(colorImages[0]); // 오류 시 기본값
      coloredImg.src = coloredImageData;
    });
  };

  const fetchDrawings = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get('http://localhost:5000/api/drawings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.data.success) {
        setDrawings(response.data.drawings);
        // 디버깅: 분석 결과가 있는 그림들 확인
        console.log('갤러리 그림들:', response.data.drawings.map(d => ({
          id: d.id,
          hasAnalysis: !!d.analysis_result,
          analysisResult: d.analysis_result,
          drawingType: d.drawing_type
        })));
      }
    } catch (err) {
      console.error("그림 가져오기 오류:", err);
      if (err.response?.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        navigate('/login');
      } else {
        setError('그림을 가져오는 중 오류가 발생했습니다.');
      }
    }
  };

  useEffect(() => {
    fetchDrawings();
  }, [navigate]);

  // location.state에서 selectedDrawingId가 있으면 해당 그림을 선택
  useEffect(() => {
    if (location.state && location.state.selectedDrawingId && drawings.length > 0) {
      const targetDrawing = drawings.find(drawing => drawing.id === location.state.selectedDrawingId);
      if (targetDrawing) {
        setSelectedDrawing(targetDrawing);
        console.log('선택된 그림:', targetDrawing);
        console.log('분석 결과:', targetDrawing.analysis_result);
        if (targetDrawing.analysis_result) {
          console.log('분석 결과 필드들:', Object.keys(targetDrawing.analysis_result));
          console.log('AI 분석 내용:', targetDrawing.analysis_result.ai_analysis);
          console.log('Speech 분석 내용:', targetDrawing.analysis_result.speech_analysis);
        }
      }
      // state를 클리어해서 다음 방문 시에는 선택되지 않도록
      navigate(location.pathname, { replace: true });
    }
  }, [drawings, location.state, navigate, location.pathname]);

  // 페이지 포커스 시 데이터 새로고침 (분석 완료 후 갤러리로 돌아올 때)
  useEffect(() => {
    const handleFocus = () => {
      // 분석 완료 플래그가 있으면 데이터 새로고침
      if (localStorage.getItem('analysisCompleted')) {
        fetchDrawings();
        localStorage.removeItem('analysisCompleted');
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleThumbnailClick = (drawing) => {
    // 모든 그림을 상세보기로 처리 (삭제 기능을 위해)
    console.log('선택된 그림:', drawing);
    console.log('분석 결과:', drawing.analysis_result);
    if (drawing.analysis_result) {
      console.log('분석 결과 필드들:', Object.keys(drawing.analysis_result));
      console.log('AI 분석 내용:', drawing.analysis_result.ai_analysis);
      console.log('Speech 분석 내용:', drawing.analysis_result.speech_analysis);
    }
    setSelectedDrawing(drawing);
  };

  const closeDetail = () => {
    setSelectedDrawing(null);
  };

  const handleDeleteDrawing = async (drawingId) => {
    if (!window.confirm('정말로 이 그림을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.delete(`http://localhost:5000/api/drawings/${drawingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        alert('그림이 삭제되었습니다.');
        // 상세보기 모달 닫기
        setSelectedDrawing(null);
        // 목록 새로고침
        fetchDrawings();
      } else {
        alert('그림 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('그림 삭제 오류:', error);
      if (error.response?.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        navigate('/login');
      } else {
        alert('그림 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="w-[29rem] h-[58rem] rounded-3xl flex flex-col" style={{backgroundColor: 'rgb(206, 244, 231)'}}>
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

      <main className="flex-grow p-6 overflow-y-auto scrollbar-hide">
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
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
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
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDeleteDrawing(selectedDrawing.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition-colors"
                  >
                    삭제
                  </button>
                  <button 
                    onClick={closeDetail}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <img 
                src={selectedDrawing.image} 
                alt={`Drawing ${selectedDrawing.id}`} 
                className="w-full h-auto rounded-lg mb-4"
              />
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">저장일: {new Date(selectedDrawing.created_at).toLocaleString()}</p>
              </div>

              {/* 이어서 색칠하기 버튼 (테마/색칠하기 그림에만) */}
              {(selectedDrawing.drawing_type === 'theme' || selectedDrawing.drawing_type === 'colored') && (
                <div className="mb-4">
                  <button
                    onClick={async () => {
                      try {
                        // 자동으로 가장 유사한 원본 이미지 찾기
                        const detectedImage = await findMostSimilarOriginalImage(selectedDrawing.image);
                        
                        const imageData = {
                          id: selectedDrawing.id,
                          filename: detectedImage.filename,
                          name: detectedImage.name,
                          coloredImage: selectedDrawing.image,
                          isContinue: true
                        };
                        
                        localStorage.setItem('selectedColorImage', JSON.stringify(imageData));
                        navigate('/draw/fillcanvas');
                      } catch (error) {
                        console.error('원본 이미지 자동 감지 실패:', error);
                        alert('원본 이미지를 자동으로 찾을 수 없습니다. 다시 시도해주세요.');
                      }
                    }}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    이어서 색칠하기
                  </button>
                </div>
              )}

              {/* 이어서 그리기 버튼 (분석 버튼을 누른 그림들용) */}
              {!selectedDrawing.analysis_result && selectedDrawing.drawing_type !== 'theme' && selectedDrawing.drawing_type !== 'colored' && (
                <div className="mb-4">
                  <button
                    onClick={() => {
                      // 저장된 그림 데이터를 로컬 스토리지에 저장하고 해당 그리기 페이지로 이동
                      localStorage.setItem('continueDrawing', JSON.stringify({
                        id: selectedDrawing.id,
                        image: selectedDrawing.image,
                        drawingType: selectedDrawing.drawing_type || 'normal'
                      }));
                      
                      // drawing_type에 따라 적절한 페이지로 이동
                      if (selectedDrawing.drawing_type === 'house' || !selectedDrawing.drawing_type) {
                        navigate('/draw/home');
                      } else if (selectedDrawing.drawing_type === 'tree') {
                        navigate('/draw/tree');
                      } else if (selectedDrawing.drawing_type === 'person') {
                        navigate('/draw/person');
                      } else {
                        // 기본값으로 집 그리기 페이지로 이동
                        navigate('/draw/home');
                      }
                    }}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    이어서 그리기
                  </button>
                </div>
              )}

              {selectedDrawing.analysis_result ? (
                <div className="border-t pt-4">
                  {/* AI 심리 분석 영역 - analysis.jsx와 동일한 디자인 */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                      AI 심리 분석
                    </h3>
                    <div className="w-full min-h-[150px] border-2 border-gray-800 rounded-lg p-4 bg-gray-50 text-sm text-gray-700 whitespace-pre-wrap text-left overflow-auto leading-relaxed">
                      {selectedDrawing.analysis_result.ai_analysis || 
                       selectedDrawing.analysis_result.speech_analysis || 
                       selectedDrawing.analysis_result.chatbot_analysis ||
                       'AI가 따뜻한 심리 분석을 준비하고 있습니다...'}
                      
                      {/* 디버깅 정보 */}
                      <div className="mt-4 p-2 bg-yellow-100 rounded text-xs">
                        <p><strong>디버깅:</strong></p>
                        <p>ai_analysis: {selectedDrawing.analysis_result.ai_analysis ? '있음' : '없음'}</p>
                        <p>speech_analysis: {selectedDrawing.analysis_result.speech_analysis ? '있음' : '없음'}</p>
                        <p>chatbot_analysis: {selectedDrawing.analysis_result.chatbot_analysis ? '있음' : '없음'}</p>
                        <p>전체 필드: {Object.keys(selectedDrawing.analysis_result).join(', ')}</p>
                      </div>
                    </div>
                  </div>

                  {/* 하단 버튼 영역 - analysis.jsx와 동일한 디자인 */}
                  <div className="flex gap-4 justify-center mt-6 mb-4">
                    {/* 마음코디네이터 찾기 버튼 */}
                    <button
                      onClick={() => navigate('/coordinator', { state: { from: 'gallery-detail', drawingId: selectedDrawing.id } })}
                      className="px-6 py-3 bg-green-500 text-white border-none rounded-full text-sm font-bold cursor-pointer shadow-md transition-all duration-200 hover:bg-green-600 hover:transform hover:-translate-y-0.5"
                    >
                      마음코디네이터 찾기
                    </button>

                    {/* 근처 상담센터 찾기 버튼 */}
                    <button
                      onClick={() => navigate('/counseling-center')}
                      className="px-6 py-3 bg-green-500 text-white border-none rounded-full text-sm font-bold cursor-pointer shadow-md transition-all duration-200 hover:bg-green-600 hover:transform hover:-translate-y-0.5"
                    >
                      근처 상담센터 찾기
                    </button>
                  </div>
                  
                  {/* 기존 구조 (objects, total_score, risk_level) 지원 */}
                  {selectedDrawing.analysis_result.objects && Object.entries(selectedDrawing.analysis_result.objects).map(([objType, objData]) => (
                    <div key={objType} className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-lg text-gray-800">{objData.label || objType}</h4>
                        {objData.score && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                            점수: {objData.score}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        {objData.interpretations && objData.interpretations.map((interp, index) => (
                          <div key={index} className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-gray-800">{interp.feature}</h5>
                              {interp.severity && (
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  interp.severity === '높음' ? 'bg-red-100 text-red-800' :
                                  interp.severity === '보통' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  심각도: {interp.severity}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">{interp.interpretation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {/* 전체 점수와 위험도 (기존 구조 지원) */}
                  {selectedDrawing.analysis_result.total_score && (
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
                      
                      {selectedDrawing.analysis_result.risk_level && (
                        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                          <div className="flex items-center mb-2">
                            <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                            <p className="text-sm font-medium text-red-700">위험도</p>
                          </div>
                          <p className="text-2xl font-bold text-red-800">{selectedDrawing.analysis_result.risk_level}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                </div>
              ) : (
                // 분석되지 않은 일반 그림에만 분석 메시지 표시 (테마/색칠하기 그림 제외)
                !selectedDrawing.analysis_result && selectedDrawing.drawing_type !== 'theme' && selectedDrawing.drawing_type !== 'colored' && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <p className="text-gray-500 text-lg font-medium">아직 분석되지 않은 그림입니다</p>
                        <p className="text-gray-400 text-sm mt-1">분석을 원하시면 아래 버튼을 눌러주세요</p>
                        <button
                          onClick={() => {
                            // 갤러리에서 온 경우임을 표시하고 분석 페이지로 이동
                            localStorage.setItem('drawnImage', selectedDrawing.image);
                            localStorage.setItem('continueDrawing', JSON.stringify({
                              id: selectedDrawing.id,
                              image: selectedDrawing.image,
                              drawingType: selectedDrawing.drawing_type || 'normal',
                              fromGallery: true
                            }));
                            navigate('/draw/analysis');
                          }}
                          className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          분석하기
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

      </main>

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
      `}</style>
    </div>
  );
}

export default MyGallery;
